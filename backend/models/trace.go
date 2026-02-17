package models

import (
	"time"
)

type Trace struct {
	ID        uint      `gorm:"primary_key" json:"id"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `json:"-"`
	DeletedAt time.Time `gorm:"index" json:"-"`
	APIKey    string    `gorm:"index;not null" json:"-"`
	Provider  string    `gorm:"index;not null" json:"provider"`
	Model     string    `gorm:"index;not null" json:"model"`
	TokensIn  int       `gorm:"not null;default:0" json:"tokens_in"`
	TokensOut int       `gorm:"not null;default:0" json:"tokens_out"`
	CostUSD   float64   `gorm:"type:decimal(10,6);not null;default:0" json:"cost_usd"`

	// Performance
	LatencyMs int `gorm:"not null" json:"latency_ms"`

	// Status
	Status string `gorm:"not null" json:"status"` // "success" or "error"
	Error  string `gorm:"type:text" json:"error,omitempty"`

	// Timestamp from client (when the call was made)
	Timestamp time.Time `gorm:"index;not null" json:"timestamp"`
}

func (Trace) TableName() string {
	return "traces"
}
