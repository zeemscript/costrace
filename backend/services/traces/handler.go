package traces

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/ikotun-dev/costrace/models"
	budgetalerts "github.com/ikotun-dev/costrace/services/budget_alerts"
	"github.com/ikotun-dev/costrace/shared"
	"gorm.io/gorm"
)

type TraceHandler struct {
	db *gorm.DB
}

func NewTraceHandler(db *gorm.DB) *TraceHandler {
	return &TraceHandler{
		db: db,
	}
}

func (h *TraceHandler) CreateTrace(w http.ResponseWriter, r *http.Request) {
	// apiKey := shared.GetAPIKey(r.Context())

	var traceData struct {
		APIKey    string  `json:"api_key"`
		Provider  string  `json:"provider"`
		Model     string  `json:"model"`
		TokensIn  int     `json:"tokens_in"`
		TokensOut int     `json:"tokens_out"`
		LatencyMs int     `json:"latency_ms"`
		CostUSD   float64 `json:"cost_usd"`
		Status    string  `json:"status"`
		Error     string  `json:"error"`
		Timestamp float64 `json:"timestamp"`
	}

	if err := json.NewDecoder(r.Body).Decode(&traceData); err != nil {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Invalid JSON: " + err.Error(),
		})
		return
	}

	// Validate the API key exists
	var apiKeyRecord models.APIKey
	if err := h.db.Where("key = ?", traceData.APIKey).First(&apiKeyRecord).Error; err != nil {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{
			"error": "Invalid API key",
		})
		return
	}

	// Create trace
	trace := models.Trace{
		APIKey:    traceData.APIKey,
		Provider:  traceData.Provider,
		Model:     traceData.Model,
		TokensIn:  traceData.TokensIn,
		TokensOut: traceData.TokensOut,
		LatencyMs: traceData.LatencyMs,
		CostUSD:   traceData.CostUSD,
		Status:    traceData.Status,
		Error:     traceData.Error,
		// Timestamp: time.Unix(int64(traceData.Timestamp), 0),
	}

	if err := h.db.Create(&trace).Error; err != nil {
		log.Printf("Failed to insert trace: %v", err)
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "DB error",
		})
		return
	}

	go budgetalerts.CheckBudgetAlerts(h.db, &trace)

	log.Printf("✅ Stored trace: %s | %s | %d tokens | $%.6f",
		trace.Provider, trace.Model, trace.TokensIn+trace.TokensOut, trace.CostUSD)

	shared.RespondJSON(w, http.StatusAccepted, map[string]string{
		"status": "ok",
	})
}

func (h *TraceHandler) ListTraces(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{
			"error": "Unauthorized",
		})
		return
	}

	// Get all API key strings belonging to this user
	var keys []string
	if err := h.db.Model(&models.APIKey{}).Where("user_id = ?", user.ID).Pluck("key", &keys).Error; err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to fetch API keys",
		})
		return
	}

	if len(keys) == 0 {
		shared.RespondJSON(w, http.StatusOK, map[string]interface{}{
			"data": []models.Trace{}, "total": 0, "page": 1, "per_page": 50,
		})
		return
	}

	query := h.db.Where("api_key IN ?", keys)

	// Optional filters
	if apiKey := r.URL.Query().Get("api_key"); apiKey != "" {
		query = query.Where("api_key = ?", apiKey)
	}
	if provider := r.URL.Query().Get("provider"); provider != "" {
		query = query.Where("provider = ?", provider)
	}
	if status := r.URL.Query().Get("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if from := r.URL.Query().Get("from"); from != "" {
		query = query.Where("created_at >= to_timestamp(?::bigint)", from)
	}

	// Count total matching rows
	var total int64
	query.Model(&models.Trace{}).Count(&total)

	// Pagination
	page := 1
	perPage := 50
	if p, err := strconv.Atoi(r.URL.Query().Get("page")); err == nil && p > 0 {
		page = p
	}
	if pp, err := strconv.Atoi(r.URL.Query().Get("per_page")); err == nil && pp > 0 && pp <= 100 {
		perPage = pp
	}
	offset := (page - 1) * perPage

	var traces []models.Trace
	if err := query.Order("created_at desc").Limit(perPage).Offset(offset).Find(&traces).Error; err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to fetch traces",
		})
		return
	}

	shared.RespondJSON(w, http.StatusOK, map[string]interface{}{
		"data":     traces,
		"total":    total,
		"page":     page,
		"per_page": perPage,
	})
}
