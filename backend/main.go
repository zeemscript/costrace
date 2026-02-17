package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/ikotun-dev/costrace/config"
	"github.com/ikotun-dev/costrace/services/traces"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		dbUrl = "postgresql://postgres@localhost:5432/costrace"
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

	r.Route("/v1", func(r chi.Router) {
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
