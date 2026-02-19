package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/ikotun-dev/costrace/models"
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

	// If email is not public, fetch it from emails endpoint
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

	w.Header().Set("Content-Type", "application/json")
	response := map[string]any{
		"token": jwtToken,
		"user": map[string]any{
			"id":         user.ID,
			"email":      user.Email,
			"username":   user.Username,
			"avatar_url": user.AvatarURL,
			"country":    user.Country,
		},
	}
	log.Printf("user that just completed auth : %v", response)
	json.NewEncoder(w).Encode(response)
}

func (h *AuthHandler) findOrCreateUser(githubUser types.GitHubUser) (*models.User, error) {
	var user models.User
	githubID := fmt.Sprintf("%d", githubUser.ID)

	// Try to find existing user by GitHub ID
	result := h.db.Where("github_id = ?", githubID).First(&user)

	if result.Error == gorm.ErrRecordNotFound {
		// Create new user
		apiKey := generateAPIKey()
		user = models.User{
			Email:     githubUser.Email,
			GithubID:  githubID,
			Username:  githubUser.Login,
			AvatarURL: githubUser.AvatarURL,
			APIKey:    apiKey,
			Country:   githubUser.Country,
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

	return &user, nil
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

func (h *AuthHandler) cleanupExpiredStates() {
	now := time.Now()
	for state, expiry := range h.stateStore {
		if now.After(expiry) {
			delete(h.stateStore, state)
		}
	}
}
