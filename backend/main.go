package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/ikotun-dev/costrace/config"
	"github.com/ikotun-dev/costrace/services/analytics"
	apikeys "github.com/ikotun-dev/costrace/services/api_keys"
	"github.com/ikotun-dev/costrace/services/audit"
	"github.com/ikotun-dev/costrace/services/auth"
	"github.com/ikotun-dev/costrace/services/billing"
	budgetalerts "github.com/ikotun-dev/costrace/services/budget_alerts"
	"github.com/ikotun-dev/costrace/services/ipallowlist"
	"github.com/ikotun-dev/costrace/services/ratelimit"
	"github.com/ikotun-dev/costrace/services/security"
	"github.com/ikotun-dev/costrace/services/sse"
	"github.com/ikotun-dev/costrace/services/teams"
	"github.com/ikotun-dev/costrace/services/traces"
	"github.com/ikotun-dev/costrace/shared"
	"github.com/ikotun-dev/costrace/types"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load("../.env")

	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		dbUrl = "postgresql://postgres@localhost:5432/costrace"
	}

	githubClientID := os.Getenv("GITHUB_CLIENT_ID")
	githubClientSecret := os.Getenv("GITHUB_CLIENT_SECRET")
	githubRedirectURL := os.Getenv("GITHUB_REDIRECT_URL")
	if githubRedirectURL == "" {
		githubRedirectURL = "http://localhost:8080/auth/github/callback"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET must be set")
	}

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
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "http://localhost:3000"
	}
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   strings.Split(allowedOrigins, ","),
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		w.Write([]byte(`{"status":"healthy"}`))
	})

	sseHub := sse.NewHub()
	traceHandler := traces.NewTraceHandler(db, sseHub)
	apiKeyHandler := apikeys.NewApiKeyHandler(db)
	analyticsHandler := analytics.NewAnalyticsHandler(db)
	budgetAlertHandler := budgetalerts.NewBudgetAlertHandler(db)
	teamHandler := teams.NewTeamHandler(db)
	sseHandler := sse.NewSSEHandler(db, sseHub)
	billingHandler := billing.NewBillingHandler(db)
	securityHandler := security.NewSecurityHandler(db)
	rateLimitHandler := ratelimit.NewRateLimitHandler(db)
	auditHandler := audit.NewAuditHandler(db)
	ipAllowlistHandler := ipallowlist.NewIPAllowlistHandler(db)
	authHandler := auth.NewAuthHandler(db, types.AuthConfig{
		GitHubClientID:     githubClientID,
		GitHubClientSecret: githubClientSecret,
		GitHubRedirectURL:  githubRedirectURL,
		JWTSecret:          []byte(jwtSecret),
	})

	r.Get("/auth/github", authHandler.GitHubLogin)
	r.Get("/auth/github/callback", authHandler.GitHubCallback)
	r.Post("/auth/magic-link", authHandler.RequestMagicLink)
	r.Get("/auth/magic-link/verify", authHandler.VerifyMagicLink)

	r.Route("/v1", func(r chi.Router) {
		r.Post("/webhooks/polar", billingHandler.HandlePolarWebhook)
		r.Post("/traces", traceHandler.CreateTrace)

		r.Group(func(r chi.Router) {
			r.Use(shared.AuthMiddleware(db, []byte(jwtSecret)))
			r.Get("/events", sseHandler.StreamEvents)
			r.Get("/user", authHandler.GetCurrentUser)
			r.Put("/user", authHandler.UpdateUser)
			r.Get("/api-keys", apiKeyHandler.ListAPIKeys)
			r.Post("/api-keys", apiKeyHandler.CreateAPIKey)
			r.Delete("/api-keys/{id}", apiKeyHandler.DeleteAPIKey)
			r.Get("/traces", traceHandler.ListTraces)
			r.Get("/analytics/summary", analyticsHandler.Summary)
			r.Get("/analytics/cost-over-time", analyticsHandler.CostOverTime)
			r.Get("/analytics/cost-by-model", analyticsHandler.CostByModel)
			r.Get("/analytics/cost-by-country", analyticsHandler.CostByCountry)
			r.Get("/budget-alerts", budgetAlertHandler.ListBudgetAlerts)
			r.Post("/budget-alerts", budgetAlertHandler.CreateBudgetAlert)
			r.Put("/budget-alerts/{id}", budgetAlertHandler.UpdateBudgetAlert)
			r.Delete("/budget-alerts/{id}", budgetAlertHandler.DeleteBudgetAlert)

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

			// Security: prompt injection & data leak alerts
			r.Get("/security/alerts", securityHandler.ListAlerts)
			r.Get("/security/summary", securityHandler.SecuritySummary)
			r.Put("/security/alerts/{id}", securityHandler.ResolveAlert)

			// Rate limiting & abuse detection
			r.Get("/rate-limits", rateLimitHandler.ListRateLimits)
			r.Post("/rate-limits", rateLimitHandler.CreateRateLimit)
			r.Put("/rate-limits/{id}", rateLimitHandler.UpdateRateLimit)
			r.Delete("/rate-limits/{id}", rateLimitHandler.DeleteRateLimit)
			r.Get("/abuse-events", rateLimitHandler.ListAbuseEvents)

			// Audit logs
			r.Get("/audit-logs", auditHandler.ListAuditLogs)

			// IP allowlisting
			r.Get("/ip-allowlist", ipAllowlistHandler.ListIPRules)
			r.Post("/ip-allowlist", ipAllowlistHandler.CreateIPRule)
			r.Delete("/ip-allowlist/{id}", ipAllowlistHandler.DeleteIPRule)
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("🚀 Costrace backend listening on :%s\n", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
