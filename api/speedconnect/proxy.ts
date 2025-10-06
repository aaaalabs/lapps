import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

const GROQ_API_KEY = process.env.GROQ_TEST_API_KEY;

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { action, image_base64, prompt, event } = body;

    // Rate limiting (10 requests per minute per IP)
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitKey = `speedconnect:demo:ratelimit:${ip}`;

    const currentCount = await kv.incr(rateLimitKey);
    if (currentCount === 1) {
      await kv.expire(rateLimitKey, 60); // 1 minute TTL
    }

    if (currentCount > 10) {
      return Response.json(
        { error: 'Zu viele Anfragen. Bitte 1 Minute warten.' },
        { status: 429 }
      );
    }

    // Handle different actions
    if (action === 'ocr') {
      return await handleOCR(image_base64);
    } else if (action === 'email') {
      return await handleEmailGeneration(prompt);
    } else if (action === 'track') {
      return await handleTracking(event, ip);
    } else {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return Response.json(
      {
        error: 'Verarbeitung fehlgeschlagen',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleOCR(image_base64: string) {
  // Validate image
  if (!image_base64?.startsWith('data:image/')) {
    return Response.json({ error: 'Ungültiges Bildformat' }, { status: 400 });
  }

  if (!GROQ_API_KEY) {
    console.error('GROQ_TEST_API_KEY not configured');
    throw new Error('API key not configured');
  }

  // Call Groq Vision API
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.2-90b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analysiere diese Visitenkarte und extrahiere die Informationen als JSON.
Nur JSON zurückgeben, keine Erklärungen.

Format:
{
  "company": "Firmenname",
  "contact": "Vor- und Nachname der Person",
  "position": "Jobtitel/Position",
  "email": "Email-Adresse",
  "phone": "Telefonnummer",
  "industry": "Branche/Industrie"
}

Wenn Informationen fehlen, verwende leere Strings "".`,
              },
              {
                type: 'image_url',
                image_url: { url: image_base64 },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Groq API error: ${response.status}`, errorText);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Track usage
  await kv.incr('speedconnect:demo:ocr_count');

  return Response.json({
    success: true,
    content: content,
  });
}

async function handleEmailGeneration(prompt: string) {
  if (!GROQ_API_KEY) {
    console.error('GROQ_TEST_API_KEY not configured');
    throw new Error('API key not configured');
  }

  // Call Groq Text API
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'Du bist ein professioneller Business Development Manager, der authentische Follow-up Emails nach Messekontakten schreibt. Schreibe in österreichischem Deutsch, verwende die Du-Form, und sei persönlich aber professionell.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Groq API error: ${response.status}`, errorText);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Track usage
  await kv.incr('speedconnect:demo:email_count');

  return Response.json({
    success: true,
    content: content,
  });
}

async function handleTracking(event: string, ip: string) {
  // Track usage (no PII)
  const trackingKey = `speedconnect:demo:events:${event}`;
  await kv.incr(trackingKey);

  // Store event log (anonymized IP)
  await kv.lpush('speedconnect:demo:event_log', {
    event,
    timestamp: new Date().toISOString(),
    ip_hash: hashIP(ip),
  });

  // Trim log to last 1000 entries
  await kv.ltrim('speedconnect:demo:event_log', 0, 999);

  return Response.json({ success: true });
}

function hashIP(ip: string): string {
  // Simple hash for privacy (not cryptographic)
  if (typeof btoa !== 'undefined') {
    return btoa(ip).substring(0, 8);
  }
  // Edge runtime fallback
  return Buffer.from(ip).toString('base64').substring(0, 8);
}
