package models

import "time"

type AlertSeverity string
type AlertType string

const (
	SeverityLow      AlertSeverity = "low"
	SeverityMedium   AlertSeverity = "medium"
	SeverityHigh     AlertSeverity = "high"
	SeverityCritical AlertSeverity = "critical"
)

const (
	AlertPromptInjection AlertType = "prompt_injection"
	AlertDataLeak        AlertType = "data_leak"
)

type SecurityAlert struct {
	ID          uint          `gorm:"primary_key" json:"id"`
	UserID      uint          `gorm:"index;not null" json:"user_id"`
	TeamID      *uint         `gorm:"index" json:"team_id"`
	TraceID     uint          `gorm:"index;not null" json:"trace_id"`
	APIKey      string        `gorm:"index;not null" json:"api_key"`
	Type        AlertType     `gorm:"not null;index" json:"type"`
	Severity    AlertSeverity `gorm:"not null;index" json:"severity"`
	Title       string        `gorm:"not null" json:"title"`
	Description string        `gorm:"type:text" json:"description"`
	Pattern     string        `gorm:"type:text" json:"pattern"`
	Resolved    bool          `gorm:"default:false" json:"resolved"`
	ResolvedAt  *time.Time    `json:"resolved_at"`
	CreatedAt   time.Time     `gorm:"autoCreateTime" json:"created_at"`
}
