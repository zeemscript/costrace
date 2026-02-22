package models

import "time"

type BudgetAlert struct {
	ID              uint       `gorm:"primary_key" json:"id"`
	UserID          uint       `gorm:"index;not null" json:"user_id"`
	TeamID          *uint      `gorm:"index" json:"team_id"`
	Name            string     `gorm:"not null" json:"name"`
	Scope           string     `gorm:"not null" json:"scope"` // "general" | "api_key" | "model"
	ScopeValue      string     `json:"scope_value"`           // api key string or model name; empty for general
	ThresholdUSD    float64    `gorm:"type:decimal(10,2);not null" json:"threshold_usd"`
	Period          string     `gorm:"not null;default:'monthly'" json:"period"` // "daily" | "weekly" | "monthly"
	Enabled         bool       `gorm:"not null;default:true" json:"enabled"`
	LastTriggeredAt *time.Time `json:"last_triggered_at"`
	CreatedAt       time.Time  `gorm:"autoCreateTime" json:"created_at"`
}
