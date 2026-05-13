package ipallowlist

import (
	"log"
	"net"

	"github.com/ikotun-dev/costrace/models"
	"gorm.io/gorm"
)

// CheckIPAllowed checks if a request IP is allowed for the given API key.
// Returns true if:
//   - No allowlist rules exist for this key (open access)
//   - The IP matches one of the CIDR rules
//
// Returns false if rules exist but the IP doesn't match any.
func CheckIPAllowed(db *gorm.DB, apiKey string, ip string) (bool, string) {
	var apiKeyRecord models.APIKey
	if err := db.Where("key = ?", apiKey).First(&apiKeyRecord).Error; err != nil {
		return true, "" // key not found, will fail auth anyway
	}

	var rules []models.IPAllowlist
	if err := db.Where("api_key_id = ?", apiKeyRecord.ID).Find(&rules).Error; err != nil {
		log.Printf("IP allowlist check error: %v", err)
		return true, "" // fail open on DB error
	}

	if len(rules) == 0 {
		return true, "" // no rules = open access
	}

	requestIP := net.ParseIP(ip)
	if requestIP == nil {
		return false, "Could not parse request IP address"
	}

	for _, rule := range rules {
		_, network, err := net.ParseCIDR(rule.CIDR)
		if err != nil {
			// Try as single IP
			allowedIP := net.ParseIP(rule.CIDR)
			if allowedIP != nil && allowedIP.Equal(requestIP) {
				return true, ""
			}
			continue
		}

		if network.Contains(requestIP) {
			return true, ""
		}
	}

	return false, "IP address not in allowlist"
}
