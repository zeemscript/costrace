package shared

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"

	"github.com/ikotun-dev/costrace/models"
	"gorm.io/gorm"
)

func GenerateAPIKey() string {
	b := make([]byte, 32)
	rand.Read(b)
	return "ct_" + hex.EncodeToString(b)
}

func RespondJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func GetScopedKeys(db *gorm.DB, user *models.User, teamID *uint) ([]string, error) {
	var keys []string

	if teamID == nil || *teamID == 0 {
		err := db.Model(&models.APIKey{}).
			Where("user_id = ? AND team_id IS NULL", user.ID).
			Pluck("key", &keys).Error
		return keys, err
	}

	err := db.Model(&models.APIKey{}).
		Where("team_id = ?", *teamID).
		Pluck("key", &keys).Error
	return keys, err
}
