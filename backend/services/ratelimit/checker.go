package ratelimit

import (
	"fmt"
	"log"
	"time"

	"github.com/ikotun-dev/costrace/models"
	"github.com/ikotun-dev/costrace/services/email"
	"gorm.io/gorm"
)

// CheckRateLimit checks if a trace submission exceeds any rate limit rules for the API key.
// Returns true if the request should be allowed, false if it should be blocked.
func CheckRateLimit(db *gorm.DB, apiKey string) (bool, string) {
	var apiKeyRecord models.APIKey
	if err := db.Where("key = ?", apiKey).First(&apiKeyRecord).Error; err != nil {
		return true, "" // allow if key not found (will fail auth anyway)
	}

	var rule models.RateLimitRule
	if err := db.Where("api_key_id = ? AND enabled = true", apiKeyRecord.ID).First(&rule).Error; err != nil {
		return true, "" // no rate limit rule configured
	}

	// Check requests per minute
	oneMinuteAgo := time.Now().Add(-1 * time.Minute)
	var requestCount int64
	db.Model(&models.Trace{}).
		Where("api_key = ? AND created_at >= ?", apiKey, oneMinuteAgo).
		Count(&requestCount)

	if int(requestCount) >= rule.MaxRequestsMin {
		recordAbuseEvent(db, apiKeyRecord.UserID, apiKey, "rate_exceeded",
			fmt.Sprintf("Rate limit exceeded: %d requests/min (limit: %d)", requestCount, rule.MaxRequestsMin))

		if rule.AutoDisable {
			disableAPIKey(db, &apiKeyRecord)
		}

		return false, fmt.Sprintf("Rate limit exceeded: %d requests per minute allowed", rule.MaxRequestsMin)
	}

	// Check tokens per hour
	oneHourAgo := time.Now().Add(-1 * time.Hour)
	var tokenCount struct {
		Total int64
	}
	db.Model(&models.Trace{}).
		Where("api_key = ? AND created_at >= ?", apiKey, oneHourAgo).
		Select("COALESCE(SUM(tokens_in + tokens_out), 0) as total").
		Scan(&tokenCount)

	if int(tokenCount.Total) >= rule.MaxTokensHour {
		recordAbuseEvent(db, apiKeyRecord.UserID, apiKey, "token_exceeded",
			fmt.Sprintf("Token limit exceeded: %d tokens/hour (limit: %d)", tokenCount.Total, rule.MaxTokensHour))

		if rule.AutoDisable {
			disableAPIKey(db, &apiKeyRecord)
		}

		return false, fmt.Sprintf("Token limit exceeded: %d tokens per hour allowed", rule.MaxTokensHour)
	}

	return true, ""
}

// DetectAnomalies checks for unusual usage patterns after a trace is recorded.
func DetectAnomalies(db *gorm.DB, trace *models.Trace) {
	var apiKeyRecord models.APIKey
	if err := db.Where("key = ?", trace.APIKey).First(&apiKeyRecord).Error; err != nil {
		return
	}

	// Detect usage spike: compare last hour vs previous 24h average
	oneHourAgo := time.Now().Add(-1 * time.Hour)
	twentyFourHoursAgo := time.Now().Add(-24 * time.Hour)

	var lastHourCount int64
	db.Model(&models.Trace{}).
		Where("api_key = ? AND created_at >= ?", trace.APIKey, oneHourAgo).
		Count(&lastHourCount)

	var prev23hCount int64
	db.Model(&models.Trace{}).
		Where("api_key = ? AND created_at >= ? AND created_at < ?", trace.APIKey, twentyFourHoursAgo, oneHourAgo).
		Count(&prev23hCount)

	avgHourly := float64(prev23hCount) / 23.0
	if avgHourly > 0 && float64(lastHourCount) > avgHourly*5 {
		// Already recorded a spike event in the last hour? Skip.
		var recentSpike int64
		db.Model(&models.AbuseEvent{}).
			Where("api_key = ? AND type = 'spike' AND created_at >= ?", trace.APIKey, oneHourAgo).
			Count(&recentSpike)

		if recentSpike == 0 {
			recordAbuseEvent(db, apiKeyRecord.UserID, trace.APIKey, "spike",
				fmt.Sprintf("Usage spike detected: %d requests in last hour vs %.1f avg/hour", lastHourCount, avgHourly))

			// Send email notification
			var user models.User
			if err := db.First(&user, apiKeyRecord.UserID).Error; err == nil {
				email.SendSecurityAlert(user.Email, "Usage Spike Detected",
					fmt.Sprintf("Your API key has seen a %dx increase in usage. %d requests in the last hour vs %.1f average per hour.",
						int(float64(lastHourCount)/avgHourly), lastHourCount, avgHourly))
			}
		}
	}

	// Detect geographic anomaly: new country for this API key
	if trace.Country != "" && trace.Country != "Local" {
		var countryCount int64
		db.Model(&models.Trace{}).
			Where("api_key = ? AND country = ? AND id < ?", trace.APIKey, trace.Country, trace.ID).
			Count(&countryCount)

		if countryCount == 0 {
			// First time seeing this country for this key
			var totalTraces int64
			db.Model(&models.Trace{}).Where("api_key = ?", trace.APIKey).Count(&totalTraces)

			// Only flag if the key has had significant usage (not brand new)
			if totalTraces > 10 {
				recordAbuseEvent(db, apiKeyRecord.UserID, trace.APIKey, "geo_anomaly",
					fmt.Sprintf("New geographic location detected: %s (first request from this country)", trace.Country))
			}
		}
	}
}

func recordAbuseEvent(db *gorm.DB, userID uint, apiKey, eventType, details string) {
	event := models.AbuseEvent{
		UserID:  userID,
		APIKey:  apiKey,
		Type:    eventType,
		Details: details,
	}
	if err := db.Create(&event).Error; err != nil {
		log.Printf("Failed to record abuse event: %v", err)
	}
}

func disableAPIKey(db *gorm.DB, apiKey *models.APIKey) {
	log.Printf("Auto-disabling API key %d due to rate limit violation", apiKey.ID)

	var user models.User
	if err := db.First(&user, apiKey.UserID).Error; err == nil {
		email.SendSecurityAlert(user.Email, "API Key Auto-Disabled",
			fmt.Sprintf("Your API key '%s' has been automatically disabled due to rate limit violations. You can re-enable it from the dashboard.", apiKey.Name))
	}

	// Delete the key (equivalent to disabling since there's no enabled field)
	db.Delete(apiKey)
}
