package sse

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/ikotun-dev/costrace/models"
	"github.com/ikotun-dev/costrace/shared"
	"gorm.io/gorm"
)

type SSEHandler struct {
	db  *gorm.DB
	hub *Hub
}

func NewSSEHandler(db *gorm.DB, hub *Hub) *SSEHandler {
	return &SSEHandler{
		db:  db,
		hub: hub,
	}
}

func (h *SSEHandler) StreamEvents(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var teamID *uint
	if tidStr := r.URL.Query().Get("team_id"); tidStr != "" {
		if tid, err := strconv.ParseUint(tidStr, 10, 64); err == nil && tid > 0 {
			tidUint := uint(tid)
			teamID = &tidUint
		}
	}

	keys, err := shared.GetScopedKeys(h.db, user, teamID)
	if err != nil || len(keys) == 0 {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	const maxSSEConnsPerUser = 5
	if h.hub.ConnectionCount(keys) >= maxSSEConnsPerUser {
		log.Printf("User %s reached max connections", user.ID)
		http.Error(w, "Max connections reached", http.StatusTooManyRequests)
		return
	}

	//check if streaming is supported
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming not supported", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	ch := make(chan models.Trace, 64)
	h.hub.Register(keys, ch)
	defer func() {
		h.hub.Unregister(keys, ch)
		close(ch)
	}()

	fmt.Fprintf(w, "event: connected\ndata: {\"status for stream\":\"connected\"}\n\n")
	flusher.Flush()
	ctx := r.Context()

	for {
		select {
		case <-ctx.Done():
			return
		case trace := <-ch:
			data, err := json.Marshal(trace)
			if err != nil {
				continue
			}
			fmt.Fprintf(w, "event: trace\ndata: %s\n\n", data)
			flusher.Flush()
		}
	}
}
