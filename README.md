# Costrace

LLM cost and latency tracking for OpenAI, Anthropic, and Google Gemini.

Costrace provides SDKs that automatically instrument your LLM calls via monkey-patching — no code changes required. A web dashboard gives you real-time analytics on spend, token usage, latency, and geographic distribution.

## Architecture

```
costrace/
├── backend/          # Go API server
├── costrace-app/     # Next.js APP
├── node-sdk/         # Node.js/TypeScript SDK (npm: costrace)
├── python-sdk/       # Python SDK (pip: costrace-sdk)
└── examples/         # Usage examples
```

## Quick Start

### 1. Clone and configure

```bash
git clone https://github.com/ikotun-dev/costrace.git
cd costrace
cp .env.example .env
# Fill in the required values in .env
```

### 2. Backend

Requires Go 1.25+ and PostgreSQL.

```bash
cd backend
go build -o costrace .
./costracAPP-sdAPP-sdk
```

#### GeoIP (optional)

Country-level geolocation for traces requires a [MaxMind GeoLite2](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data) database.

1. Sign up for a free MaxMind account and generate a license key.
2. Download `GeoLite2-City.mmdb` and place it in the `backend/` directory.

```bash
cd backenAPP-sdAPP-sdk
curl -sSL "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=YOUR_LICENSE_KEY&suffix=tar.gz" \
  -o /tmp/geolite2.tar.gz
tar -xzf /tmp/geolite2.tar.gz -C /tmp
cp /tmp/GeoLite2-City_*/GeoLite2-City.mmdb .
rm -rf /tmp/geolite2.tar.gz /tmp/GeoLite2-City_*
```

If the file is missing, the backend still works — traces will just have an empty country field.

#### Docker

```bash
cd backend
docker build --build-arg MAXMIND_LICENSE_KEY=your_key -t costrace-api .
docker run -p 8081:8081 --env-file .env costrace-api
```

The `MAXMIND_LICENSE_KEY` build arg is optional. Without it, geolocation is disabled.

### 3. Frontend

Requires Node.js 18+.

```bash
cd costrace-app
npm install
npm run dev
```

### 4. SDKs

#### Node.js

```bash
npm install costrace
```

```typescript
import costrace from "costrace";
costrace.init("ct_your_api_key");

// All OpenAI/Anthropic/Gemini calls are now tracked automatically
```

#### Python

```bash
pip install costrace
```

```python
import costrace
costrace.init(api_key="ct_your_api_key")

# All OpenAI/Anthropic/Gemini calls are now tracked automatically
```

## Environment Variables

| Variable               | Required | Description                                                                |
| ---------------------- | -------- | -------------------------------------------------------------------------- |
| `DATABASE_URL`         | Yes      | PostgreSQL connection string                                               |
| `JWT_SECRET`           | Yes      | Secret for signing auth tokens                                             |
| `GITHUB_CLIENT_ID`     | Yes      | GitHub OAuth app client ID                                                 |
| `GITHUB_CLIENT_SECRET` | Yes      | GitHub OAuth app client secret                                             |
| `GITHUB_REDIRECT_URL`  | No       | OAuth callback URL (default: `http://localhost:8080/auth/github/callback`) |
| `FRONTEND_URL`         | No       | Frontend origin for redirects (default: `http://localhost:3000`)           |
| `BACKEND_URL`          | No       | Backend URL for email links (default: `http://localhost:8080`)             |
| `ALLOWED_ORIGINS`      | No       | Comma-separated CORS origins (default: `http://localhost:3000`)            |
| `RESEND_API_KEY`       | No       | Resend API key for email notifications                                     |
| `MAXMIND_LICENSE_KEY`  | No       | MaxMind license key for GeoIP (Docker build only)                          |
| `PORT`                 | No       | Backend port (default: `8081`)                                             |

## License

MIT
