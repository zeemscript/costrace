package billing

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/ikotun-dev/costrace/models"
	"github.com/ikotun-dev/costrace/shared"
	"gorm.io/gorm"
)

type BillingHandler struct {
	db *gorm.DB
}

func NewBillingHandler(db *gorm.DB) *BillingHandler {
	return &BillingHandler{db: db}
}

// Polar webhook payload structure
type polarWebhookPayload struct {
	Type string                 `json:"type"`
	Data map[string]interface{} `json:"data"`
}

// HandlePolarWebhook receives Polar webhook events directly from Polar
// and updates the user's plan and polar_customer_id accordingly.
func (h *BillingHandler) HandlePolarWebhook(w http.ResponseWriter, r *http.Request) {
	var payload polarWebhookPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		log.Printf("Failed to decode webhook payload: %v", err)
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}

	log.Printf("Received Polar webhook: type=%s", payload.Type)

	var email string
	var customerID string
	var subscriptionID string
	var plan models.PlanType
	var cancelAtPeriodEnd *bool
	var currentPeriodEnd *time.Time

	switch payload.Type {
	case "checkout.updated":
		// Handle checkout completion
		status, _ := payload.Data["status"].(string)
		if status != "succeeded" {
			// Ignore non-successful checkouts
			shared.RespondJSON(w, http.StatusOK, map[string]string{"status": "ignored"})
			return
		}

		email, _ = payload.Data["customer_email"].(string)
		customerID, _ = payload.Data["customer_id"].(string)

		// subscription_id might be null for one-time purchases
		if subID, ok := payload.Data["subscription_id"].(string); ok {
			subscriptionID = subID
		}

		// Successful checkout means premium plan
		plan = models.Premium
		f := false
		cancelAtPeriodEnd = &f

	case "subscription.created", "subscription.updated":
		// Handle subscription events
		if customer, ok := payload.Data["customer"].(map[string]interface{}); ok {
			email, _ = customer["email"].(string)
			customerID, _ = customer["id"].(string)
		}

		if subID, ok := payload.Data["id"].(string); ok {
			subscriptionID = subID
		}

		status, _ := payload.Data["status"].(string)
		if status == "active" {
			plan = models.Premium
		} else {
			plan = models.Free
		}

		// Track cancel_at_period_end from subscription data
		if capEnd, ok := payload.Data["cancel_at_period_end"].(bool); ok {
			cancelAtPeriodEnd = &capEnd
		}

		// Track current_period_end
		if cpEnd, ok := payload.Data["current_period_end"].(string); ok && cpEnd != "" {
			if t, err := time.Parse(time.RFC3339, cpEnd); err == nil {
				currentPeriodEnd = &t
			}
		}

	case "subscription.canceled":
		// Subscription set to cancel at period end — keep user on Premium
		if customer, ok := payload.Data["customer"].(map[string]interface{}); ok {
			email, _ = customer["email"].(string)
			customerID, _ = customer["id"].(string)
		}

		if subID, ok := payload.Data["id"].(string); ok {
			subscriptionID = subID
		}

		// Keep user on Premium — they paid through the end of the period
		plan = models.Premium
		t := true
		cancelAtPeriodEnd = &t

		// Track current_period_end
		if cpEnd, ok := payload.Data["current_period_end"].(string); ok && cpEnd != "" {
			if parsed, err := time.Parse(time.RFC3339, cpEnd); err == nil {
				currentPeriodEnd = &parsed
			}
		}

	case "subscription.revoked":
		// Subscription actually ended — downgrade to Free
		if customer, ok := payload.Data["customer"].(map[string]interface{}); ok {
			email, _ = customer["email"].(string)
			customerID, _ = customer["id"].(string)
		}

		if subID, ok := payload.Data["id"].(string); ok {
			subscriptionID = subID
		}

		plan = models.Free
		f := false
		cancelAtPeriodEnd = &f

	default:
		// Ignore other webhook types
		log.Printf("Ignoring webhook type: %s", payload.Type)
		shared.RespondJSON(w, http.StatusOK, map[string]string{"status": "ignored"})
		return
	}

	if email == "" {
		log.Printf("No email found in webhook payload")
		shared.RespondJSON(w, http.StatusBadRequest, map[string]string{"error": "Email is required"})
		return
	}

	var user models.User
	if err := h.db.Where("email = ?", email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("User not found for email: %s", email)
			shared.RespondJSON(w, http.StatusNotFound, map[string]string{"error": "User not found"})
			return
		}
		log.Printf("Database error: %v", err)
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Database error"})
		return
	}

	updates := map[string]any{
		"plan": plan,
	}
	if customerID != "" {
		updates["polar_customer_id"] = customerID
	}
	if subscriptionID != "" {
		updates["polar_subscription_id"] = subscriptionID
	}
	if cancelAtPeriodEnd != nil {
		updates["cancel_at_period_end"] = *cancelAtPeriodEnd
	}
	if currentPeriodEnd != nil {
		updates["current_period_end"] = *currentPeriodEnd
	}

	if err := h.db.Model(&user).Updates(updates).Error; err != nil {
		log.Printf("Failed to update user plan: %v", err)
		shared.RespondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update user"})
		return
	}

	log.Printf("Updated user %s plan to %s (event: %s)", email, plan, payload.Type)
	shared.RespondJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
