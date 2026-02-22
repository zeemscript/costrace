package budgetalerts

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/ikotun-dev/costrace/models"
	"github.com/ikotun-dev/costrace/shared"
	"gorm.io/gorm"
)

type BudgetAlertHandler struct {
	db *gorm.DB
}

func NewBudgetAlertHandler(db *gorm.DB) *BudgetAlertHandler {
	return &BudgetAlertHandler{db: db}
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

func (h *BudgetAlertHandler) ListBudgetAlerts(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	teamID := parseTeamID(r)

	var alerts []models.BudgetAlert
	if teamID == nil {
		// Personal: alerts with no team, owned by this user
		h.db.Where("user_id = ? AND team_id IS NULL", user.ID).Order("created_at desc").Find(&alerts)
	} else {
		// Team: alerts belonging to this team
		h.db.Where("team_id = ?", *teamID).Order("created_at desc").Find(&alerts)
	}

	shared.RespondJSON(w, http.StatusOK, alerts)
}

func (h *BudgetAlertHandler) CreateBudgetAlert(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	var body struct {
		Name         string  `json:"name"`
		Scope        string  `json:"scope"`
		ScopeValue   string  `json:"scope_value"`
		ThresholdUSD float64 `json:"threshold_usd"`
		Period       string  `json:"period"`
		TeamID       *uint   `json:"team_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}

	if body.Name == "" {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Name is required"})
		return
	}

	validScopes := map[string]bool{"general": true, "api_key": true, "model": true}
	if !validScopes[body.Scope] {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Scope must be general, api_key, or model"})
		return
	}

	if body.Scope != "general" && body.ScopeValue == "" {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "scope_value is required for api_key and model scopes"})
		return
	}

	validPeriods := map[string]bool{"daily": true, "weekly": true, "monthly": true}
	if body.Period == "" {
		body.Period = "monthly"
	}
	if !validPeriods[body.Period] {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Period must be daily, weekly, or monthly"})
		return
	}

	if body.ThresholdUSD <= 0 {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Threshold must be greater than 0"})
		return
	}

	// If creating for a team, verify membership
	if body.TeamID != nil && *body.TeamID > 0 {
		var memberCount int64
		h.db.Model(&models.TeamMember{}).Where("team_id = ? AND user_id = ?", *body.TeamID, user.ID).Count(&memberCount)
		if memberCount == 0 {
			shared.RespondJSON(w, http.StatusForbidden, map[string]string{"error": "Not a member of this team"})
			return
		}
	} else {
		body.TeamID = nil
	}

	alert := models.BudgetAlert{
		UserID:       user.ID,
		TeamID:       body.TeamID,
		Name:         body.Name,
		Scope:        body.Scope,
		ScopeValue:   body.ScopeValue,
		ThresholdUSD: body.ThresholdUSD,
		Period:       body.Period,
		Enabled:      true,
	}

	if err := h.db.Create(&alert).Error; err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create budget alert"})
		return
	}

	shared.RespondJSON(w, http.StatusCreated, alert)
}

func (h *BudgetAlertHandler) UpdateBudgetAlert(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	id := chi.URLParam(r, "id")
	teamID := parseTeamID(r)

	var alert models.BudgetAlert
	if teamID == nil {
		if err := h.db.Where("id = ? AND user_id = ? AND team_id IS NULL", id, user.ID).First(&alert).Error; err != nil {
			shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Budget alert not found"})
			return
		}
	} else {
		if err := h.db.Where("id = ? AND team_id = ?", id, *teamID).First(&alert).Error; err != nil {
			shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Budget alert not found"})
			return
		}
	}

	var body struct {
		Name         *string  `json:"name"`
		ThresholdUSD *float64 `json:"threshold_usd"`
		Period       *string  `json:"period"`
		Enabled      *bool    `json:"enabled"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}

	if body.Name != nil {
		alert.Name = *body.Name
	}
	if body.ThresholdUSD != nil {
		if *body.ThresholdUSD <= 0 {
			shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Threshold must be greater than 0"})
			return
		}
		alert.ThresholdUSD = *body.ThresholdUSD
	}
	if body.Period != nil {
		validPeriods := map[string]bool{"daily": true, "weekly": true, "monthly": true}
		if !validPeriods[*body.Period] {
			shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Period must be daily, weekly, or monthly"})
			return
		}
		alert.Period = *body.Period
	}
	if body.Enabled != nil {
		alert.Enabled = *body.Enabled
	}

	if err := h.db.Save(&alert).Error; err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update budget alert"})
		return
	}

	shared.RespondJSON(w, http.StatusOK, alert)
}

func (h *BudgetAlertHandler) DeleteBudgetAlert(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	id := chi.URLParam(r, "id")
	teamID := parseTeamID(r)

	var result *gorm.DB
	if teamID == nil {
		result = h.db.Where("id = ? AND user_id = ? AND team_id IS NULL", id, user.ID).Delete(&models.BudgetAlert{})
	} else {
		result = h.db.Where("id = ? AND team_id = ?", id, *teamID).Delete(&models.BudgetAlert{})
	}

	if result.Error != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to delete budget alert"})
		return
	}
	if result.RowsAffected == 0 {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Budget alert not found"})
		return
	}

	shared.RespondJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}
