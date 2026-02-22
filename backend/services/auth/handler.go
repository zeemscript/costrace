package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/ikotun-dev/costrace/models"
	"github.com/ikotun-dev/costrace/services/email"
	"github.com/ikotun-dev/costrace/shared"
	"github.com/ikotun-dev/costrace/types"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"gorm.io/gorm"
)

type AuthHandler struct {
	db          *gorm.DB
	oauthConfig *oauth2.Config
	jwtSecret   []byte
	stateStore  map[string]time.Time
}

func NewAuthHandler(db *gorm.DB, config types.AuthConfig) *AuthHandler {
	return &AuthHandler{
		db: db,
		oauthConfig: &oauth2.Config{
			ClientID:     config.GitHubClientID,
			ClientSecret: config.GitHubClientSecret,
			RedirectURL:  config.GitHubRedirectURL,
			Scopes:       []string{"user:email"},
			Endpoint:     github.Endpoint,
		},
		jwtSecret:  config.JWTSecret,
		stateStore: make(map[string]time.Time),
	}
}

// GitHubLogin initiates the OAuth flow
func (h *AuthHandler) GitHubLogin(w http.ResponseWriter, r *http.Request) {
	state := generateState()
	h.stateStore[state] = time.Now().Add(10 * time.Minute)

	// Clean up expired states
	go h.cleanupExpiredStates()

	url := h.oauthConfig.AuthCodeURL(state, oauth2.AccessTypeOnline)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// GitHubCallback handles the OAuth callback from GitHub
func (h *AuthHandler) GitHubCallback(w http.ResponseWriter, r *http.Request) {
	state := r.URL.Query().Get("state")
	code := r.URL.Query().Get("code")

	// Validate state
	if _, exists := h.stateStore[state]; !exists {
		http.Error(w, "Invalid state parameter", http.StatusBadRequest)
		return
	}
	delete(h.stateStore, state)

	if code == "" {
		http.Error(w, "Code not found", http.StatusBadRequest)
		return
	}

	// Exchange code for token
	token, err := h.oauthConfig.Exchange(context.Background(), code)
	if err != nil {
		http.Error(w, "Failed to exchange token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Get user info from GitHub
	client := h.oauthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://api.github.com/user")
	if err != nil {
		http.Error(w, "Failed to get user info: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var githubUser types.GitHubUser
	if err := json.NewDecoder(resp.Body).Decode(&githubUser); err != nil {
		http.Error(w, "Failed to decode user info: "+err.Error(), http.StatusInternalServerError)
		return
	}

	//going to get the country of the user from the ip

	userIP := r.Header.Get("X-Forwarded-For")
	if userIP == "" {
		userIP = r.RemoteAddr
	}

	resp, _ = http.Get("https://ipapi.co/" + userIP + "/json/")
	log.Printf("Result from ipapii.co : ", resp)

	githubUser.Country = resp.Header.Get("country_name")

	if githubUser.Email == "" {
		emailResp, err := client.Get("https://api.github.com/user/emails")
		if err == nil {
			defer emailResp.Body.Close()
			var emails []struct {
				Email   string `json:"email"`
				Primary bool   `json:"primary"`
			}
			if json.NewDecoder(emailResp.Body).Decode(&emails) == nil {
				for _, e := range emails {
					if e.Primary {
						githubUser.Email = e.Email
						break
					}
				}
			}
		}
	}

	user, err := h.findOrCreateUser(githubUser)
	if err != nil {
		http.Error(w, "Failed to create user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	jwtToken, err := h.generateJWT(user)
	if err != nil {
		http.Error(w, "Failed to generate token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	userJSON, err := json.Marshal(user)
	if err != nil {
		http.Error(w, "Failed to encode user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	encoded := base64.RawURLEncoding.EncodeToString(userJSON)
	redirectURL := fmt.Sprintf(
		"%s/auth/callback?token=%s&user=%s",
		frontendURL,
		url.QueryEscape(jwtToken),
		url.QueryEscape(encoded),
	)

	log.Printf("redirecting user to frontend: %s", user.Username)
	http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
}

// RequestMagicLink sends a one-time login link to the given email address.
func (h *AuthHandler) RequestMagicLink(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Email is required"})
		return
	}

	// If the email belongs to a GitHub user, direct them to sign in with GitHub instead
	existingUser := h.findUserByEmail(req.Email)
	if existingUser != nil && existingUser.AuthType == models.Github {
		shared.RespondJSON(w, http.StatusForbidden, map[string]string{"error": "This email is linked to a GitHub account. Please sign in with GitHub."})
		return
	}

	// Invalidate any existing unused tokens for this email
	h.db.Where("email = ? AND used = false", req.Email).Delete(&models.MagicLinkTokens{})

	token := generateToken()
	magicLink := models.MagicLinkTokens{
		Email:     req.Email,
		Token:     token,
		ExpiresAt: time.Now().Add(15 * time.Minute),
	}

	if err := h.db.Create(&magicLink).Error; err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to generate login link"})
		return
	}

	go email.SendMagicLink(req.Email, token)

	shared.RespondJSON(w, http.StatusOK, map[string]string{"message": "Login link sent. Check your inbox."})
}
func (h *AuthHandler) findOrCreateUser(githubUser types.GitHubUser) (*models.User, error) {
	var user models.User
	githubIDStr := fmt.Sprintf("%d", githubUser.ID)

	// Try to find existing user by GitHub ID
	result := h.db.Where("github_id = ?", githubIDStr).First(&user)

	if result.Error == gorm.ErrRecordNotFound {
		// Create new user
		user = models.User{
			Email:     githubUser.Email,
			GithubID:  &githubIDStr,
			Username:  githubUser.Login,
			AvatarURL: githubUser.AvatarURL,
			Country:   githubUser.Country,
			AuthType:  models.Github,
		}

		if err := h.db.Create(&user).Error; err != nil {
			return nil, err
		}
	} else if result.Error != nil {
		return nil, result.Error
	} else {
		// Update existing user info
		user.Email = githubUser.Email
		user.Username = githubUser.Login
		user.AvatarURL = githubUser.AvatarURL
		h.db.Save(&user)
	}

	// Preload teams so the frontend gets the full list on login
	h.db.Preload("Teams").First(&user, user.ID)

	return &user, nil
}

func (h *AuthHandler) findUserByEmail(email string) *models.User {
	var user models.User
	if err := h.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil
	}
	return &user
}

func (h *AuthHandler) generateJWT(user *models.User) (string, error) {
	claims := types.Claims{
		UserID: user.ID,
		Email:  user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour * 7)), // 7 days
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(h.jwtSecret)
}

// GetCurrentUser returns the authenticated user's current data.
func (h *AuthHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	// Preload the user's teams via the many-to-many association
	if err := h.db.Preload("Teams").First(&user, user.ID).Error; err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to load user teams"})
		return
	}

	shared.RespondJSON(w, http.StatusOK, user)
}

// UpdateUser updates the authenticated user's profile (currently just email since git doesn't return the email).
func (h *AuthHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	var body struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}

	if body.Email == "" {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Email is required"})
		return
	}

	user.Email = body.Email
	if err := h.db.Save(user).Error; err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update user"})
		return
	}

	shared.RespondJSON(w, http.StatusOK, user)
}

// VerifyMagicLink validates a magic link token and issues a JWT, redirecting to the frontend.
func (h *AuthHandler) VerifyMagicLink(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "Token is required", http.StatusBadRequest)
		return
	}

	var magicLink models.MagicLinkTokens
	if err := h.db.Where("token = ? AND used = false", token).First(&magicLink).Error; err != nil {
		http.Error(w, "Invalid or expired login link", http.StatusUnauthorized)
		return
	}

	if time.Now().After(magicLink.ExpiresAt) {
		http.Error(w, "Login link has expired", http.StatusUnauthorized)
		return
	}

	// Mark token as used immediately to prevent replay
	h.db.Model(&magicLink).Update("used", true)

	user, err := h.findOrCreateEmailUser(magicLink.Email)
	if err != nil {
		http.Error(w, "Failed to authenticate user", http.StatusInternalServerError)
		return
	}

	jwtToken, err := h.generateJWT(user)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	userJSON, err := json.Marshal(user)
	if err != nil {
		http.Error(w, "Failed to encode user", http.StatusInternalServerError)
		return
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	encoded := base64.RawURLEncoding.EncodeToString(userJSON)
	redirectURL := fmt.Sprintf(
		"%s/auth/callback?token=%s&user=%s",
		frontendURL,
		url.QueryEscape(jwtToken),
		url.QueryEscape(encoded),
	)

	log.Printf("magic link login: %s", user.Email)
	http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
}

func (h *AuthHandler) findOrCreateEmailUser(emailAddr string) (*models.User, error) {
	var user models.User
	if err := h.db.Where("email = ?", emailAddr).First(&user).Error; err == nil {
		// Preload teams for existing user
		h.db.Preload("Teams").First(&user, user.ID)
		return &user, nil
	} else if err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Derive a username from the email (part before @)
	username := emailAddr
	if i := strings.IndexByte(emailAddr, '@'); i > 0 {
		username = emailAddr[:i]
	}

	user = models.User{
		Email:    emailAddr,
		Username: username,
		AuthType: models.Email,
	}
	if err := h.db.Create(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (h *AuthHandler) GetUserTeams(userId uint) ([]models.Team, error) {
	var teams []models.Team
	err := h.db.Model(&models.User{ID: userId}).Association("Teams").Find(&teams)
	return teams, err
}

func (h *AuthHandler) cleanupExpiredStates() {
	now := time.Now()
	for state, expiry := range h.stateStore {
		if now.After(expiry) {
			delete(h.stateStore, state)
		}
	}
}

func generateToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}
