# Koyori Utils API

A lightweight x402-powered utility API with **60 endpoints** for developers, bots, and AI agents.

## Live API

**Base URL:**  
https://koyori-utils-api.koyori-aibtc.workers.dev

**Price:**  
**0.001 STX per paid request**

No subscription. No hidden fees.

## Why use Koyori Utils API?

- 60 lightweight utility endpoints
- Built for developers, bots, and AI agents
- x402 payments on Stacks mainnet
- OpenAPI support
- AI-readable `llms.txt`
- Machine-readable `metadata.json`
- Source code available on GitHub
- Runs on Cloudflare Workers

## Popular APIs

- JSON formatting
- SHA-256 hashing
- Web page fetching
- Text replacement
- CSV to JSON
- JSON to CSV
- Base64 encode / decode
- URL encode / decode
- UUID v4 generation
- Text statistics
- Text search
- Metadata extraction

## 1-minute example

Use the JSON Formatter to turn messy JSON into clean, readable JSON.

**Endpoint**

`POST /api/format`

**Example request body**

```json
{
  "json": "{\"name\":\"Koyori\",\"tools\":60}"
}
```

**Result**

```json
{
  "name": "Koyori",
  "tools": 60
}
```

## Available Tools

Koyori Utils API includes utilities for:

- Text transformation and cleanup
- Case conversion
- JSON / CSV conversion
- Base64 / Base64URL / Hex / URL encoding
- Markdown / HTML conversion
- SHA-256 hashing
- UUID generation
- Random values
- Timestamp conversion
- URL parsing
- JWT decoding
- Regex testing
- Web fetching
- Link extraction
- Page information
- Metadata extraction
- Text search and analysis

See the OpenAPI specification for the full endpoint list and request schemas.

## AI Agent Resources

**OpenAPI**  
https://koyori-utils-api.koyori-aibtc.workers.dev/openapi.json

**AI Guide (`llms.txt`)**  
https://koyori-utils-api.koyori-aibtc.workers.dev/llms.txt

**Metadata**  
https://koyori-utils-api.koyori-aibtc.workers.dev/metadata.json

These resources help AI agents discover and understand the available tools.

## Payment

Paid endpoints use x402.

Requests without a valid payment return:

`HTTP 402 Payment Required`

The response contains the current payment requirements, including the recipient address, required amount, network, and token type.

**Current price:**  
**0.001 STX per paid request**

## Health Check

`GET /health`

Returns the current service status.

## Source

**Live service**  
https://koyori-utils-api.koyori-aibtc.workers.dev

**GitHub**  
https://github.com/sophiaalice0913-cmyk/koyori-utils-api

Built with Cloudflare Workers, x402, and Stacks mainnet.
