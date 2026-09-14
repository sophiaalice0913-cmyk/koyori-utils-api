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
app.get('/', (c) => {
  return c.html(`
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Koyori Utils API</title>
</head>
<body>
  <main>
    <h1>Koyori Utils API</h1>
    <p>Live x402 utility API on Stacks mainnet.</p>
    <p><strong>Price:</strong> 0.001 STX per request</p>

    <h2>Endpoints</h2>
    <ul>
      <li><code>POST /api/hash</code> - SHA-256 hashing</li>
      <li><code>POST /api/format</code> - JSON formatting</li>
      <li><code>POST /api/count</code> - Character, word, and byte counting</li>
      <li><code>POST /api/uuid</code> - UUID v4 generation</li>
      <li><code>POST /api/base64</code> - Base64 encode / decode</li>
      <li><code>POST /api/url-encode</code> - URL encode / decode</li>
      <li><code>POST /api/hex</code> - Hex encode / decode</li>
      <li><code>POST /api/timestamp</code> - Unix / ISO timestamp conversion</li>
    </ul>

    <p><a href="https://github.com/sophiaalice0913-cmyk/koyori-utils-api">View source on GitHub</a></p>
  </main>
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
    const body = await c.req.json<Record<string, unknown>>().catch(() => ({}));
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
    const body = await c.req.json<Record<string, unknown>>().catch(() => ({}));
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
export default app;
