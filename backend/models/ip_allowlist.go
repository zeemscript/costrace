package models

import "time"

type IPAllowlist struct {
	ID        uint      `gorm:"primary_key" json:"id"`
	UserID    uint      `gorm:"index;not null" json:"user_id"`
	TeamID    *uint     `gorm:"index" json:"team_id"`
	APIKeyID  uint      `gorm:"index;not null" json:"api_key_id"`
	CIDR      string    `gorm:"not null" json:"cidr"` // IP or CIDR range e.g. "192.168.1.0/24" or "10.0.0.1/32"
	Label     string    `json:"label"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}
