package models

type User struct {
	ID     uint   `gorm:"primary_key" json:"id"`
	Email  string `gorm:"unique;not null" json:"email"`
	APIKey string `gorm:"unique;not null" json:"api_key"`

	// GitHub OAuth fields
	GithubID  string `gorm:"unique;index" json:"github_id"`
	Username  string `json:"username"`
	AvatarURL string `json:"avatar_url"`

	CreatedAt int64  `gorm:"autoCreateTime" json:"created_at"`
	Country   string `gorm:"index" json:"country"`
}
