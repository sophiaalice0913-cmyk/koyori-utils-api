# koyori-utils-api

x402-enabled API endpoints on Cloudflare Workers.

Built using patterns from:
- [x402-api](https://github.com/aibtcdev/x402-api)
- [stx402](https://github.com/whoabuddy/stx402)

## Live Endpoints (Production)

The API is deployed and live on mainnet:

*   **Base URL:** `https://koyori-utils-api.koyori-aibtc.workers.dev`
*   **Cost:** `0.001 STX` (1000 micro-STX) per request.
*   **Payment Flow:** Unauthenticated requests made without a payment signature will return an HTTP `402 Payment Required` response containing the exact payment requirements (including `payTo` address, `maxAmountRequired` in micro-STX, and other parameters).

### 1. SHA-256 Hashing (`/api/hash`)
Generates a secure SHA-256 hash of the provided input string.

**Illustrative Request (returns HTTP 402 Payment Required):**
```bash
curl -X POST https://koyori-utils-api.koyori-aibtc.workers.dev/api/hash \
  -H "Content-Type: application/json" \
  -d '{"text": "hello"}'
```

### 2. JSON Formatting (`/api/format`)
Validates and beautifies raw JSON strings.

**Illustrative Request (returns HTTP 402 Payment Required):**
```bash
curl -X POST https://koyori-utils-api.koyori-aibtc.workers.dev/api/format \
  -H "Content-Type: application/json" \
  -d '{"jsonString": "{\"key\": \"value\"}"}'
```

## Quick Start

```bash
# Install dependencies
npm install

# Set your recipient address for local dev
# Edit .dev.vars and replace YOUR_STACKS_ADDRESS_HERE with your address

# Start local dev server
npm run dev
```

The server will start at http://localhost:8787

## Payment Tokens

This API accepts payments in:
- STX

## Endpoints

### GET /
- **Description:** Service info
- **Cost:** Free

### GET /health
- **Description:** Health check endpoint
- **Cost:** Free

### POST /api/hash
- **Description:** Generates a secure SHA-256 hash of the input string
- **Cost:** 0.001 STX (tier: simple)
- **Payment Required:** Yes

### POST /api/format
- **Description:** Validates and beautifies JSON strings
- **Cost:** 0.001 STX (tier: simple)
- **Payment Required:** Yes

## Deployment

### Set Production Secrets

```bash
# Set your recipient address (where payments will be sent)
wrangler secret put RECIPIENT_ADDRESS
# Enter: SP3SMA15KHE45J6XABS1VXC2VX3HHZGHMAWNYKM5A
```

### Deploy

```bash
# Deploy to staging (testnet)
npm run deploy:staging

# Deploy to production (mainnet)
npm run deploy:production
```

## x402 Payment Flow

1. Client makes request without payment header
2. Server returns HTTP 402 with payment requirements:
   ```json
   {
     "maxAmountRequired": "1000",
     "resource": "/api/endpoint",
     "payTo": "SP3SMA15KHE45J6XABS1VXC2VX3HHZGHMAWNYKM5A",
     "network": "testnet",
     "tokenType": "STX",
     "nonce": "uuid",
     "expiresAt": "2024-01-01T00:05:00Z"
   }
   ```
3. Client signs payment transaction (does NOT broadcast)
4. Client retries request with `X-PAYMENT` header containing signed tx
5. Server verifies and settles payment via relay
6. Server returns actual response

## Testing with curl

```bash
# Service info (free)
curl http://localhost:8787/

# Health check (free)
curl http://localhost:8787/health

# Protected endpoint (returns 402)
curl http://localhost:8787/api/hash
```

## Token Type Selection

Clients can specify which token to pay with using the `X-PAYMENT-TOKEN-TYPE` header:

```bash
# Pay with sBTC instead of STX
curl -H "X-PAYMENT-TOKEN-TYPE: sBTC" http://localhost:8787/api/hash
```

Supported values: `STX`, `sBTC`, `USDCx`

## Error Codes

The API returns structured error responses for payment failures:

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INSUFFICIENT_FUNDS` | Wallet needs funding | 402 |
| `PAYMENT_EXPIRED` | Sign a new payment | 402 |
| `AMOUNT_TOO_LOW` | Payment below minimum | 402 |
| `PAYMENT_INVALID` | Bad signature/params | 400 |
| `NETWORK_ERROR` | Transient error | 502 |
| `RELAY_UNAVAILABLE` | Try again later | 503 |

---

Generated with [@aibtc/mcp-server](https://www.npmjs.com/package/@aibtc/mcp-server) scaffold tool.
