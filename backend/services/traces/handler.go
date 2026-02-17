package traces

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/ikotun-dev/costrace/models"
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
	apiKey := shared.GetAPIKey(r.Context())

	var traceData struct {
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

	// Create trace
	trace := models.Trace{
		APIKey:    apiKey,
		Provider:  traceData.Provider,
		Model:     traceData.Model,
		TokensIn:  traceData.TokensIn,
		TokensOut: traceData.TokensOut,
		LatencyMs: traceData.LatencyMs,
		CostUSD:   traceData.CostUSD,
		Status:    traceData.Status,
		Error:     traceData.Error,
		Timestamp: time.Unix(int64(traceData.Timestamp), 0),
	}

	if err := h.db.Create(&trace).Error; err != nil {
		log.Printf("Failed to insert trace: %v", err)
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "DB error",
		})
	}

	log.Printf("✅ Stored trace: %s | %s | %d tokens | $%.6f",
		trace.Provider, trace.Model, trace.TokensIn+trace.TokensOut, trace.CostUSD)

	shared.RespondJSON(w, http.StatusAccepted, map[string]string{
		"status": "ok",
	})
	// Implementation goes here
}
