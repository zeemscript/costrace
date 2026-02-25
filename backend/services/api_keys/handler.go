package apikeys

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/ikotun-dev/costrace/models"
	"github.com/ikotun-dev/costrace/shared"
	"gorm.io/gorm"
)

type ApiKeyHandler struct {
	db *gorm.DB
}

func NewApiKeyHandler(db *gorm.DB) *ApiKeyHandler {
	return &ApiKeyHandler{
		db: db,
	}
}

func parseTeamID(r *http.Request) *uint {
	if s := r.URL.Query().Get("team_id"); s != "" {
		if tid, err := strconv.ParseUint(s, 10, 64); err == nil && tid > 0 {
			v := uint(tid)
			return &v
		}
	}
	return nil
}

func (h *ApiKeyHandler) ListAPIKeys(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	teamID := parseTeamID(r)

	var keys []models.APIKey
	if teamID == nil {
		// Personal: keys with no team, owned by this user
		h.db.Where("user_id = ? AND team_id IS NULL", user.ID).Order("created_at desc").Find(&keys)
	} else {
		// Team: keys belonging to this team
		h.db.Where("team_id = ?", *teamID).Order("created_at desc").Find(&keys)
	}

	shared.RespondJSON(w, http.StatusOK, keys)
}

func (h *ApiKeyHandler) CreateAPIKey(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	var body struct {
		Name   string `json:"name"`
		TeamID *uint  `json:"team_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "A key name is required"})
		return
	}

	// If creating for a team, verify user is a member
	if body.TeamID != nil && *body.TeamID > 0 {
		var memberCount int64
		h.db.Model(&models.TeamMember{}).Where("team_id = ? AND user_id = ?", *body.TeamID, user.ID).Count(&memberCount)
		if memberCount == 0 {
			shared.RespondJSON(w, http.StatusForbidden, map[string]string{"error": "Not a member of this team"})
			return
		}
	} else {
		body.TeamID = nil

		// Plan restriction: free users limited to 1 personal API key
		if user.Plan == models.Free {
			var keyCount int64
			h.db.Model(&models.APIKey{}).Where("user_id = ? AND team_id IS NULL", user.ID).Count(&keyCount)
			if keyCount >= 1 {
				shared.RespondJSON(w, http.StatusForbidden, map[string]string{"error": "Free plan is limited to 1 API key. Upgrade to Pro for unlimited keys."})
				return
			}
		}
	}

	apiKey := models.APIKey{
		UserID: user.ID,
		TeamID: body.TeamID,
		Name:   body.Name,
		Key:    shared.GenerateAPIKey(),
	}

	if err := h.db.Create(&apiKey).Error; err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create API key"})
		return
	}

	shared.RespondJSON(w, http.StatusCreated, apiKey)
}

func (h *ApiKeyHandler) DeleteAPIKey(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	id := chi.URLParam(r, "id")
	teamID := parseTeamID(r)

	var result *gorm.DB
	if teamID == nil {
		// Personal: only delete own keys with no team
		result = h.db.Where("id = ? AND user_id = ? AND team_id IS NULL", id, user.ID).Delete(&models.APIKey{})
	} else {
		// Team: delete keys belonging to this team
		result = h.db.Where("id = ? AND team_id = ?", id, *teamID).Delete(&models.APIKey{})
	}

	if result.Error != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to delete API key"})
		return
	}
	if result.RowsAffected == 0 {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "API key not found"})
		return
	}

	shared.RespondJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}
