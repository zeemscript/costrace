package budgetalerts

import (
	"fmt"
	"log"
	"time"

	"github.com/ikotun-dev/costrace/models"
	"github.com/ikotun-dev/costrace/services/email"
	"gorm.io/gorm"
)

func CheckBudgetAlerts(db *gorm.DB, trace *models.Trace) {
	// Find the user who owns this API key
	var apiKey models.APIKey
	if err := db.Where("key = ?", trace.APIKey).First(&apiKey).Error; err != nil {
		log.Printf("Budget alert check: could not find API key owner: %v", err)
		return
	}

	// Get the user's email
	var user models.User
	if err := db.First(&user, apiKey.UserID).Error; err != nil {
		log.Printf("Budget alert check: could not find user %d: %v", apiKey.UserID, err)
		return
	}

	// Load all enabled alerts for this user
	var alerts []models.BudgetAlert
	if err := db.Where("user_id = ? AND enabled = ?", apiKey.UserID, true).Find(&alerts).Error; err != nil {
		log.Printf("Budget alert check: could not load alerts: %v", err)
		return
	}

	if len(alerts) == 0 {
		return
	}

	// Get all API keys for this user (needed for general/model scope queries)
	var userKeys []string
	if err := db.Model(&models.APIKey{}).Where("user_id = ?", apiKey.UserID).Pluck("key", &userKeys).Error; err != nil {
		log.Printf("Budget alert check: could not load user keys: %v", err)
		return
	}

	for _, alert := range alerts {
		periodStart := getPeriodStart(alert.Period)

		// Skip if already triggered in this period
		if alert.LastTriggeredAt != nil && alert.LastTriggeredAt.After(periodStart) {
			continue
		}

		spend := computeSpend(db, alert, userKeys, periodStart)

		if spend >= alert.ThresholdUSD {
			err := email.SendBudgetAlert(
				user.Email,
				alert.Name,
				fmt.Sprintf("$%.2f", spend),
				fmt.Sprintf("$%.2f", alert.ThresholdUSD),
				alert.Period,
			)
			if err != nil {
				log.Printf("Budget alert check: failed to send email for alert %d: %v", alert.ID, err)
			}

			now := time.Now()
			db.Model(&alert).Update("last_triggered_at", now)
			log.Printf("Budget alert triggered: '%s' (spend $%.2f >= threshold $%.2f)", alert.Name, spend, alert.ThresholdUSD)
		}
	}
}

func computeSpend(db *gorm.DB, alert models.BudgetAlert, userKeys []string, periodStart time.Time) float64 {
	var spend float64

	switch alert.Scope {
	case "general":
		db.Model(&models.Trace{}).
			Where("api_key IN ? AND created_at >= ?", userKeys, periodStart).
			Select("COALESCE(SUM(cost_usd), 0)").
			Scan(&spend)
	case "api_key":
		db.Model(&models.Trace{}).
			Where("api_key = ? AND created_at >= ?", alert.ScopeValue, periodStart).
			Select("COALESCE(SUM(cost_usd), 0)").
			Scan(&spend)
	case "model":
		db.Model(&models.Trace{}).
			Where("api_key IN ? AND model = ? AND created_at >= ?", userKeys, alert.ScopeValue, periodStart).
			Select("COALESCE(SUM(cost_usd), 0)").
			Scan(&spend)
	}

	return spend
}

func getPeriodStart(period string) time.Time {
	now := time.Now()
	switch period {
	case "daily":
		return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	case "weekly":
		weekday := int(now.Weekday())
		if weekday == 0 {
			weekday = 7
		}
		start := now.AddDate(0, 0, -(weekday - 1))
		return time.Date(start.Year(), start.Month(), start.Day(), 0, 0, 0, 0, now.Location())
	default: // monthly
		return time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	}
}
