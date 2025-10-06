# SpeedConnect Demo PWA - API Architecture

**Wichtig**: Nur Groq Proxy wird verwendet, KEIN Email-Proxy!

---

## APIs im Einsatz

### ✅ Groq API Proxy (verwendet)

**Endpoint**: `/api/speedconnect/proxy`
**Purpose**: OCR + Email Generation ohne exposed API keys
**Method**: POST

**Actions**:
1. `ocr` - Visitenkarte erkennen (Groq Llama Vision)
2. `email` - Follow-up Email generieren (Groq Llama 3.3 70B)

---

### ❌ Email-Proxy (NICHT verwendet in Demo PWA!)

**Endpoint**: `libralab.ai/api/email/proxy` ← NICHT für Demo PWA!
**Reason**: Demo nutzt Gmail Link statt Direct Send
**Verwendet von**: Nur Thomas Version

---

## Groq Proxy Details

### Endpoint

```
POST /api/speedconnect/proxy
```

### Request Format

#### OCR Action
```json
{
  "action": "ocr",
  "image_base64": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

#### Email Generation Action
```json
{
  "action": "email",
  "prompt": "Schreibe eine Follow-up Email an Max von Beispiel GmbH..."
}
```

### Response Format

```json
{
  "success": true,
  "content": "Extracted JSON or generated email text"
}
```

### Error Response

```json
{
  "error": "Zu viele Anfragen. Bitte 1 Minute warten."
}
```

---

## Rate Limiting

**Per IP**: 10 requests/minute
**Enforcement**: Via Upstash KV counter
**Error**: 429 Too Many Requests

```typescript
const rateLimitKey = `speedconnect:demo:ratelimit:${ip}`;
const count = await kv.incr(rateLimitKey);
if (count === 1) await kv.expire(rateLimitKey, 60);
if (count > 10) return Response.json({ error: '...' }, { status: 429 });
```

---

## Usage Tracking (No PII)

**Tracked**:
- Total OCR calls: `speedconnect:demo:ocr_count`
- Total email generations: `speedconnect:demo:email_count`

**NOT tracked**:
- Namen, Emails, Telefonnummern
- Firmen-Details
- Email-Inhalte

**Purpose**: Validate proof of concept (usage counts only)

---

## Gmail Link (statt Email Send)

### Kein API Call nötig!

**Client-side only**:
```javascript
function openGmailDraft() {
  const params = new URLSearchParams({
    view: 'cm',
    to: recipient,
    su: subject,
    body: body
  });

  const gmailUrl = `https://mail.google.com/mail/?${params.toString()}`;
  window.open(gmailUrl, '_blank');
}
```

**Vorteile**:
- Kein Email-Proxy nötig
- Keine Resend API keys
- User behält Kontrolle
- Sent emails in user's Gmail "Sent" folder

---

## Environment Variables (lapps Repo)

**Required**:
```bash
GROQ_TEST_API_KEY=[test@leodin.com Groq API key]
```

**NOT required** (nicht für Demo PWA):
- ❌ RESEND_API_KEY
- ❌ PERPLEXITY_API_KEY

**Optional** (if already configured):
- KV_REST_API_URL (für rate limiting)
- KV_REST_API_TOKEN

---

## API Flow Diagram

```
Demo PWA (Browser)
  ↓
Photo Upload
  ↓
POST /api/speedconnect/proxy (action: ocr)
  ↓
Groq Vision API (server-side, API key hidden)
  ↓
Return JSON to PWA
  ↓
User reviews data
  ↓
Click "Email erstellen"
  ↓
POST /api/speedconnect/proxy (action: email)
  ↓
Groq Text API (server-side)
  ↓
Return email draft to PWA
  ↓
PWA generates Gmail URL
  ↓
window.open(gmail_url)
  ↓
Gmail opens with pre-filled draft
  ↓
User reviews & sends from Gmail
```

**Kein Email-Proxy involviert!**

---

## Vergleich: Thomas vs Demo PWA

### Thomas Version (Local)
```
Photo → Groq API (direct) → Review
  ↓
Email Gen → Groq API (direct)
  ↓
Send → Resend API (via libralab.ai/api/email/proxy)
  ↓
Save → Redis (direct)
```

**API Keys**: Alle hardcoded im HTML (3 keys)

---

### Demo PWA (Hosted)
```
Photo → /api/speedconnect/proxy (Groq hidden)
  ↓
Review
  ↓
Email Gen → /api/speedconnect/proxy (Groq hidden)
  ↓
Gmail Link → window.open() (kein API call!)
```

**API Keys**: Nur 1 key (Groq), server-side

**Kein Email-Proxy, kein Resend, kein Redis!**

---

## Security Benefits

**Demo PWA**:
- ✅ Groq API key server-side (nicht exposed)
- ✅ Kein Resend key nötig (Gmail Link statt Send)
- ✅ Kein Perplexity key nötig (feature skip)
- ✅ Keine Lead-Daten gespeichert (nur Usage Counter)
- ✅ Rate limiting (abuse protection)

**Thomas Version**:
- ⚠️ 3 API keys exposed (OK für local file)
- ✅ Full Redis access (lib:leads)
- ✅ Direct email send (Resend)
- ✅ Perplexity research

---

## Summary

**Für Demo PWA Coding Agent**:
- Implementiere nur `/api/speedconnect/proxy` (Groq)
- ❌ KEIN Email-Proxy
- ❌ KEIN Resend Integration
- ✅ NUR Gmail Link Generation (client-side)

**Email-Proxy ist nur relevant für**:
- Thomas Version (lokal)
- Andere LibraLab apps (falls nötig)
- NICHT für SpeedConnect Demo PWA

---

**Klar? Nur Groq Proxy! 🚀**
