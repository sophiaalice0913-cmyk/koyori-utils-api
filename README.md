# Koyori Utils API

**20,000 API endpoints for developers, bots, and AI agents**, available on Stacks mainnet.

Koyori Utils API provides utility APIs and AI-friendly discovery resources, with STX subscription options. For current availability, request formats, pricing, and payment requirements, refer to the **live service** rather than older examples in this repository.

## Start here

| Resource | Link |
| --- | --- |
| **Live service** | [Koyori Utils API](https://koyori-utils-api.koyori-aibtc.workers.dev/) |
| **Browse APIs** | [AI Agent Catalog](https://koyori-utils-api.koyori-aibtc.workers.dev/agents/catalog) |
| **AI purchase & quickstart guide (V278)** | [AI Agent Quickstart](https://koyori-utils-api.koyori-aibtc.workers.dev/agents/quickstart) |
| **Subscriptions & current pricing** | [Subscription Portal](https://koyori-utils-api.koyori-aibtc.workers.dev/subscription) |
| **Support** | [Support Center](https://koyori-utils-api.koyori-aibtc.workers.dev/support) |
| **OpenAPI specification** | [OpenAPI JSON](https://koyori-utils-api.koyori-aibtc.workers.dev/openapi.json) |
| **AI-readable overview** | [llms.txt](https://koyori-utils-api.koyori-aibtc.workers.dev/llms.txt) |
| **Service status** | [Health Check](https://koyori-utils-api.koyori-aibtc.workers.dev/health) |

## What can you build?

The API catalog covers utility tasks such as:

- JSON, CSV, and text transformations
- Encoding, decoding, hashing, and UUID generation
- URL and metadata extraction
- Text search, analysis, and formatting

**Browse the live catalog and OpenAPI specification for the actual supported endpoints and request schemas.** This README is a guide to the service, not an exhaustive list of 20,000 operations.

## Hands-on AI agent example

Try the [read-only AI agent API discovery example](docs/AI_AGENT_DISCOVERY_EXAMPLE.md). It includes a runnable Python example for inspecting the public catalog and OpenAPI without making purchases, signing transactions, or calling paid operations.

## For developers and AI agents

1. **Discover** an appropriate operation in the [AI catalog](https://koyori-utils-api.koyori-aibtc.workers.dev/agents/catalog).
2. **Inspect** the endpoint schema in [OpenAPI](https://koyori-utils-api.koyori-aibtc.workers.dev/openapi.json).
3. **Review** the [subscription portal](https://koyori-utils-api.koyori-aibtc.workers.dev/subscription) for current prices, eligibility, and purchase instructions.
4. **Get explicit human approval** before any payment, wallet signature, or purchase.
5. **Follow the [V278 AI quickstart guide](https://koyori-utils-api.koyori-aibtc.workers.dev/agents/quickstart)** for activation and API access.

### Payment safety

- Never assume a fixed price from outdated README examples. Check the live subscription page and any applicable payment response.
- Some paid endpoints may use x402 and return `HTTP 402 Payment Required` when payment is required; consult the live API's response for its actual requirements.
- A pending or temporarily missing STX payment confirmation **is not proof of final failure**. Save any transaction ID and purchase identifier, check status again later, and **do not automatically send a second payment**.
- Keep API keys, passwords, wallet seed phrases, and private keys secret. Never add them to public issues, commits, or support messages.

## Support

See the [Support Center](https://koyori-utils-api.koyori-aibtc.workers.dev/support) for guidance. **The dedicated support email is still being set up**; do not assume an address is active until the official support page publishes it.

## Repository and deployment note

This GitHub repository contains project materials, but the **live Cloudflare Workers service is the authoritative reference** for current APIs, purchasing, and service status. Public README updates do **not** deploy the API or change subscriptions.

Built with Cloudflare Workers and Stacks-related payment infrastructure.
