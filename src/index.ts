// BigInt.toJSON polyfill for JSON.stringify compatibility
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { x402Middleware } from './x402-middleware';
import type { X402Context } from './x402-middleware';

type Env = {
  RECIPIENT_ADDRESS: string;
  NETWORK: string;
  RELAY_URL: string;
};

type Variables = {f
  x402?: X402Context;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// CORS middleware with x402 headers
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['X-PAYMENT', 'X-PAYMENT-TOKEN-TYPE', 'Authorization', 'Content-Type'],
  exposeHeaders: ['X-PAYMENT-RESPONSE', 'X-PAYER-ADDRESS'],
}));

// Startup validation - fail fast if required secrets are missing
app.use('*', async (c, next) => {
  // Skip validation for health check
  if (c.req.path === '/health') {
    return next();
  }

  const missingSecrets: string[] = [];

  if (!c.env.RECIPIENT_ADDRESS) {
    missingSecrets.push('RECIPIENT_ADDRESS');
  }

  if (missingSecrets.length > 0) {
    return c.json({
      error: 'Server configuration error',
      message: `Missing required secrets: ${missingSecrets.join(', ')}`,
      hint: missingSecrets.map(s => `Run: wrangler secret put ${s}`).join(' && '),
    }, 503);
  }

  await next();
});

// Service info at root (free)
// Human-friendly landing page
app.get('/', (c) => {
  return c.html(`
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Koyori Utils API</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family:
        Inter,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
      color: #2d2430;
      background:
        radial-gradient(circle at top left, #ffe7f2 0, transparent 35%),
        radial-gradient(circle at top right, #f5e9ff 0, transparent 32%),
        #fffafd;
      min-height: 100vh;
    }

    a {
      color: inherit;
    }

    .container {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
    }

    header {
      padding: 80px 0 50px;
      text-align: center;
    }

    .badge {
      display: inline-block;
      padding: 8px 14px;
      margin-bottom: 20px;
      border: 1px solid #f2bad4;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.82);
      color: #a83b70;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 8px 30px rgba(197, 79, 133, 0.08);
    }

    h1 {
      margin: 0;
      font-size: clamp(42px, 8vw, 74px);
      line-height: 1;
      letter-spacing: -0.05em;
    }

    .accent {
      color: #d84f8b;
    }

    .subtitle {
      max-width: 680px;
      margin: 24px auto 0;
      color: #6f6370;
      font-size: 18px;
      line-height: 1.7;
    }

    .price {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 28px;
      padding: 12px 18px;
      border-radius: 14px;
      background: #2d2430;
      color: white;
      font-weight: 800;
      box-shadow: 0 12px 30px rgba(45, 36, 48, 0.15);
    }

    .price span {
      color: #ffc9df;
    }

    section {
      padding: 32px 0 70px;
    }

    .section-title {
      margin: 0 0 8px;
      text-align: center;
      font-size: 32px;
    }

    .section-description {
      margin: 0 0 30px;
      text-align: center;
      color: #847884;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 16px;
    }

    .card {
      padding: 22px;
      border: 1px solid #f0dde6;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 12px 35px rgba(70, 40, 60, 0.06);
      transition:
        transform 0.18s ease,
        box-shadow 0.18s ease;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 18px 42px rgba(70, 40, 60, 0.11);
    }

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      margin-bottom: 16px;
      border-radius: 12px;
      background: #fff0f6;
      font-size: 20px;
    }

    .card h3 {
      margin: 0 0 8px;
      font-size: 18px;
    }

    .endpoint {
      display: inline-block;
      margin-bottom: 10px;
      padding: 5px 8px;
      border-radius: 7px;
      background: #f8f3f6;
      color: #9c3f68;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 13px;
    }

    .card p {
      margin: 0;
      color: #746a74;
      line-height: 1.6;
      font-size: 14px;
    }

    .example {
      margin-top: 18px;
      padding: 28px;
      border-radius: 22px;
      background: #2d2430;
      color: #f9edf3;
      overflow-x: auto;
      box-shadow: 0 18px 45px rgba(45, 36, 48, 0.16);
    }

    .example h3 {
      margin-top: 0;
      color: #ffc9df;
    }

    pre {
      margin: 0;
      white-space: pre-wrap;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      line-height: 1.6;
    }

    .buttons {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 30px;
    }

    .button {
      display: inline-block;
      padding: 12px 18px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 750;
      transition: transform 0.15s ease;
    }

    .button:hover {
      transform: translateY(-2px);
    }

    .primary {
      background: #d84f8b;
      color: white;
    }

    .secondary {
      border: 1px solid #e6ced9;
      background: white;
      color: #4b3e49;
    }

    footer {
      padding: 25px 0 45px;
      text-align: center;
      color: #8b7e88;
      font-size: 14px;
    }

    @media (max-width: 600px) {
      header {
        padding-top: 55px;
      }

      .subtitle {
        font-size: 16px;
      }

      .card {
        padding: 18px;
      }
    }
  </style>
</head>

<body>
  <div class="container">

    <header>
      <div class="badge">♡ x402-powered utility API</div>

      <h1>
        Koyori <span class="accent">Utils API</span>
      </h1>

      <p class="subtitle">
        A lightweight collection of developer utilities running on
        Cloudflare Workers and powered by x402 payments on Stacks mainnet.
      </p>

      <div class="price">
        Price
        <span>0.001 STX</span>
        per request
      </div>
    </header>

    <section>
      <h2 class="section-title">10 useful endpoints</h2>

      <p class="section-description">
        Simple tools for developers, bots and AI agents.
      </p>

      <div class="grid">

        <div class="card">
          <div class="icon">#</div>
          <h3>SHA-256 Hash</h3>
          <div class="endpoint">POST /api/hash</div>
          <p>Create a SHA-256 hash from UTF-8 text.</p>
        </div>

        <div class="card">
          <div class="icon">{ }</div>
          <h3>JSON Formatter</h3>
          <div class="endpoint">POST /api/format</div>
          <p>Validate and beautify JSON strings.</p>
        </div>

        <div class="card">
          <div class="icon">123</div>
          <h3>Text Count</h3>
          <div class="endpoint">POST /api/count</div>
          <p>Count characters, words and UTF-8 bytes.</p>
        </div>

        <div class="card">
          <div class="icon">ID</div>
          <h3>UUID v4</h3>
          <div class="endpoint">POST /api/uuid</div>
          <p>Generate a random UUID v4 identifier.</p>
        </div>

        <div class="card">
          <div class="icon">64</div>
          <h3>Base64</h3>
          <div class="endpoint">POST /api/base64</div>
          <p>Encode UTF-8 text or decode Base64 data.</p>
        </div>

        <div class="card">
          <div class="icon">%</div>
          <h3>URL Encode</h3>
          <div class="endpoint">POST /api/url-encode</div>
          <p>Encode and decode URL components.</p>
        </div>

        <div class="card">
          <div class="icon">0x</div>
          <h3>Hex</h3>
          <div class="endpoint">POST /api/hex</div>
          <p>Convert UTF-8 text to and from hexadecimal.</p>
        </div>

        <div class="card">
          <div class="icon">⏱</div>
          <h3>Timestamp</h3>
          <div class="endpoint">POST /api/timestamp</div>
          <p>Convert between Unix timestamps and ISO dates.</p>
        </div>

        <div class="card">
          <div class="icon">→</div>
          <h3>Slug Generator</h3>
          <div class="endpoint">POST /api/slug</div>
          <p>Turn text into a clean URL-friendly slug.</p>
        </div>

        <div class="card">
          <div class="icon">🎲</div>
          <h3>Random Generator</h3>
          <div class="endpoint">POST /api/random</div>
          <p>Generate random strings or integers.</p>
        </div>

      </div>

      <div class="example">
        <h3>Example request</h3>
        <pre>POST /api/hash

{
  "text": "hello"
}

Unauthenticated requests return:

HTTP 402 Payment Required</pre>
      </div>

      <div class="buttons">
        <a
          class="button primary"
          href="https://github.com/sophiaalice0913-cmyk/koyori-utils-api"
          target="_blank"
          rel="noopener noreferrer"
        >
          View source on GitHub
        </a>

        <a
          class="button secondary"
          href="/health"
        >
          Service health
        </a>
      </div>
    </section>

    <footer>
      Koyori Utils API · Cloudflare Workers · x402 · Stacks Mainnet ♡
    </footer>

  </div>
</body>
</html>
  `);
});
// Health check (free)
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    network: c.env.NETWORK || 'testnet',
  });
});
export default app;
