package models

import "time"

type RateLimitRule struct {
	ID             uint   `gorm:"primary_key" json:"id"`
	UserID         uint   `gorm:"index;not null" json:"user_id"`
	TeamID         *uint  `gorm:"index" json:"team_id"`
	APIKeyID       uint   `gorm:"index;not null" json:"api_key_id"`
	MaxRequestsMin int    `gorm:"not null;default:60" json:"max_requests_min"`
	MaxTokensHour  int    `gorm:"not null;default:1000000" json:"max_tokens_hour"`
	Enabled        bool   `gorm:"not null;default:true" json:"enabled"`
	AutoDisable    bool   `gorm:"not null;default:false" json:"auto_disable"`
	CreatedAt      time.Time `gorm:"autoCreateTime" json:"created_at"`
}

type AbuseEvent struct {
	ID        uint      `gorm:"primary_key" json:"id"`
	UserID    uint      `gorm:"index;not null" json:"user_id"`
	APIKey    string    `gorm:"index;not null" json:"api_key"`
	Type      string    `gorm:"not null" json:"type"` // "rate_exceeded", "token_exceeded", "geo_anomaly", "spike"
	Details   string    `gorm:"type:text" json:"details"`
	CreatedAt time.Time `gorm:"autoCreateTime;index" json:"created_at"`
}
