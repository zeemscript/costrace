package audit

import (
	"log"
	"net/http"

	"github.com/ikotun-dev/costrace/models"
	"gorm.io/gorm"
)

// LogAction records an audit log entry for a user action.
func LogAction(db *gorm.DB, userID uint, teamID *uint, action, resource, details string, r *http.Request) {
	entry := models.AuditLog{
		UserID:   userID,
		TeamID:   teamID,
		Action:   action,
		Resource: resource,
		Details:  details,
	}

	if r != nil {
		entry.IPAddress = getRealIP(r)
		entry.UserAgent = r.UserAgent()
	}

	if err := db.Create(&entry).Error; err != nil {
		log.Printf("Failed to create audit log: %v", err)
	}
}

func getRealIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		return xff
	}
	if xri := r.Header.Get("X-Real-Ip"); xri != "" {
		return xri
	}
	return r.RemoteAddr
}
