package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/ikotun-dev/costrace/config"
	"github.com/ikotun-dev/costrace/services/analytics"
	apikeys "github.com/ikotun-dev/costrace/services/api_keys"
	"github.com/ikotun-dev/costrace/services/auth"
	budgetalerts "github.com/ikotun-dev/costrace/services/budget_alerts"
	"github.com/ikotun-dev/costrace/services/teams"
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
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		w.Write([]byte(`{"status":"healthy"}`))
	})

	traceHandler := traces.NewTraceHandler(db)
	apiKeyHandler := apikeys.NewApiKeyHandler(db)
	analyticsHandler := analytics.NewAnalyticsHandler(db)
	budgetAlertHandler := budgetalerts.NewBudgetAlertHandler(db)
	teamHandler := teams.NewTeamHandler(db)
	authHandler := auth.NewAuthHandler(db, types.AuthConfig{
		GitHubClientID:     githubClientID,
		GitHubClientSecret: githubClientSecret,
		GitHubRedirectURL:  githubRedirectURL,
		JWTSecret:          []byte(jwtSecret),
	})

	// Public routes
	r.Get("/auth/github", authHandler.GitHubLogin)
	r.Get("/auth/github/callback", authHandler.GitHubCallback)
	r.Post("/auth/magic-link", authHandler.RequestMagicLink)
	r.Get("/auth/magic-link/verify", authHandler.VerifyMagicLink)

	r.Route("/v1", func(r chi.Router) {
		// SDK route — authenticated via API key in the request body, not JWT
		r.Post("/traces", traceHandler.CreateTrace)

		// Dashboard routes — authenticated via JWT
		r.Group(func(r chi.Router) {
			r.Use(shared.AuthMiddleware(db, []byte(jwtSecret)))
			r.Get("/user", authHandler.GetCurrentUser)
			r.Put("/user", authHandler.UpdateUser)
			r.Get("/api-keys", apiKeyHandler.ListAPIKeys)
			r.Post("/api-keys", apiKeyHandler.CreateAPIKey)
			r.Delete("/api-keys/{id}", apiKeyHandler.DeleteAPIKey)
			r.Get("/traces", traceHandler.ListTraces)
			r.Get("/analytics/summary", analyticsHandler.Summary)
			r.Get("/analytics/cost-over-time", analyticsHandler.CostOverTime)
			r.Get("/analytics/cost-by-model", analyticsHandler.CostByModel)
			r.Get("/budget-alerts", budgetAlertHandler.ListBudgetAlerts)
			r.Post("/budget-alerts", budgetAlertHandler.CreateBudgetAlert)
			r.Put("/budget-alerts/{id}", budgetAlertHandler.UpdateBudgetAlert)
			r.Delete("/budget-alerts/{id}", budgetAlertHandler.DeleteBudgetAlert)

			// Team routes
			r.Post("/teams", teamHandler.CreateTeam)
			r.Get("/teams/current", teamHandler.GetCurrentTeam)
			r.Put("/teams", teamHandler.UpdateTeam)
			r.Delete("/teams", teamHandler.DeleteTeam)
			r.Post("/teams/invite", teamHandler.InviteMember)
			r.Get("/teams/invitations", teamHandler.ListInvitations)
			r.Get("/teams/invitations/mine", teamHandler.MyInvitations)
			r.Delete("/teams/invitations/{id}", teamHandler.CancelInvitation)
			r.Post("/teams/invitations/{token}/accept", teamHandler.AcceptInvitation)
			r.Post("/teams/invitations/{token}/decline", teamHandler.DeclineInvitation)
			r.Delete("/teams/members/{id}", teamHandler.RemoveMember)
			r.Post("/teams/leave", teamHandler.LeaveTeam)
		})
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
