package shared

import (
	"net/http"
)

func RequireAPIKey(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
			return
		}

		if len(authHeader) < 8 || authHeader[:7] != "Bearer" {
			http.Error(w, "Invalid Authorization header", http.StatusUnauthorized)
			return
		}

		apiKey := authHeader[7:]
		if apiKey != "your_api_key" {
			http.Error(w, "Invalid API key", http.StatusUnauthorized)
			return
		}

		ctx := r.Context()
		ctx = SetAPIKey(ctx, apiKey)
		next.ServeHTTP(w, r)
	})
}
