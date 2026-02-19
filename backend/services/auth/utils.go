package auth

import (
	"crypto/rand"
	"encoding/hex"
)

func generateState() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func generateAPIKey() string {
	b := make([]byte, 32)
	rand.Read(b)
	// prefixed with "ct_" to indicate it's an API key for Costrace :)
	return "ct_" + hex.EncodeToString(b)
}
