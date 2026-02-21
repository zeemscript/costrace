package email

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type resendPayload struct {
	From    string `json:"from"`
	To      []string `json:"to"`
	Subject string `json:"subject"`
	HTML    string `json:"html"`
}

func SendBudgetAlert(to, alertName, currentSpend, threshold, period string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		log.Println("RESEND_API_KEY not set, skipping email")
		return nil
	}

	html := fmt.Sprintf(`
<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #10b981;">Costrace Budget Alert</h2>
  <p>Your budget alert <strong>%s</strong> has been triggered.</p>
  <table style="width: 100%%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 8px 0; color: #888;">Current Spend</td><td style="padding: 8px 0; font-weight: 600;">%s</td></tr>
    <tr><td style="padding: 8px 0; color: #888;">Threshold</td><td style="padding: 8px 0; font-weight: 600;">%s</td></tr>
    <tr><td style="padding: 8px 0; color: #888;">Period</td><td style="padding: 8px 0; font-weight: 600;">%s</td></tr>
  </table>
  <p style="color: #888; font-size: 13px;">You will not be notified again for this alert until the next %s period.</p>
</div>`, alertName, currentSpend, threshold, period, period)

	payload := resendPayload{
		From:    "Costrace Alerts <alerts@issueiq.dev>",
		To:      []string{to},
		Subject: fmt.Sprintf("Budget Alert: %s threshold reached", alertName),
		HTML:    html,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal email payload: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("create email request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("send email: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("resend API returned status %d", resp.StatusCode)
	}

	log.Printf("Budget alert email sent to %s for alert '%s'", to, alertName)
	return nil
}
