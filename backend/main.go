package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/ikotun-dev/costrace/config"
	"github.com/ikotun-dev/costrace/services/auth"
	"github.com/ikotun-dev/costrace/services/traces"
	"github.com/ikotun-dev/costrace/shared"
	"github.com/ikotun-dev/costrace/types"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load("../.env")

	// Database configuration
	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		dbUrl = "postgresql://postgres@localhost:5432/costrace"
	}

	// GitHub OAuth configuration
	githubClientID := os.Getenv("GITHUB_CLIENT_ID")
	githubClientSecret := os.Getenv("GITHUB_CLIENT_SECRET")
	githubRedirectURL := os.Getenv("GITHUB_REDIRECT_URL")
	if githubRedirectURL == "" {
		githubRedirectURL = "http://localhost:8080/auth/github/callback"
	}

	// JWT configuration
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your-secret-key-change-in-production"
	}

	// Validate required environment variables
	if githubClientID == "" || githubClientSecret == "" {
		log.Fatal("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set")
	}

	db, err := config.InitDB(dbUrl)
	if err != nil {
		log.Fatal("Failed to connect to database : ", err)
	}
	log.Print("Database connected & migration completed successfully")

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	// r.Use(middleware.RealIP)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		w.Write([]byte(`{"status":"healthy"}`))
	})

	traceHandler := traces.NewTraceHandler(db)
	authHandler := auth.NewAuthHandler(db, types.AuthConfig{
		GitHubClientID:     githubClientID,
		GitHubClientSecret: githubClientSecret,
		GitHubRedirectURL:  githubRedirectURL,
		JWTSecret:          []byte(jwtSecret),
	})

	// Public routes
	r.Get("/auth/github", authHandler.GitHubLogin)
	r.Get("/auth/github/callback", authHandler.GitHubCallback)

	// Protected API routes
	r.Route("/v1", func(r chi.Router) {
		r.Use(shared.AuthMiddleware(db, []byte(jwtSecret)))
		r.Post("/traces", traceHandler.CreateTrace)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Costrace backend listening on :%s\n", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
