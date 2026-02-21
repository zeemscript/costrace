package shared

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
)

func GenerateAPIKey() string {
	b := make([]byte, 32)
	rand.Read(b)
	return "ct_" + hex.EncodeToString(b)
}

func RespondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
