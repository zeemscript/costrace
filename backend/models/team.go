package models

import "time"

type Team struct {
	ID        uint      `gorm:"primary_key" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	OwnerID   uint      `gorm:"not null;index" json:"owner_id"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}
