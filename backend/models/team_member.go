package models

import "time"

type TeamMember struct {
	ID       uint      `gorm:"primary_key" json:"id"`
	TeamID   uint      `gorm:"not null;uniqueIndex:idx_team_user" json:"team_id"`
	UserID   uint      `gorm:"not null;uniqueIndex:idx_team_user" json:"user_id"`
	Role     string    `gorm:"not null;default:'member'" json:"role"` // "owner" | "member"
	JoinedAt time.Time `gorm:"autoCreateTime" json:"joined_at"`

	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}
