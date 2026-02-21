package apikeys

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/ikotun-dev/costrace/models"
	"github.com/ikotun-dev/costrace/shared"
	"gorm.io/gorm"
)

type ApiKeyHandler struct {
	db *gorm.DB
}

func NewApiKeyHandler(db *gorm.DB) *ApiKeyHandler {
	return &ApiKeyHandler{
		db: db,
	}
}

func (h *ApiKeyHandler) ListAPIKeys(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{
			"error": "Unauthorized",
		})
		return
	}

	var keys []models.APIKey
	if err := h.db.Where("user_id = ?", user.ID).Order("created_at desc").Find(&keys).Error; err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to fetch API keys",
		})
		return
	}

	shared.RespondJSON(w, http.StatusOK, keys)
}

func (h *ApiKeyHandler) CreateAPIKey(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{
			"error": "Unauthorized",
		})
		return
	}

	var body struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" {
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{
			"error": "A key name is required",
		})
		return
	}

	apiKey := models.APIKey{
		UserID: user.ID,
		Name:   body.Name,
		Key:    shared.GenerateAPIKey(),
	}

	if err := h.db.Create(&apiKey).Error; err != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to create API key",
		})
		return
	}

	shared.RespondJSON(w, http.StatusCreated, apiKey)
}

func (h *ApiKeyHandler) DeleteAPIKey(w http.ResponseWriter, r *http.Request) {
	user, ok := shared.GetUserFromContext(r.Context())
	if !ok {
		shared.RespondJSON(w, http.StatusUnauthorized, map[string]string{
			"error": "Unauthorized",
		})
		return
	}

	id := chi.URLParam(r, "id")

	result := h.db.Where("id = ? AND user_id = ?", id, user.ID).Delete(&models.APIKey{})
	if result.Error != nil {
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to delete API key",
		})
		return
	}

	if result.RowsAffected == 0 {
		shared.RespondJSON(w, http.StatusNotFound, map[string]string{
			"error": "API key not found",
		})
		return
	}

	shared.RespondJSON(w, http.StatusOK, map[string]string{
		"status": "deleted",
	})
}
