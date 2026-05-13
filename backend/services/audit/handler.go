package audit

import (
	"net/http"
	"strconv"

	"github.com/ikotun-dev/costrace/models"
	"github.com/ikotun-dev/costrace/shared"
	"gorm.io/gorm"
)

type AuditHandler struct {
	db *gorm.DB
}

func NewAuditHandler(db *gorm.DB) *AuditHandler {
	return &AuditHandler{db: db}
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

// ListAuditLogs returns audit log entries for the authenticated user.
func (h *AuditHandler) ListAuditLogs(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	teamID := parseTeamID(r)

	query := h.db.Model(&models.AuditLog{})
	if teamID == nil {
		query = query.Where("user_id = ? AND team_id IS NULL", user.ID)
	} else {
		query = query.Where("team_id = ?", *teamID)
	}

	if action := r.URL.Query().Get("action"); action != "" {
		query = query.Where("action = ?", action)
	}
	if resource := r.URL.Query().Get("resource"); resource != "" {
		query = query.Where("resource = ?", resource)
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
	query.Count(&total)

	var logs []models.AuditLog
	offset := (page - 1) * perPage
	if err := query.Order("created_at desc").Limit(perPage).Offset(offset).Find(&logs).Error; err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch audit logs"})
		return
	}

	shared.RespondJSON(w, http.StatusOK, map[string]any{
		"data":     logs,
		"total":    total,
		"page":     page,
		"per_page": perPage,
	})
}
