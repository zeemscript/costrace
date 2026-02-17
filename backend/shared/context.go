package shared

import "context"

type contextKey string

const apiKeyContextKey contextKey = "api_key"

func SetAPIKey(ctx context.Context, apiKey string) context.Context {
	return context.WithValue(ctx, apiKeyContextKey, apiKey)
}

// getAPIKey retrieves the API key from the request context
func GetAPIKey(ctx context.Context) string {
	apiKey, _ := ctx.Value(apiKeyContextKey).(string)
	return apiKey
}
