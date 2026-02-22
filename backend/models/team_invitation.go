package models

import "time"

type TeamInvitation struct {
	ID        uint      `gorm:"primary_key" json:"id"`
	TeamID    uint      `gorm:"not null;index" json:"team_id"`
	Email     string    `gorm:"not null" json:"email"`
	Token     string    `gorm:"unique;not null" json:"token"`
	Status    string    `gorm:"not null;default:'pending'" json:"status"` // "pending" | "accepted" | "declined"
	InvitedBy uint      `gorm:"not null" json:"invited_by"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`

	Team Team `gorm:"foreignKey:TeamID" json:"team,omitempty"`
}
