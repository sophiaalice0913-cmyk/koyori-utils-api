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
  -d '{"text":"hello"}'
```

**Example body:**

```json
{
  "text": "hello"
}
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

### Live API

https://koyori-utils-api.koyori-aibtc.workers.dev

### SHA-256 Hashing

`POST /api/hash`

Example body:

```json
{
  "text": "hello"
}
```

### JSON Formatting

`POST /api/format`

Example body:

```json
{
  "jsonString": "{\"key\":\"value\"}"
}
```
### Character / Word / Byte Count

`POST /api/count`

Example body:

```json
{
  "text": "hello world"
}
```

Returns the number of characters, words, and UTF-8 bytes in the provided text.

### UUID v4 Generation

`POST /api/uuid`

Generates a random UUID v4 identifier.

Example response:

```json
{
  "success": true,
  "uuid": "550e8400-e29b-41d4-a716-446655440000"
}
```
### Base64 Encode / Decode

`POST /api/base64`

Encodes UTF-8 text to Base64 or decodes Base64 back to UTF-8 text.

Encode example:

```json
{
  "action": "encode",
  "text": "hello"
}
```

Decode example:

```json
{
  "action": "decode",
  "text": "aGVsbG8="
}
```
### URL Encode / Decode

`POST /api/url-encode`

Encodes text for safe use inside a URL component or decodes URL-encoded text back to its original form.

Encode example:

```json
{
  "action": "encode",
  "text": "hello world"
}
```

Decode example:

```json
{
  "action": "decode",
  "text": "hello%20world"
}
```
### Hex Encode / Decode

`POST /api/hex`

Encodes UTF-8 text to hexadecimal or decodes hexadecimal back to UTF-8 text.

Encode example:

```json
{
  "action": "encode",
  "text": "hello"
}
```

Decode example:

```json
{
  "action": "decode",
  "text": "68656c6c6f"
}
```
### Unix / ISO Timestamp Conversion

`POST /api/timestamp`

Converts Unix timestamps in seconds to ISO date strings, or ISO date strings to Unix timestamps.

Unix to ISO example:

```json
{
  "action": "to-iso",
  "value": 1757894400
}
```

ISO to Unix example:

```json
{
  "action": "to-unix",
  "value": "2025-09-15T00:00:00.000Z"
}
```
### URL-Friendly Slug Generation

`POST /api/slug`

Converts text into a lowercase, URL-friendly slug.

Example:

```json
{
  "text": "Hello World!"
}
```

Example result:

```json
{
  "result": "hello-world"
}
```
## Payment

Paid endpoints use x402.

Requests without a valid payment return:

`HTTP 402 Payment Required`

The response contains the current payment requirements, including the recipient address, required amount, network, and token type.

Current price:

**0.001 STX per request**

## Health Check

`GET /health`

Returns the current service status.

## Source

Live service:

https://koyori-utils-api.koyori-aibtc.workers.dev

GitHub:

https://github.com/sophiaalice0913-cmyk/koyori-utils-api