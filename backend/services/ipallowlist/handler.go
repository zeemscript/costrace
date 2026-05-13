package ipallowlist

import (
	"encoding/json"
	"net"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/ikotun-dev/costrace/models"
	"github.com/ikotun-dev/costrace/shared"
	"gorm.io/gorm"
)

type IPAllowlistHandler struct {
	db *gorm.DB
}

func NewIPAllowlistHandler(db *gorm.DB) *IPAllowlistHandler {
	return &IPAllowlistHandler{db: db}
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

// ListIPRules returns IP allowlist rules for a specific API key.
func (h *IPAllowlistHandler) ListIPRules(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	apiKeyID := r.URL.Query().Get("api_key_id")
	if apiKeyID == "" {
		// Return all rules for the user
		teamID := parseTeamID(r)
		var rules []models.IPAllowlist
		if teamID == nil {
			h.db.Where("user_id = ? AND team_id IS NULL", user.ID).Find(&rules)
		} else {
			h.db.Where("team_id = ?", *teamID).Find(&rules)
		}
		shared.RespondJSON(w, http.StatusOK, rules)
		return
	}

	// Verify the API key belongs to the user
	var apiKey models.APIKey
	if err := h.db.First(&apiKey, apiKeyID).Error; err != nil {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "API key not found"})
		return
	}
	if apiKey.UserID != user.ID {
		shared.RespondJSON(w, http.StatusForbidden, map[string]string{"error": "API key does not belong to you"})
		return
	}

	var rules []models.IPAllowlist
	h.db.Where("api_key_id = ?", apiKey.ID).Order("created_at desc").Find(&rules)
	shared.RespondJSON(w, http.StatusOK, rules)
}

// CreateIPRule adds a new IP/CIDR to the allowlist for an API key.
func (h *IPAllowlistHandler) CreateIPRule(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	var body struct {
		APIKeyID uint   `json:"api_key_id"`
		CIDR     string `json:"cidr"`
		Label    string `json:"label"`
		TeamID   *uint  `json:"team_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}

	if body.APIKeyID == 0 || body.CIDR == "" {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "api_key_id and cidr are required"})
		return
	}

	// Validate CIDR format
	if !isValidCIDROrIP(body.CIDR) {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid IP address or CIDR notation. Use format like '10.0.0.1/32' or '192.168.1.0/24'"})
		return
	}

	// Normalize single IPs to /32 CIDR
	if net.ParseIP(body.CIDR) != nil {
		body.CIDR = body.CIDR + "/32"
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

	// Check for duplicate
	var existing int64
	h.db.Model(&models.IPAllowlist{}).Where("api_key_id = ? AND cidr = ?", body.APIKeyID, body.CIDR).Count(&existing)
	if existing > 0 {
		shared.RespondJSON(w, http.StatusConflict, map[string]string{"error": "This IP/CIDR is already in the allowlist"})
		return
	}

	rule := models.IPAllowlist{
		UserID:   user.ID,
		TeamID:   body.TeamID,
		APIKeyID: body.APIKeyID,
		CIDR:     body.CIDR,
		Label:    body.Label,
	}

	if err := h.db.Create(&rule).Error; err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create IP rule"})
		return
	}

	shared.RespondJSON(w, http.StatusCreated, rule)
}

// DeleteIPRule removes an IP/CIDR from the allowlist.
func (h *IPAllowlistHandler) DeleteIPRule(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	id := chi.URLParam(r, "id")
	result := h.db.Where("id = ? AND user_id = ?", id, user.ID).Delete(&models.IPAllowlist{})
	if result.Error != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to delete IP rule"})
		return
	}
	if result.RowsAffected == 0 {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "IP rule not found"})
		return
	}

	shared.RespondJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

func isValidCIDROrIP(s string) bool {
	if net.ParseIP(s) != nil {
		return true
	}
	_, _, err := net.ParseCIDR(s)
	return err == nil
}
