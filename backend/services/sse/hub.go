package sse

import (
	"sync"

	"github.com/ikotun-dev/costrace/models"
)

type Hub struct {
	mu      sync.RWMutex
	clients map[string][]chan models.Trace
}

func NewHub() *Hub {
	return &Hub{
		clients: make(map[string][]chan models.Trace),
	}
}

func (h *Hub) Register(apiKeys []string, ch chan models.Trace) {
	h.mu.Lock()
	defer h.mu.Unlock()

	for _, key := range apiKeys {
		h.clients[key] = append(h.clients[key], ch)
	}
}

func (h *Hub) Unregister(apiKeys []string, ch chan models.Trace) {
	h.mu.Lock()
	defer h.mu.Unlock()

	for _, key := range apiKeys {
		clients := h.clients[key]
		for i, c := range clients {
			if c == ch {
				h.clients[key] = append(clients[:i], clients[i+1:]...)
				break
			}
		}
		if len(h.clients[key]) == 0 {
			delete(h.clients, key)
		}
	}
}

func (h *Hub) Broadcast(apiKey string, trace models.Trace) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for _, ch := range h.clients[apiKey] {
		select {
		case ch <- trace:
		default:
		}
	}
}
