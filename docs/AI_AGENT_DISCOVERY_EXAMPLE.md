# AI Agent Example: Discover APIs Before You Buy

This minimal, **read-only** example shows how an AI agent or developer can discover API tools and inspect their schemas **without making a paid API call or sending STX**.

The public service currently advertises **20,000 API operations**. Always use the *live* catalog and OpenAPI document instead of hard-coding an endpoint list.

> Safety note: The steps below only read public discovery resources. They do not purchase a subscription, sign a transaction, reveal an API key, or call a paid utility endpoint.

## 1. Browse relevant tools

Open the [live API catalog](https://koyori-utils-api.koyori-aibtc.workers.dev/agents/catalog).

For a small search, try this public GET request:

```bash
curl --fail-with-body --get \
  "https://koyori-utils-api.koyori-aibtc.workers.dev/agents/catalog" \
  --data-urlencode "q=json" \
  --data-urlencode "limit=3"
```

Look at the **actual response** to choose a suitable endpoint. Do not assume a particular operation name or JSON field before inspecting it.

## 2. Inspect OpenAPI

```bash
curl --fail-with-body -o openapi.json \
  "https://koyori-utils-api.koyori-aibtc.workers.dev/openapi.json"
```

Find the selected operation in the `paths` section and read its method, input schema, output schema, and any security/payment requirements.

**Do not execute the selected operation yet.** The discovery requests above are intentionally separate from paid API calls.

## 3. A runnable Python discovery-only example

Uses only the Python standard library; no account or API key is needed to inspect public discovery information.

```python
import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

BASE = "https://koyori-utils-api.koyori-aibtc.workers.dev"
query = urlencode({"q": "json", "limit": 3})

def read_public_json(url):
    request = Request(url, headers={"Accept": "application/json"})
    with urlopen(request, timeout=20) as response:
        return json.load(response)

try:
    catalog = read_public_json(f"{BASE}/agents/catalog?{query}")
    print("Catalog preview:")
    print(json.dumps(catalog, indent=2, ensure_ascii=False)[:3000])

    specification = read_public_json(f"{BASE}/openapi.json")
    paths = specification.get("paths", {})
    print(f"OpenAPI paths advertised: {len(paths)}")
    print("Inspect the relevant path and HTTP method before any paid request.")
except HTTPError as exc:
    print(f"HTTP {exc.code}: Discovery request did not succeed; no payment attempted.")
except (URLError, TimeoutError, ValueError) as exc:
    print(f"Discovery failed: {exc}; no payment attempted.")
```

The printed preview intentionally does not assume the catalog's JSON structure, and the script never chooses or invokes a paid endpoint automatically.

## 4. Pricing, approval, and access

- Read the [V278 AI quickstart / purchase guide](https://koyori-utils-api.koyori-aibtc.workers.dev/agents/quickstart).
- Consult the [subscription portal](https://koyori-utils-api.koyori-aibtc.workers.dev/subscription) for **current** plans, pricing, and activation instructions.
- Before paying STX, submitting a wallet signature, or buying a subscription, **obtain explicit human authorization**.
- Some APIs can respond with HTTP 402 when payment is required; inspect actual payment requirements rather than assuming a universal amount.
- If a transaction is pending or not immediately reflected, **do not retry payment automatically**. Save the transaction ID and check status later.
- Never paste API keys, seed phrases, passwords, or private keys into issues, logs, or prompts.

## Additional resources

- [Home](https://koyori-utils-api.koyori-aibtc.workers.dev/)
- [AI Agent Catalog](https://koyori-utils-api.koyori-aibtc.workers.dev/agents/catalog)
- [V278 Quickstart](https://koyori-utils-api.koyori-aibtc.workers.dev/agents/quickstart)
- [OpenAPI](https://koyori-utils-api.koyori-aibtc.workers.dev/openapi.json)
- [Support](https://koyori-utils-api.koyori-aibtc.workers.dev/support) (dedicated email setup in progress)

_This is documentation only. No Cloudflare deployment or customer database change is involved._
