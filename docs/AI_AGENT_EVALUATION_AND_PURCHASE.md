# Koyori Utils API: AI Agent Evaluation & Purchase Guide

Use this guide to evaluate Koyori Utils API **before** connecting a wallet or paying. It is aimed at developers, automation builders, and AI agents that need utility endpoints for JSON/CSV/text processing, encoding, hashing, metadata extraction, and similar tasks.

## 1. Discover an operation without paying

- [Live AI agent catalog](https://koyori-utils-api.koyori-aibtc.workers.dev/agents/catalog): browse or search supported operations.
- [OpenAPI specification](https://koyori-utils-api.koyori-aibtc.workers.dev/openapi.json): inspect the exact path, method, schema, and security requirements.
- [Runnable read-only discovery example](AI_AGENT_DISCOVERY_EXAMPLE.md): use Python to inspect the catalog and OpenAPI without a wallet or paid request.
- [Health endpoint](https://koyori-utils-api.koyori-aibtc.workers.dev/health): check the public service response.

The project advertises **20,000 API operations**; use the live specification to verify what is currently supported. Discovering an endpoint is not the same as receiving paid access.

## 2. Choose a purchase route

There are two **distinct** payment routes. Do not send STX to a Base USDC checkout or Base USDC to an STX payment destination.

### Base-network USDC checkout

| Plan | Listed USDC price | Listed API request allowance | Checkout |
| --- | ---: | ---: | --- |
| Starter | 1.30 | 5,000 | [Starter](https://koyori-utils-api.koyori-aibtc.workers.dev/base-starter/buy?plan=starter) |
| Pro | 2.30 | 10,000 | [Pro](https://koyori-utils-api.koyori-aibtc.workers.dev/base-starter/buy?plan=pro) |
| Developer | 16.00 | 100,000 | [Developer](https://koyori-utils-api.koyori-aibtc.workers.dev/base-starter/buy?plan=developer) |

These are listed prices and allowances, not a guarantee that a payment will complete. Confirm the current terms on the live checkout before signing anything. The checkout pages have passed HTTP response checks; an end-to-end paid purchase has **not** been independently verified by this documentation.

### STX subscriptions

Use the [live STX subscription portal](https://koyori-utils-api.koyori-aibtc.workers.dev/subscription) and [AI quickstart guide](https://koyori-utils-api.koyori-aibtc.workers.dev/agents/quickstart). Pricing and activation requirements may differ from the Base USDC plans.

## 3. Safe workflow for AI agents

1. Discover a suitable API and inspect its OpenAPI definition.
2. Identify whether the operation requires authentication, a subscription, or x402 payment.
3. Show the human the **current** plan, currency, chain, amount, recipient, and expected allowance.
4. Obtain explicit human approval **before** wallet signatures, token transfers, or purchases.
5. Keep the transaction hash, purchase/order ID, and timestamp if a payment is attempted.
6. If confirmation is pending, wait and check status later. **Never automatically pay twice.**
7. Store credentials privately; never publish keys, seed phrases, or signatures in public issues.

## 4. What is and isn't verified

- Public documentation and checkout links exist.
- The Base USDC plan checkout pages and OpenAPI endpoint returned HTTP 200 in the V430 read-only acceptance check.
- HTTP 200 does **not** establish that the wallet-signing, order, settlement, or API-credit delivery flow succeeds for a real purchase.
- This guide does not claim measured conversion rates, revenue, or customer demand.

## 5. Useful links

- [Koyori Utils API home](https://koyori-utils-api.koyori-aibtc.workers.dev/)
- [AI agent catalog](https://koyori-utils-api.koyori-aibtc.workers.dev/agents/catalog)
- [OpenAPI](https://koyori-utils-api.koyori-aibtc.workers.dev/openapi.json)
- [Support center](https://koyori-utils-api.koyori-aibtc.workers.dev/support)

_This is a documentation update only. It does not deploy Cloudflare Workers, initiate payments, or modify D1._
