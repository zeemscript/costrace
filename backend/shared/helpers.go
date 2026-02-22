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

func RespondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// GetScopedKeys returns API key strings for a given workspace.
// Personal (teamID nil/0): keys where team_id IS NULL and user_id = current user.
// Team (teamID provided): keys where team_id = teamID.
func GetScopedKeys(db *gorm.DB, user *models.User, teamID *uint) ([]string, error) {
	var keys []string

	if teamID == nil || *teamID == 0 {
		// Personal workspace — only keys with no team
		err := db.Model(&models.APIKey{}).
			Where("user_id = ? AND team_id IS NULL", user.ID).
			Pluck("key", &keys).Error
		return keys, err
	}

	// Team workspace — only keys belonging to this team
	err := db.Model(&models.APIKey{}).
		Where("team_id = ?", *teamID).
		Pluck("key", &keys).Error
	return keys, err
}
