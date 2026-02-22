package analytics

import (
	"net/http"
	"strconv"
	"time"

	"github.com/ikotun-dev/costrace/models"
	"github.com/ikotun-dev/costrace/shared"
	"gorm.io/gorm"
)

type AnalyticsHandler struct {
	db *gorm.DB
}

func NewAnalyticsHandler(db *gorm.DB) *AnalyticsHandler {
	return &AnalyticsHandler{db: db}
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

func getWorkspaceID(r *http.Request) *uint {
	if teamIDStr := r.URL.Query().Get("team_id"); teamIDStr != "" {
		if tid, err := strconv.ParseUint(teamIDStr, 10, 64); err == nil && tid > 0 {
			tidUint := uint(tid)
			return &tidUint
		}
	}
	return nil
}

type SummaryResponse struct {
	TotalCost    float64 `json:"total_cost"`
	TotalCalls   int64   `json:"total_calls"`
	TotalTokens  int64   `json:"total_tokens"`
	AvgLatencyMs float64 `json:"avg_latency_ms"`
}

func (h *AnalyticsHandler) Summary(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	teamID := getWorkspaceID(r)
	keys, err := shared.GetScopedKeys(h.db, user, teamID)
	if err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch API keys"})
		return
	}

	if len(keys) == 0 {
		shared.RespondJSON(w, http.StatusOK, SummaryResponse{})
		return
	}

	period := parsePeriod(r.URL.Query().Get("period"))

	var result SummaryResponse
	h.db.Model(&models.Trace{}).
		Where("api_key IN ? AND created_at >= ?", keys, period).
		Select("COALESCE(SUM(cost_usd), 0) as total_cost, COUNT(*) as total_calls, COALESCE(SUM(tokens_in + tokens_out), 0) as total_tokens, COALESCE(AVG(latency_ms), 0) as avg_latency_ms").
		Scan(&result)

	shared.RespondJSON(w, http.StatusOK, result)
}

type CostOverTimePoint struct {
	Date      string  `json:"date"`
	Cost      float64 `json:"cost"`
	Calls     int64   `json:"calls"`
	TokensIn  int64   `json:"tokens_in"`
	TokensOut int64   `json:"tokens_out"`
}

func (h *AnalyticsHandler) CostOverTime(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	teamID := getWorkspaceID(r)
	keys, err := shared.GetScopedKeys(h.db, user, teamID)
	if err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch API keys"})
		return
	}

	if len(keys) == 0 {
		shared.RespondJSON(w, http.StatusOK, []CostOverTimePoint{})
		return
	}

	period := parsePeriod(r.URL.Query().Get("period"))

	var points []CostOverTimePoint
	h.db.Model(&models.Trace{}).
		Where("api_key IN ? AND created_at >= ?", keys, period).
		Select("TO_CHAR(created_at, 'YYYY-MM-DD') as date, SUM(cost_usd) as cost, COUNT(*) as calls, SUM(tokens_in) as tokens_in, SUM(tokens_out) as tokens_out").
		Group("date").
		Order("date ASC").
		Scan(&points)

	if points == nil {
		points = []CostOverTimePoint{}
	}

	shared.RespondJSON(w, http.StatusOK, points)
}

type CostByModelPoint struct {
	Model     string  `json:"model"`
	Provider  string  `json:"provider"`
	Cost      float64 `json:"cost"`
	Calls     int64   `json:"calls"`
	TokensIn  int64   `json:"tokens_in"`
	TokensOut int64   `json:"tokens_out"`
}

func (h *AnalyticsHandler) CostByModel(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	teamID := getWorkspaceID(r)
	keys, err := shared.GetScopedKeys(h.db, user, teamID)
	if err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch API keys"})
		return
	}

	if len(keys) == 0 {
		shared.RespondJSON(w, http.StatusOK, []CostByModelPoint{})
		return
	}

	period := parsePeriod(r.URL.Query().Get("period"))

	var points []CostByModelPoint
	h.db.Model(&models.Trace{}).
		Where("api_key IN ? AND created_at >= ?", keys, period).
		Select("model, provider, SUM(cost_usd) as cost, COUNT(*) as calls, SUM(tokens_in) as tokens_in, SUM(tokens_out) as tokens_out").
		Group("model, provider").
		Order("cost DESC").
		Scan(&points)

	if points == nil {
		points = []CostByModelPoint{}
	}

	shared.RespondJSON(w, http.StatusOK, points)
}
