package models

import "time"

type AuthType string

const (
	Github AuthType = "github"
	Email  AuthType = "email" //magic link (no password auth)
)

type User struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Email string `gorm:"uniqueIndex;not null" json:"email"`

	// GitHub OAuth fields
	GithubID  *string  `gorm:"uniqueIndex" json:"github_id"`
	Username  string   `json:"username"`
	AvatarURL string   `json:"avatar_url"`
	Teams     []Team   `gorm:"many2many:user_teams;" json:"teams"`
	AuthType  AuthType `gorm:"not null;default:'github'" json:"auth_type"`
	CreatedAt int64    `gorm:"autoCreateTime" json:"created_at"`
	Country   string   `gorm:"index" json:"country"`
}

type MagicLinkTokens struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Email     string    `gorm:"not null;index" json:"email"`
	Token     string    `gorm:"uniqueIndex;not null" json:"token"`
	Used      bool      `gorm:"default:false" json:"used"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}
