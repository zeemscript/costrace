package models

import "time"

type AuditLog struct {
	ID        uint      `gorm:"primary_key" json:"id"`
	UserID    uint      `gorm:"index;not null" json:"user_id"`
	TeamID    *uint     `gorm:"index" json:"team_id"`
	Action    string    `gorm:"not null;index" json:"action"`
	Resource  string    `gorm:"not null;index" json:"resource"`
	Details   string    `gorm:"type:text" json:"details"`
	IPAddress string    `json:"ip_address"`
	UserAgent string    `json:"user_agent"`
	CreatedAt time.Time `gorm:"autoCreateTime;index" json:"created_at"`
}
