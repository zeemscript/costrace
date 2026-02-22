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

func SendMagicLink(to, token string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		log.Println("RESEND_API_KEY not set, skipping email")
		return nil
	}

	backendURL := os.Getenv("BACKEND_URL")
	if backendURL == "" {
		backendURL = "http://localhost:8080"
	}

	loginURL := fmt.Sprintf("%s/auth/magic-link/verify?token=%s", backendURL, token)

	html := fmt.Sprintf(`
<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #10b981;">Sign in to Costrace</h2>
  <p>Click the button below to sign in. This link expires in 15 minutes and can only be used once.</p>
  <a href="%s" style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Sign in to Costrace</a>
  <p style="color: #888; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
</div>`, loginURL)

	payload := resendPayload{
		From:    "Costrace <auth@issueiq.dev>",
		To:      []string{to},
		Subject: "Your Costrace login link",
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

	log.Printf("Magic link email sent to %s", to)
	return nil
}

func SendTeamInvitation(to, teamName, inviterName, token string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		log.Println("RESEND_API_KEY not set, skipping email")
		return nil
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	acceptURL := fmt.Sprintf("%s/teams/invite/%s", frontendURL, token)

	html := fmt.Sprintf(`
<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #10b981;">Costrace Team Invitation</h2>
  <p><strong>%s</strong> has invited you to join <strong>%s</strong> on Costrace.</p>
  <p>Join the team to share API keys, traces, analytics, and budget alerts.</p>
  <a href="%s" style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Accept Invitation</a>
  <p style="color: #888; font-size: 13px;">This invitation expires in 7 days. If you don't have a Costrace account, you'll be prompted to sign in with GitHub first.</p>
</div>`, inviterName, teamName, acceptURL)

	payload := resendPayload{
		From:    "Costrace <team@issueiq.dev>",
		To:      []string{to},
		Subject: fmt.Sprintf("%s invited you to join %s on Costrace", inviterName, teamName),
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

	log.Printf("Team invitation email sent to %s for team '%s'", to, teamName)
	return nil
}
