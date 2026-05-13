package ratelimit

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/ikotun-dev/costrace/models"
	"github.com/ikotun-dev/costrace/shared"
	"gorm.io/gorm"
)

type RateLimitHandler struct {
	db *gorm.DB
}

func NewRateLimitHandler(db *gorm.DB) *RateLimitHandler {
	return &RateLimitHandler{db: db}
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

// ListRateLimits returns rate limit rules for the user's API keys.
func (h *RateLimitHandler) ListRateLimits(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	teamID := parseTeamID(r)
	var rules []models.RateLimitRule
	if teamID == nil {
		h.db.Where("user_id = ? AND team_id IS NULL", user.ID).Find(&rules)
	} else {
		h.db.Where("team_id = ?", *teamID).Find(&rules)
	}

	shared.RespondJSON(w, http.StatusOK, rules)
}

// CreateRateLimit creates a new rate limit rule for an API key.
func (h *RateLimitHandler) CreateRateLimit(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	var body struct {
		APIKeyID       uint  `json:"api_key_id"`
		MaxRequestsMin int   `json:"max_requests_min"`
		MaxTokensHour  int   `json:"max_tokens_hour"`
		AutoDisable    bool  `json:"auto_disable"`
		TeamID         *uint `json:"team_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}

	if body.APIKeyID == 0 {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "api_key_id is required"})
		return
	}

	// Verify the API key belongs to the user
	var apiKey models.APIKey
	if err := h.db.First(&apiKey, body.APIKeyID).Error; err != nil {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "API key not found"})
		return
	}
	if apiKey.UserID != user.ID {
		shared.RespondJSON(w, http.StatusForbidden, map[string]string{"error": "API key does not belong to you"})
		return
	}

	// Check if a rule already exists for this key
	var existing int64
	h.db.Model(&models.RateLimitRule{}).Where("api_key_id = ?", body.APIKeyID).Count(&existing)
	if existing > 0 {
		shared.RespondJSON(w, http.StatusConflict, map[string]string{"error": "Rate limit rule already exists for this API key"})
		return
	}

	if body.MaxRequestsMin <= 0 {
		body.MaxRequestsMin = 60
	}
	if body.MaxTokensHour <= 0 {
		body.MaxTokensHour = 1000000
	}

	rule := models.RateLimitRule{
		UserID:         user.ID,
		TeamID:         body.TeamID,
		APIKeyID:       body.APIKeyID,
		MaxRequestsMin: body.MaxRequestsMin,
		MaxTokensHour:  body.MaxTokensHour,
		Enabled:        true,
		AutoDisable:    body.AutoDisable,
	}

	if err := h.db.Create(&rule).Error; err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create rate limit"})
		return
	}

	shared.RespondJSON(w, http.StatusCreated, rule)
}

// UpdateRateLimit updates an existing rate limit rule.
func (h *RateLimitHandler) UpdateRateLimit(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	id := chi.URLParam(r, "id")
	var rule models.RateLimitRule
	if err := h.db.Where("id = ? AND user_id = ?", id, user.ID).First(&rule).Error; err != nil {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Rate limit not found"})
		return
	}

	var body struct {
		MaxRequestsMin *int  `json:"max_requests_min"`
		MaxTokensHour  *int  `json:"max_tokens_hour"`
		Enabled        *bool `json:"enabled"`
		AutoDisable    *bool `json:"auto_disable"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}

	if body.MaxRequestsMin != nil && *body.MaxRequestsMin > 0 {
		rule.MaxRequestsMin = *body.MaxRequestsMin
	}
	if body.MaxTokensHour != nil && *body.MaxTokensHour > 0 {
		rule.MaxTokensHour = *body.MaxTokensHour
	}
	if body.Enabled != nil {
		rule.Enabled = *body.Enabled
	}
	if body.AutoDisable != nil {
		rule.AutoDisable = *body.AutoDisable
	}

	if err := h.db.Save(&rule).Error; err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update rate limit"})
		return
	}

	shared.RespondJSON(w, http.StatusOK, rule)
}

// DeleteRateLimit deletes a rate limit rule.
func (h *RateLimitHandler) DeleteRateLimit(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	id := chi.URLParam(r, "id")
	result := h.db.Where("id = ? AND user_id = ?", id, user.ID).Delete(&models.RateLimitRule{})
	if result.Error != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to delete rate limit"})
		return
	}
	if result.RowsAffected == 0 {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Rate limit not found"})
		return
	}

	shared.RespondJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

// ListAbuseEvents returns abuse/anomaly events for the user.
func (h *RateLimitHandler) ListAbuseEvents(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	page := 1
	perPage := 50
	if p, err := strconv.Atoi(r.URL.Query().Get("page")); err == nil && p > 0 {
		page = p
	}
	if pp, err := strconv.Atoi(r.URL.Query().Get("per_page")); err == nil && pp > 0 && pp <= 100 {
		perPage = pp
	}

	var total int64
	h.db.Model(&models.AbuseEvent{}).Where("user_id = ?", user.ID).Count(&total)

	var events []models.AbuseEvent
	offset := (page - 1) * perPage
	h.db.Where("user_id = ?", user.ID).Order("created_at desc").Limit(perPage).Offset(offset).Find(&events)

	shared.RespondJSON(w, http.StatusOK, map[string]any{
		"data":     events,
		"total":    total,
		"page":     page,
		"per_page": perPage,
	})
}
