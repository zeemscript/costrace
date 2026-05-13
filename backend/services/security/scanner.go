package security

import (
	"fmt"
	"regexp"
	"strings"
)

type ScanResult struct {
	Type        string // "prompt_injection" or "data_leak"
	Severity    string // "low", "medium", "high", "critical"
	Title       string
	Description string
	Pattern     string
}

// promptInjectionPatterns defines regex patterns that indicate prompt injection attempts.
var promptInjectionPatterns = []struct {
	Pattern  *regexp.Regexp
	Severity string
	Title    string
}{
	{
		Pattern:  regexp.MustCompile(`(?i)ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|guidelines?)`),
		Severity: "critical",
		Title:    "Prompt injection: ignore previous instructions",
	},
	{
		Pattern:  regexp.MustCompile(`(?i)disregard\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|guidelines?)`),
		Severity: "critical",
		Title:    "Prompt injection: disregard instructions",
	},
	{
		Pattern:  regexp.MustCompile(`(?i)you\s+are\s+now\s+(a|an|in)\s+`),
		Severity: "high",
		Title:    "Prompt injection: role reassignment",
	},
	{
		Pattern:  regexp.MustCompile(`(?i)forget\s+(everything|all|your)\s+(you|instructions?|rules?|training)`),
		Severity: "critical",
		Title:    "Prompt injection: memory wipe attempt",
	},
	{
		Pattern:  regexp.MustCompile(`(?i)(system\s*prompt|system\s*message)\s*[:=]`),
		Severity: "high",
		Title:    "Prompt injection: system prompt override",
	},
	{
		Pattern:  regexp.MustCompile(`(?i)\[INST\]|\[\/INST\]|<\|im_start\|>|<\|im_end\|>`),
		Severity: "critical",
		Title:    "Prompt injection: raw instruction tags",
	},
	{
		Pattern:  regexp.MustCompile(`(?i)act\s+as\s+(if\s+)?(you\s+)?(are|were)\s+(a\s+)?`),
		Severity: "medium",
		Title:    "Prompt injection: persona manipulation",
	},
	{
		Pattern:  regexp.MustCompile(`(?i)do\s+not\s+follow\s+(your|the|any)\s+(rules?|guidelines?|instructions?|policy)`),
		Severity: "critical",
		Title:    "Prompt injection: rule bypass attempt",
	},
	{
		Pattern:  regexp.MustCompile(`(?i)bypass\s+(your|the|all|any)\s+(safety|content|security|filter|restriction|guardrail)`),
		Severity: "critical",
		Title:    "Prompt injection: safety bypass attempt",
	},
	{
		Pattern:  regexp.MustCompile(`(?i)(jailbreak|dan\s*mode|developer\s*mode|unrestricted\s*mode)`),
		Severity: "critical",
		Title:    "Prompt injection: jailbreak attempt",
	},
	{
		Pattern:  regexp.MustCompile(`(?i)pretend\s+(that\s+)?(you|there)\s+(are|is)\s+no\s+(rules?|restrictions?|limitations?|filters?)`),
		Severity: "high",
		Title:    "Prompt injection: restriction removal",
	},
	{
		Pattern:  regexp.MustCompile(`(?i)reveal\s+(your|the)\s+(system\s*prompt|instructions?|initial\s*prompt|hidden\s*prompt)`),
		Severity: "high",
		Title:    "Prompt injection: prompt extraction attempt",
	},
}

// dataLeakPatterns defines regex patterns that indicate sensitive data in prompts/responses.
var dataLeakPatterns = []struct {
	Pattern  *regexp.Regexp
	Severity string
	Title    string
}{
	{
		Pattern:  regexp.MustCompile(`\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b`),
		Severity: "medium",
		Title:    "Data leak: email address detected",
	},
	{
		Pattern:  regexp.MustCompile(`\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b`),
		Severity: "critical",
		Title:    "Data leak: credit card number detected",
	},
	{
		Pattern:  regexp.MustCompile(`\b\d{3}-\d{2}-\d{4}\b`),
		Severity: "critical",
		Title:    "Data leak: SSN pattern detected",
	},
	{
		Pattern:  regexp.MustCompile(`(?i)(sk-[a-zA-Z0-9]{20,}|sk-proj-[a-zA-Z0-9\-]{20,})`),
		Severity: "critical",
		Title:    "Data leak: OpenAI API key detected",
	},
	{
		Pattern:  regexp.MustCompile(`(?i)(sk-ant-[a-zA-Z0-9\-]{20,})`),
		Severity: "critical",
		Title:    "Data leak: Anthropic API key detected",
	},
	{
		Pattern:  regexp.MustCompile(`(?i)AIza[0-9A-Za-z\-_]{35}`),
		Severity: "critical",
		Title:    "Data leak: Google API key detected",
	},
	{
		Pattern:  regexp.MustCompile(`(?i)(aws_access_key_id|aws_secret_access_key)\s*[=:]\s*[A-Za-z0-9/+=]{16,}`),
		Severity: "critical",
		Title:    "Data leak: AWS credential detected",
	},
	{
		Pattern:  regexp.MustCompile(`(?i)(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{22,})`),
		Severity: "critical",
		Title:    "Data leak: GitHub token detected",
	},
	{
		Pattern:  regexp.MustCompile(`(?i)(password|passwd|pwd)\s*[=:]\s*\S{6,}`),
		Severity: "high",
		Title:    "Data leak: password in plaintext",
	},
	{
		Pattern:  regexp.MustCompile(`(?i)-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----`),
		Severity: "critical",
		Title:    "Data leak: private key detected",
	},
	{
		Pattern:  regexp.MustCompile(`\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b`),
		Severity: "low",
		Title:    "Data leak: phone number detected",
	},
}

// ScanText scans text content for prompt injection attempts and data leaks.
func ScanText(text string) []ScanResult {
	if strings.TrimSpace(text) == "" {
		return nil
	}

	var results []ScanResult

	for _, p := range promptInjectionPatterns {
		if loc := p.Pattern.FindString(text); loc != "" {
			results = append(results, ScanResult{
				Type:        "prompt_injection",
				Severity:    p.Severity,
				Title:       p.Title,
				Description: fmt.Sprintf("Detected pattern in trace content: '%s'", truncate(loc, 100)),
				Pattern:     p.Pattern.String(),
			})
		}
	}

	for _, p := range dataLeakPatterns {
		if loc := p.Pattern.FindString(text); loc != "" {
			// Mask the matched sensitive data in the description
			masked := maskSensitive(loc)
			results = append(results, ScanResult{
				Type:        "data_leak",
				Severity:    p.Severity,
				Title:       p.Title,
				Description: fmt.Sprintf("Sensitive data detected: '%s'", masked),
				Pattern:     p.Pattern.String(),
			})
		}
	}

	return results
}

func truncate(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}

func maskSensitive(s string) string {
	if len(s) <= 4 {
		return "****"
	}
	visible := len(s) / 4
	if visible < 2 {
		visible = 2
	}
	return s[:visible] + strings.Repeat("*", len(s)-visible*2) + s[len(s)-visible:]
}
