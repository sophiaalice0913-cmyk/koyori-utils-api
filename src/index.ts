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

type Variables = {
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
// Generates a secure SHA-256 hash of the input string (tier: simple)
app.post('/api/hash',
  x402Middleware({
    amount: '1000',
    tokenType: 'STX',
  }),
  async (c) => {
    const payment = c.get('x402');

    // Parse request body
    const body = await c.req.json<Record<string, unknown>>().catch(() => ({} as Record<string, unknown>));
    const text = body.text;

    if (typeof text !== 'string') {
      return c.json({ success: false, error: "Missing or invalid 'text' parameter." }, 400);
    }

    // Native Web Crypto API
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return c.json({
      success: true,
      sha256: hashHex,
      payment: {
        txId: payment?.settleResult?.txId,
        sender: payment?.payerAddress,
      },
    });
  }
);

// Validates and beautifies JSON strings (tier: simple)
app.post('/api/format',
  x402Middleware({
    amount: '1000',
    tokenType: 'STX',
  }),
  async (c) => {
    const payment = c.get('x402');

    // Parse request body
    const body = await c.req.json<Record<string, unknown>>().catch(() => ({} as Record<string, unknown>));
    const rawJsonString = body.jsonString;

    if (typeof rawJsonString !== 'string') {
      return c.json({ success: false, error: "Missing or invalid 'jsonString' parameter." }, 400);
    }

    try {
      const parsedObj = JSON.parse(rawJsonString);
      const formatted = JSON.stringify(parsedObj, null, 2);
      return c.json({
        success: true,
        formatted,
        payment: {
          txId: payment?.settleResult?.txId,
          sender: payment?.payerAddress,
        },
      });
    } catch (err: any) {
      return c.json({ success: false, error: "Invalid JSON format: " + err.message }, 400);
    }
  }
);


// Counts characters, words, and UTF-8 bytes (tier: simple)
app.post('/api/count',
  x402Middleware({
    amount: '1000',
    tokenType: 'STX',
  }),
  async (c) => {
    const payment = c.get('x402');

    const body = await c.req.json().catch(() => ({}));
    const text =
      typeof body === 'object' &&
      body !== null &&
      'text' in body
        ? (body as Record<string, unknown>).text
        : undefined;

    if (typeof text !== 'string') {
      return c.json(
        { success: false, error: "Missing or invalid 'text' parameter." },
        400
      );
    }

    const characters = Array.from(text).length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/u).length;
    const bytes = new TextEncoder().encode(text).length;

    return c.json({
      success: true,
      characters,
      words,
      bytes,
      payment: {
        txId: payment?.settleResult?.txId,
        sender: payment?.payerAddress,
      },
    });
  }
);
// Generates a UUID v4 (tier: simple)
app.post('/api/uuid',
  x402Middleware({
    amount: '1000',
    tokenType: 'STX',
  }),
  async (c) => {
    const payment = c.get('x402');

    const uuid = crypto.randomUUID();

    return c.json({
      success: true,
      uuid,
      payment: {
        txId: payment?.settleResult?.txId,
        sender: payment?.payerAddress,
      },
    });
  }
);
// Encodes and decodes UTF-8 text using Base64 (tier: simple)
app.post('/api/base64',
  x402Middleware({
    amount: '1000',
    tokenType: 'STX',
  }),
  async (c) => {
    const payment = c.get('x402');

    const body = await c.req.json().catch(() => ({}));
    const action =
      typeof body === 'object' && body !== null && 'action' in body
        ? (body as Record<string, unknown>).action
        : undefined;
    const text =
      typeof body === 'object' && body !== null && 'text' in body
        ? (body as Record<string, unknown>).text
        : undefined;

    if ((action !== 'encode' && action !== 'decode') || typeof text !== 'string') {
      return c.json(
        {
          success: false,
          error: "Use action 'encode' or 'decode' and provide a string 'text'."
        },
        400
      );
    }

    try {
      let result: string;

      if (action === 'encode') {
        const bytes = new TextEncoder().encode(text);
        let binary = '';
        for (const byte of bytes) {
          binary += String.fromCharCode(byte);
        }
        result = btoa(binary);
      } else {
        const binary = atob(text);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        result = new TextDecoder().decode(bytes);
      }

      return c.json({
        success: true,
        action,
        result,
        payment: {
          txId: payment?.settleResult?.txId,
          sender: payment?.payerAddress,
        },
      });
    } catch {
      return c.json(
        { success: false, error: 'Invalid Base64 input.' },
        400
      );
    }
  }
);
// Encodes and decodes URL components (tier: simple)
app.post('/api/url-encode',
  x402Middleware({
    amount: '1000',
    tokenType: 'STX',
  }),
  async (c) => {
    const payment = c.get('x402');

    const body = await c.req.json().catch(() => ({}));
    const action =
      typeof body === 'object' && body !== null && 'action' in body
        ? (body as Record<string, unknown>).action
        : undefined;
    const text =
      typeof body === 'object' && body !== null && 'text' in body
        ? (body as Record<string, unknown>).text
        : undefined;

    if ((action !== 'encode' && action !== 'decode') || typeof text !== 'string') {
      return c.json(
        {
          success: false,
          error: "Use action 'encode' or 'decode' and provide a string 'text'."
        },
        400
      );
    }

    try {
      const result =
        action === 'encode'
          ? encodeURIComponent(text)
          : decodeURIComponent(text);

      return c.json({
        success: true,
        action,
        result,
        payment: {
          txId: payment?.settleResult?.txId,
          sender: payment?.payerAddress,
        },
      });
    } catch {
      return c.json(
        { success: false, error: 'Invalid URL-encoded input.' },
        400
      );
    }
  }
);
// Encodes and decodes UTF-8 text using hexadecimal (tier: simple)
app.post('/api/hex',
  x402Middleware({
    amount: '1000',
    tokenType: 'STX',
  }),
  async (c) => {
    const payment = c.get('x402');

    const body = await c.req.json().catch(() => ({}));
    const action =
      typeof body === 'object' && body !== null && 'action' in body
        ? (body as Record<string, unknown>).action
        : undefined;
    const text =
      typeof body === 'object' && body !== null && 'text' in body
        ? (body as Record<string, unknown>).text
        : undefined;

    if ((action !== 'encode' && action !== 'decode') || typeof text !== 'string') {
      return c.json(
        {
          success: false,
          error: "Use action 'encode' or 'decode' and provide a string 'text'."
        },
        400
      );
    }

    try {
      let result: string;

      if (action === 'encode') {
        const bytes = new TextEncoder().encode(text);
        result = Array.from(bytes)
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('');
      } else {
        if (text.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(text)) {
          return c.json(
            { success: false, error: 'Invalid hexadecimal input.' },
            400
          );
        }

        const bytes = new Uint8Array(
          text.match(/.{2}/g)?.map((pair) => parseInt(pair, 16)) ?? []
        );

        result = new TextDecoder().decode(bytes);
      }

      return c.json({
        success: true,
        action,
        result,
        payment: {
          txId: payment?.settleResult?.txId,
          sender: payment?.payerAddress,
        },
      });
    } catch {
      return c.json(
        { success: false, error: 'Hex conversion failed.' },
        400
      );
    }
  }
);
// Converts Unix timestamps and ISO date strings (tier: simple)
app.post('/api/timestamp',
  x402Middleware({
    amount: '1000',
    tokenType: 'STX',
  }),
  async (c) => {
    const payment = c.get('x402');

    const body = await c.req.json().catch(() => ({}));
    const action =
      typeof body === 'object' && body !== null && 'action' in body
        ? (body as Record<string, unknown>).action
        : undefined;
    const value =
      typeof body === 'object' && body !== null && 'value' in body
        ? (body as Record<string, unknown>).value
        : undefined;

    try {
      let result: string | number;

      if (action === 'to-iso') {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          return c.json(
            { success: false, error: "For 'to-iso', provide numeric 'value' in Unix seconds." },
            400
          );
        }

        result = new Date(value * 1000).toISOString();
      } else if (action === 'to-unix') {
        if (typeof value !== 'string') {
          return c.json(
            { success: false, error: "For 'to-unix', provide ISO date string 'value'." },
            400
          );
        }

        const timestamp = Date.parse(value);

        if (Number.isNaN(timestamp)) {
          return c.json(
            { success: false, error: 'Invalid ISO date string.' },
            400
          );
        }

        result = Math.floor(timestamp / 1000);
      } else {
        return c.json(
          { success: false, error: "Use action 'to-iso' or 'to-unix'." },
          400
        );
      }

      return c.json({
        success: true,
        action,
        result,
        payment: {
          txId: payment?.settleResult?.txId,
          sender: payment?.payerAddress,
        },
      });
    } catch {
      return c.json(
        { success: false, error: 'Timestamp conversion failed.' },
        400
      );
    }
  }
);
// Converts text into a URL-friendly slug (tier: simple)
app.post('/api/slug',
  x402Middleware({
    amount: '1000',
    tokenType: 'STX',
  }),
  async (c) => {
    const payment = c.get('x402');

    const body = await c.req.json().catch(() => ({}));
    const text =
      typeof body === 'object' && body !== null && 'text' in body
        ? (body as Record<string, unknown>).text
        : undefined;

    if (typeof text !== 'string') {
      return c.json(
        { success: false, error: "Provide a string 'text'." },
        400
      );
    }

    const result = text
      .normalize('NFKD')
      .toLowerCase()
      .trim()
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return c.json({
      success: true,
      result,
      payment: {
        txId: payment?.settleResult?.txId,
        sender: payment?.payerAddress,
      },
    });
  }
);
// Generates random strings or integers (tier: simple)
app.post('/api/random',
  x402Middleware({
    amount: '1000',
    tokenType: 'STX',
  }),
  async (c) => {
    const payment = c.get('x402');

    const body = await c.req.json().catch(() => ({}));
    const type =
      typeof body === 'object' && body !== null && 'type' in body
        ? (body as Record<string, unknown>).type
        : undefined;

    if (type === 'string') {
      const length =
        typeof body === 'object' && body !== null && 'length' in body
          ? (body as Record<string, unknown>).length
          : undefined;

      if (
        typeof length !== 'number' ||
        !Number.isInteger(length) ||
        length < 1 ||
        length > 256
      ) {
        return c.json(
          { success: false, error: "For type 'string', length must be an integer from 1 to 256." },
          400
        );
      }

      const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const random = new Uint32Array(length);
      crypto.getRandomValues(random);

      const result = Array.from(random)
        .map((value) => chars[value % chars.length])
        .join('');

      return c.json({
        success: true,
        type,
        result,
        payment: {
          txId: payment?.settleResult?.txId,
          sender: payment?.payerAddress,
        },
      });
    }

    if (type === 'integer') {
      const min =
        typeof body === 'object' && body !== null && 'min' in body
          ? (body as Record<string, unknown>).min
          : undefined;
      const max =
        typeof body === 'object' && body !== null && 'max' in body
          ? (body as Record<string, unknown>).max
          : undefined;

      if (
        typeof min !== 'number' ||
        typeof max !== 'number' ||
        !Number.isInteger(min) ||
        !Number.isInteger(max) ||
        min > max
      ) {
        return c.json(
          { success: false, error: "For type 'integer', provide integer 'min' and 'max' with min <= max." },
          400
        );
      }

      const range = max - min + 1;

      if (range <= 0 || range > 4294967296) {
        return c.json(
          { success: false, error: 'Integer range is too large.' },
          400
        );
      }

      const random = new Uint32Array(1);
      crypto.getRandomValues(random);

      const result = min + (random[0] % range);

      return c.json({
        success: true,
        type,
        result,
        payment: {
          txId: payment?.settleResult?.txId,
          sender: payment?.payerAddress,
        },
      });
    }

    return c.json(
      { success: false, error: "Use type 'string' or 'integer'." },
      400
    );
  }
);


// Public OpenAPI specification (free)
app.get('/openapi.json', (c) => {
  return c.json({
    openapi: '3.1.0',
    info: {
      title: 'Koyori Utils API',
      version: '1.0.0',
      description: 'Lightweight x402-powered developer utilities on Stacks mainnet.'
    },
    servers: [
      {
        url: 'https://koyori-utils-api.koyori-aibtc.workers.dev'
      }
    ],
    paths: {
      '/api/hash': {
        post: {
          summary: 'Create a SHA-256 hash',
          description: 'Hashes UTF-8 text with SHA-256. Requires x402 payment of 0.001 STX.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['text'],
                  properties: {
                    text: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: 'Successful hash response' },
            '402': { description: 'Payment Required' }
          }
        }
      },
      '/api/format': {
        post: {
          summary: 'Format JSON',
          description: 'Validates and pretty-prints a JSON string. Requires x402 payment of 0.001 STX.',
          responses: {
            '200': { description: 'Formatted JSON response' },
            '402': { description: 'Payment Required' }
          }
        }
      },
      '/api/count': {
        post: {
          summary: 'Count text',
          description: 'Counts characters, words, and UTF-8 bytes. Requires x402 payment of 0.001 STX.',
          responses: {
            '200': { description: 'Count response' },
            '402': { description: 'Payment Required' }
          }
        }
      },
      '/api/uuid': {
        post: {
          summary: 'Generate UUID v4',
          description: 'Generates a UUID v4. Requires x402 payment of 0.001 STX.',
          responses: {
            '200': { description: 'UUID response' },
            '402': { description: 'Payment Required' }
          }
        }
      },
      '/api/base64': {
        post: {
          summary: 'Base64 encode/decode',
          description: 'Encodes or decodes Base64. Requires x402 payment of 0.001 STX.',
          responses: {
            '200': { description: 'Base64 response' },
            '402': { description: 'Payment Required' }
          }
        }
      },
      '/api/url-encode': {
        post: {
          summary: 'URL encode/decode',
          description: 'Encodes or decodes URL components. Requires x402 payment of 0.001 STX.',
          responses: {
            '200': { description: 'URL encode/decode response' },
            '402': { description: 'Payment Required' }
          }
        }
      },
      '/api/hex': {
        post: {
          summary: 'Hex encode/decode',
          description: 'Encodes or decodes hexadecimal text. Requires x402 payment of 0.001 STX.',
          responses: {
            '200': { description: 'Hex response' },
            '402': { description: 'Payment Required' }
          }
        }
      },
      '/api/timestamp': {
        post: {
          summary: 'Convert timestamps',
          description: 'Converts between Unix timestamps and ISO dates. Requires x402 payment of 0.001 STX.',
          responses: {
            '200': { description: 'Timestamp conversion response' },
            '402': { description: 'Payment Required' }
          }
        }
      },
      '/api/slug': {
        post: {
          summary: 'Generate slug',
          description: 'Creates a URL-friendly slug. Requires x402 payment of 0.001 STX.',
          responses: {
            '200': { description: 'Slug response' },
            '402': { description: 'Payment Required' }
          }
        }
      },
      '/api/random': {
        post: {
          summary: 'Generate random value',
          description: 'Generates a random string or integer. Requires x402 payment of 0.001 STX.',
          responses: {
            '200': { description: 'Random value response' },
            '402': { description: 'Payment Required' }
          }
        }
      }
    }
  });
});

// AI-readable service summary (free)
app.get('/llms.txt', (c) => {
  return c.text(`# Koyori Utils API

Koyori Utils API is a lightweight x402-powered utility API running on Cloudflare Workers and Stacks mainnet.

Base URL:
https://koyori-utils-api.koyori-aibtc.workers.dev

OpenAPI:
https://koyori-utils-api.koyori-aibtc.workers.dev/openapi.json

Metadata:
https://koyori-utils-api.koyori-aibtc.workers.dev/metadata.json

Price:
0.001 STX per paid request

Available tools:
- SHA-256 hashing
- JSON formatting
- Character, word, and byte counting
- UUID v4 generation
- Base64 encode/decode
- URL encode/decode
- Hex encode/decode
- Unix/ISO timestamp conversion
- URL-friendly slug generation
- Random string/integer generation

Paid endpoints return HTTP 402 Payment Required when called without a valid x402 payment.
`);
});
// Public AIBTC agent metadata (free)
app.get('/metadata.json', (c) => {
  return c.json({
    name: 'Somber Saber',
    description:
      'AIBTC agent providing lightweight x402-powered developer utilities on Stacks mainnet.',
    website:
      'https://koyori-utils-api.koyori-aibtc.workers.dev',
    api_url:
      'https://koyori-utils-api.koyori-aibtc.workers.dev',
    openapi_url:
      'https://koyori-utils-api.koyori-aibtc.workers.dev/openapi.json',
    services: [
      'SHA-256 hashing',
      'JSON formatting',
      'Character, word, and byte counting',
      'UUID v4 generation',
      'Base64 encode/decode',
      'URL encode/decode',
      'Hex encode/decode',
      'Unix/ISO timestamp conversion',
      'URL-friendly slug generation',
      'Random string/integer generation'
    ],
    payment: {
      protocol: 'x402',
      network: 'Stacks mainnet',
      price: '0.001 STX per request'
    }
  });
});
export default app;
