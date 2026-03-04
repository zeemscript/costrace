package traces

import (
	"encoding/json"
	"log"
	"net"
	"net/http"
	"net/netip"
	"strconv"
	"strings"

	"github.com/ikotun-dev/costrace/models"
	budgetalerts "github.com/ikotun-dev/costrace/services/budget_alerts"
	"github.com/ikotun-dev/costrace/services/sse"
	"github.com/ikotun-dev/costrace/shared"
	"github.com/oschwald/geoip2-golang/v2"
	"gorm.io/gorm"
)

type TraceHandler struct {
	db  *gorm.DB
	hub *sse.Hub
}

func NewTraceHandler(db *gorm.DB, hub *sse.Hub) *TraceHandler {
	return &TraceHandler{
		db:  db,
		hub: hub,
	}
}

func (h *TraceHandler) CreateTrace(w http.ResponseWriter, r *http.Request) {
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
			"error": "Invalid JSON",
		})
		return
	}

	var apiKeyRecord models.APIKey
	if err := h.db.Where("key = ?", traceData.APIKey).First(&apiKeyRecord).Error; err != nil {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{
			"error": "Invalid API key",
		})
		return
	}

	ip := getRealIP(r)
	country, _ := getCountry(ip)

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
		Country:   country,
	}

	if err := h.db.Create(&trace).Error; err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to store trace",
		})
		return
	}

	go budgetalerts.CheckBudgetAlerts(h.db, &trace)

	if h.hub != nil {
		h.hub.Broadcast(trace.APIKey, trace)
	}

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

	var teamID *uint
	if teamIDStr := r.URL.Query().Get("team_id"); teamIDStr != "" {
		if tid, err := strconv.ParseUint(teamIDStr, 10, 64); err == nil && tid > 0 {
			tidUint := uint(tid)
			teamID = &tidUint
		}
	}

	keys, err := shared.GetScopedKeys(h.db, user, teamID)
	if err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to fetch API keys",
		})
		return
	}

	if len(keys) == 0 {
		shared.RespondJSON(w, http.StatusOK, map[string]any{
			"data": []models.Trace{}, "total": 0, "page": 1, "per_page": 50,
		})
		return
	}

	query := h.db.Where("api_key IN ?", keys)

	if apiKey := r.URL.Query().Get("api_key"); apiKey != "" {
		query = query.Where("api_key = ?", apiKey)
	}
	if provider := r.URL.Query().Get("provider"); provider != "" {
		query = query.Where("provider = ?", provider)
	}
	if status := r.URL.Query().Get("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if country := r.URL.Query().Get("country"); country != "" {
		query = query.Where("country = ?", country)
	}
	if from := r.URL.Query().Get("from"); from != "" {
		query = query.Where("created_at >= to_timestamp(?::bigint)", from)
	}

	var total int64
	query.Model(&models.Trace{}).Count(&total)

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

	shared.RespondJSON(w, http.StatusOK, map[string]any{
		"data":     traces,
		"total":    total,
		"page":     page,
		"per_page": perPage,
	})
}

func getRealIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		return strings.TrimSpace(strings.Split(xff, ",")[0])
	}
	if xri := r.Header.Get("X-Real-Ip"); xri != "" {
		return xri
	}
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

func getCountry(ip string) (string, error) {
	if ip == "127.0.0.1" || ip == "::1" || ip == "localhost" {
		return "Local", nil
	}

	db, err := geoip2.Open("GeoLite2-City.mmdb")
	if err != nil {
		log.Printf("Error opening geolite : %v", err.Error())
		return "", err
	}
	defer db.Close()

	addr, err := netip.ParseAddr(ip)
	if err != nil {
		return "", err
	}

	record, err := db.City(addr)
	if err != nil {
		return "", err
	}

	if !record.HasData() {
		return "", nil
	}

	return record.Country.Names.English, nil
}
