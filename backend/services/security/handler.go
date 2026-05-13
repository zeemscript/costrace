package security

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/ikotun-dev/costrace/models"
	"github.com/ikotun-dev/costrace/shared"
	"gorm.io/gorm"
)

type SecurityHandler struct {
	db *gorm.DB
}

func NewSecurityHandler(db *gorm.DB) *SecurityHandler {
	return &SecurityHandler{db: db}
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

func parsePeriod(period string) time.Time {
	switch period {
	case "7d":
		return time.Now().AddDate(0, 0, -7)
	case "90d":
		return time.Now().AddDate(0, 0, -90)
	default:
		return time.Now().AddDate(0, 0, -30)
	}
}

// ScanTrace scans a trace's error field for security issues and stores alerts.
func ScanTrace(db *gorm.DB, trace *models.Trace) {
	results := ScanText(trace.Error)
	if len(results) == 0 {
		return
	}

	var apiKey models.APIKey
	if err := db.Where("key = ?", trace.APIKey).First(&apiKey).Error; err != nil {
		log.Printf("Security scan: could not find API key owner: %v", err)
		return
	}

	for _, result := range results {
		alert := models.SecurityAlert{
			UserID:      apiKey.UserID,
			TeamID:      apiKey.TeamID,
			TraceID:     trace.ID,
			APIKey:      trace.APIKey,
			Type:        models.AlertType(result.Type),
			Severity:    models.AlertSeverity(result.Severity),
			Title:       result.Title,
			Description: result.Description,
			Pattern:     result.Pattern,
		}
		if err := db.Create(&alert).Error; err != nil {
			log.Printf("Security scan: failed to create alert: %v", err)
		}
	}

	log.Printf("Security scan: found %d issues in trace %d", len(results), trace.ID)
}

// ListAlerts returns security alerts for the authenticated user.
func (h *SecurityHandler) ListAlerts(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	teamID := parseTeamID(r)
	period := parsePeriod(r.URL.Query().Get("period"))

	query := h.db.Where("created_at >= ?", period)
	if teamID == nil {
		query = query.Where("user_id = ? AND team_id IS NULL", user.ID)
	} else {
		query = query.Where("team_id = ?", *teamID)
	}

	if alertType := r.URL.Query().Get("type"); alertType != "" {
		query = query.Where("type = ?", alertType)
	}
	if severity := r.URL.Query().Get("severity"); severity != "" {
		query = query.Where("severity = ?", severity)
	}
	if resolved := r.URL.Query().Get("resolved"); resolved != "" {
		query = query.Where("resolved = ?", resolved == "true")
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
	query.Model(&models.SecurityAlert{}).Count(&total)

	var alerts []models.SecurityAlert
	offset := (page - 1) * perPage
	if err := query.Order("created_at desc").Limit(perPage).Offset(offset).Find(&alerts).Error; err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch security alerts"})
		return
	}

	shared.RespondJSON(w, http.StatusOK, map[string]any{
		"data":     alerts,
		"total":    total,
		"page":     page,
		"per_page": perPage,
	})
}

// SecuritySummary returns aggregated security metrics.
func (h *SecurityHandler) SecuritySummary(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	teamID := parseTeamID(r)
	period := parsePeriod(r.URL.Query().Get("period"))

	baseQuery := h.db.Model(&models.SecurityAlert{}).Where("created_at >= ?", period)
	if teamID == nil {
		baseQuery = baseQuery.Where("user_id = ? AND team_id IS NULL", user.ID)
	} else {
		baseQuery = baseQuery.Where("team_id = ?", *teamID)
	}

	var totalAlerts int64
	baseQuery.Count(&totalAlerts)

	var unresolvedAlerts int64
	h.db.Model(&models.SecurityAlert{}).Where("created_at >= ? AND resolved = false", period).
		Where(h.scopeCondition(user.ID, teamID)).Count(&unresolvedAlerts)

	type severityCount struct {
		Severity string `json:"severity"`
		Count    int64  `json:"count"`
	}
	var bySeverity []severityCount
	h.db.Model(&models.SecurityAlert{}).Where("created_at >= ?", period).
		Where(h.scopeCondition(user.ID, teamID)).
		Select("severity, COUNT(*) as count").
		Group("severity").
		Scan(&bySeverity)

	type typeCount struct {
		Type  string `json:"type"`
		Count int64  `json:"count"`
	}
	var byType []typeCount
	h.db.Model(&models.SecurityAlert{}).Where("created_at >= ?", period).
		Where(h.scopeCondition(user.ID, teamID)).
		Select("type, COUNT(*) as count").
		Group("type").
		Scan(&byType)

	if bySeverity == nil {
		bySeverity = []severityCount{}
	}
	if byType == nil {
		byType = []typeCount{}
	}

	shared.RespondJSON(w, http.StatusOK, map[string]any{
		"total_alerts":      totalAlerts,
		"unresolved_alerts": unresolvedAlerts,
		"by_severity":       bySeverity,
		"by_type":           byType,
	})
}

func (h *SecurityHandler) scopeCondition(userID uint, teamID *uint) string {
	if teamID == nil {
		return fmt.Sprintf("user_id = %d AND team_id IS NULL", userID)
	}
	return fmt.Sprintf("team_id = %d", *teamID)
}

// ResolveAlert marks a security alert as resolved.
func (h *SecurityHandler) ResolveAlert(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	id := chi.URLParam(r, "id")

	var alert models.SecurityAlert
	if err := h.db.Where("id = ? AND user_id = ?", id, user.ID).First(&alert).Error; err != nil {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "Alert not found"})
		return
	}

	var body struct {
		Resolved bool `json:"resolved"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}

	alert.Resolved = body.Resolved
	if body.Resolved {
		now := time.Now()
		alert.ResolvedAt = &now
	} else {
		alert.ResolvedAt = nil
	}

	if err := h.db.Save(&alert).Error; err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update alert"})
		return
	}

	shared.RespondJSON(w, http.StatusOK, alert)
}
