package models

import "time"

type APIKey struct {
	ID        uint      `gorm:"primary_key" json:"id"`
	UserID    uint      `gorm:"index;not null" json:"user_id"`
	Name      string    `gorm:"not null" json:"name"`
	Key       string    `gorm:"unique;not null" json:"key"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}
