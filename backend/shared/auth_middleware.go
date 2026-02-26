package shared

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/ikotun-dev/costrace/models"
	"github.com/ikotun-dev/costrace/types"
	"gorm.io/gorm"
)

func AuthMiddleware(db *gorm.DB, jwtSecret []byte) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			var tokenString string

			authHeader := r.Header.Get("Authorization")
			if authHeader != "" {
				parts := strings.Split(authHeader, " ")
				if len(parts) != 2 || parts[0] != "Bearer" {
					http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
					return
				}
				tokenString = parts[1]
			} else if t := r.URL.Query().Get("token"); t != "" {
				// Fallback: accept token as query param (for EventSource/SSE)
				tokenString = t
			} else {
				http.Error(w, "Missing authorization", http.StatusUnauthorized)
				return
			}
			claims := &types.Claims{}

			token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
				return jwtSecret, nil
			})

			if err != nil || !token.Valid {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
				return
			}

			// Optionally, fetch user from database to ensure they still exist
			var user models.User
			if err := db.First(&user, claims.UserID).Error; err != nil {
				http.Error(w, "User not found", http.StatusUnauthorized)
				return
			}

			// Add user to request context
			ctx := context.WithValue(r.Context(), types.UserContextKey, &user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserFromContext retrieves the authenticated user from request context
func GetUserFromContext(ctx context.Context) (*models.User, bool) {
	user, ok := ctx.Value(types.UserContextKey).(*models.User)
	return user, ok
}
