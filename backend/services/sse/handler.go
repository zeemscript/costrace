package sse

import (
	"encoding/json"
	"fmt"
	"net/http"

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

	keys, err := shared.GetScopedKeys(h.db, user, nil)
	if err != nil || len(keys) == 0 {
		http.Error(w, err.Error(), http.StatusInternalServerError)
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

	fmt.Fprintf(w, "event: connected\ndata: {\"status\":\"connected\"}\n\n")
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
