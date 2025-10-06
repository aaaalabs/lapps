# Email Lead Magnet - Groq Proxy Zugang

**Konzept**: User gibt Email ein → Groq Proxy funktioniert → LibraLab sammelt Leads

---

## Setup Flow (Angepasst)

### Screen 1: Willkommen + Email-Eingabe

```
┌────────────────────────────────┐
│  🚀 SpeedConnect                │
├────────────────────────────────┤
│                                 │
│  Visitenkarten in 30 Sekunden   │
│  zu personalisierten Emails     │
│                                 │
│  ─────────────────────────      │
│                                 │
│  Ihre Email-Adresse *           │
│  [ihre@email.at           ]    │
│                                 │
│  Firmenname *                   │
│  [Ihre Firma GmbH         ]    │
│                                 │
│  [Details ▼] (optional)         │
│  └─ Website                     │
│  └─ Kalender-Link               │
│  └─ Gratis-Angebot              │
│                                 │
│  [✓ Jetzt starten]              │
│                                 │
│  ℹ️ Lokal gespeichert           │
└────────────────────────────────┘
```

**Felder**:
1. ✅ **Email** (required, lead magnet!)
2. ✅ **Firmenname** (required)
3. ⚠️ **Website** (optional, collapsible)
4. ⚠️ **Kalender-Link** (optional, collapsible)
5. ⚠️ **Gratis-Angebot** (optional, collapsible)

---

## Groq Proxy - Email-basierte Authentifizierung

### Proxy Request (mit Email)

```javascript
// Client sendet Email mit jedem Request
const response = await fetch('/api/speedconnect/proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_email: 'max@beispiel.at',  // ← Lead Magnet!
    action: 'ocr',
    image_base64: base64Image
  })
});
```

### Proxy Validation

```typescript
export default async function handler(req: Request) {
  const { user_email, action, image_base64, prompt } = await req.json();

  // Validate email provided
  if (!user_email || !user_email.includes('@')) {
    return Response.json(
      { error: 'Email-Adresse erforderlich um SpeedConnect zu nutzen.' },
      { status: 400 }
    );
  }

  // Store email in Upstash KV (lead magnet!)
  await kv.sadd('speedconnect:demo:users', user_email);
  await kv.hset(`speedconnect:demo:user:${user_email}`, {
    email: user_email,
    first_seen: new Date().toISOString(),
    last_used: new Date().toISOString(),
    usage_count: await kv.incr(`speedconnect:demo:usage:${user_email}`)
  });

  // Then process request (OCR or Email)
  if (action === 'ocr') {
    return await handleOCR(image_base64);
  } else if (action === 'email') {
    return await handleEmailGeneration(prompt);
  }
}
```

**Lead Magnet**: Jeder der die App nutzt, gibt seine Email an → LibraLab Lead!

---

## Setup Form (Updated)

```html
<div class="setup-section" id="setupSection">
  <div class="card">
    <h2 class="section-title">🚀 SpeedConnect</h2>
    <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">
      Visitenkarten scannen, Emails senden. In 30 Sekunden.
    </p>

    <!-- Email Field - REQUIRED (Lead Magnet) -->
    <div class="review-field">
      <label>Ihre Email-Adresse *</label>
      <input
        type="email"
        id="setupUserEmail"
        required
        placeholder="ihre@email.at"
        class="review-input"
      >
      <small class="input-hint">
        Benötigt für App-Nutzung. Keine Werbemails.
      </small>
    </div>

    <!-- Company Name - REQUIRED -->
    <div class="review-field">
      <label>Firmenname *</label>
      <input
        type="text"
        id="setupCompanyName"
        required
        placeholder="Ihre Firma GmbH"
        class="review-input"
      >
    </div>

    <!-- Optional Fields (Collapsible) -->
    <details class="optional-fields" style="margin-top: 1rem;">
      <summary style="cursor: pointer; font-weight: 600; margin-bottom: 1rem;">
        Weitere Details (optional) ▼
      </summary>

      <div class="review-field">
        <label>Website</label>
        <input
          type="url"
          id="setupWebsite"
          placeholder="https://ihre-firma.at"
          class="review-input"
        >
      </div>

      <div class="review-field">
        <label>Google Calendar Link</label>
        <input
          type="url"
          id="setupCalendarLink"
          placeholder="https://calendar.app.google/..."
          class="review-input"
        >
      </div>

      <div class="review-field">
        <label>Gratis-Angebot</label>
        <input
          type="text"
          id="setupFreeOffer"
          placeholder="z.B. 'Gratis Erstgespräch (30 Min)'"
          class="review-input"
        >
      </div>
    </details>

    <button class="btn btn-primary btn-large" onclick="saveSetupAndStart()">
      ✅ Jetzt starten
    </button>

    <p class="setup-note">
      💡 Daten werden lokal auf Ihrem Gerät gespeichert.
    </p>
  </div>
</div>
```

---

## Save Setup (Updated)

```javascript
function saveSetupAndStart() {
  const userEmail = document.getElementById('setupUserEmail').value.trim();
  const companyName = document.getElementById('setupCompanyName').value.trim();
  const website = document.getElementById('setupWebsite').value.trim();
  const calendarLink = document.getElementById('setupCalendarLink').value.trim();
  const freeOffer = document.getElementById('setupFreeOffer').value.trim();

  // Validate required fields
  if (!userEmail || !userEmail.includes('@')) {
    alert('Bitte gültige Email-Adresse eingeben.');
    document.getElementById('setupUserEmail').focus();
    return;
  }

  if (!companyName) {
    alert('Bitte Firmennamen eingeben.');
    document.getElementById('setupCompanyName').focus();
    return;
  }

  // Generate icon
  const iconDataUrl = generateCompanyIcon(companyName);

  // Save to localStorage
  const setupData = {
    userEmail,      // ← Lead Magnet Email!
    companyName,
    website,
    calendarLink,
    freeOffer,
    icon: iconDataUrl,
    setupDate: new Date().toISOString()
  };

  localStorage.setItem('speedconnect_setup', JSON.stringify(setupData));
  localStorage.setItem('speedconnect_setup_complete', 'true');

  // Apply branding
  applyBranding();

  // Show upload section
  document.getElementById('setupSection').style.display = 'none';
  document.getElementById('uploadSection').style.display = 'block';

  showSuccess(`✅ Willkommen ${companyName}! Jetzt erste Visitenkarte scannen.`);
}
```

---

## API Calls (mit Email)

### OCR Request

```javascript
async function extractBusinessCardData(base64Image) {
  const setup = getSetupData();

  const response = await fetch('/api/speedconnect/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_email: setup.userEmail,  // ← Email required!
      action: 'ocr',
      image_base64: base64Image
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'OCR fehlgeschlagen');
  }

  const data = await response.json();
  const jsonMatch = data.content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error('Keine Daten erkannt');
}
```

### Email Generation Request

```javascript
async function generatePersonalizedEmail(leadData) {
  const setup = getSetupData();

  // Build prompt with setup data
  const prompt = buildEmailPrompt(leadData, setup);

  const response = await fetch('/api/speedconnect/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_email: setup.userEmail,  // ← Email required!
      action: 'email',
      prompt: prompt
    })
  });

  if (!response.ok) {
    throw new Error('Email-Generierung fehlgeschlagen');
  }

  const data = await response.json();
  return parseEmailResponse(data.content);
}
```

---

## Lead Collection (Server-Side)

### Redis Schema

```
Key: speedconnect:demo:users (SET)
Members: ["max@beispiel.at", "anna@firma.at", ...]

Key: speedconnect:demo:user:{email} (HASH)
Fields:
  email: "max@beispiel.at"
  first_seen: "2025-10-05T10:00:00Z"
  last_used: "2025-10-05T14:30:00Z"
  usage_count: 5

Key: speedconnect:demo:usage:{email} (INTEGER)
Value: 5 (number of API calls)
```

**Auswertung nach Herbstmesse**:
```bash
# Get all demo users
redis-cli SMEMBERS speedconnect:demo:users

# Count unique users
redis-cli SCARD speedconnect:demo:users

# Get user details
redis-cli HGETALL speedconnect:demo:user:max@beispiel.at
```

---

## Proxy Implementation (Updated)

```typescript
export default async function handler(req: Request) {
  try {
    const { user_email, action, image_base64, prompt } = await req.json();

    // Validate email (lead magnet requirement)
    if (!user_email || !user_email.includes('@')) {
      return Response.json(
        {
          error: 'Email-Adresse erforderlich.',
          message: 'Bitte geben Sie Ihre Email in den Einstellungen ein.'
        },
        { status: 400 }
      );
    }

    // Store email (lead magnet!)
    await kv.sadd('speedconnect:demo:users', user_email);

    const userKey = `speedconnect:demo:user:${user_email}`;
    const existingUser = await kv.exists(userKey);

    if (!existingUser) {
      // New user
      await kv.hset(userKey, {
        email: user_email,
        first_seen: new Date().toISOString(),
        last_used: new Date().toISOString(),
        usage_count: 1
      });
    } else {
      // Existing user - update last used + increment count
      await kv.hset(userKey, 'last_used', new Date().toISOString());
      await kv.hincrby(userKey, 'usage_count', 1);
    }

    // Rate limiting per email (not IP)
    const rateLimitKey = `speedconnect:demo:ratelimit:${user_email}`;
    const count = await kv.incr(rateLimitKey);
    if (count === 1) await kv.expire(rateLimitKey, 60);

    if (count > 10) {
      return Response.json(
        { error: 'Zu viele Anfragen. Bitte 1 Minute warten.' },
        { status: 429 }
      );
    }

    // Process request
    if (action === 'ocr') {
      return await handleOCR(image_base64);
    } else if (action === 'email') {
      return await handleEmailGeneration(prompt);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Proxy error:', error);
    return Response.json(
      { error: 'Verarbeitung fehlgeschlagen' },
      { status: 500 }
    );
  }
}
```

---

## Lead Magnet Benefits

### Für LibraLab

**Automatische Lead-Sammlung**:
- Jeder Demo-User gibt Email an
- Email in Redis gespeichert
- Nutzungs-Statistik trackbar
- Follow-up möglich

**Post-Herbstmesse**:
```bash
# Alle Demo-User IDs
redis-cli SMEMBERS speedconnect:demo:users

# Beispiel: 15 Exhibitors haben getestet
# → 15 Email-Adressen gesammelt
# → Follow-up Email: "SpeedConnect jetzt verfügbar, 50% Rabatt"
```

---

### Für User

**Was User gibt**:
- Email-Adresse (einmalig)

**Was User bekommt**:
- Gratis SpeedConnect Demo
- Unbegrenzte Nutzung
- Keine Zahlungsdaten
- Kein Spam (nur Product Updates)

**Fair Trade**: Email für kostenlosen Zugang

---

## Setup Form (Final Version)

```html
<div class="review-field">
  <label>Ihre Email-Adresse *</label>
  <input
    type="email"
    id="setupUserEmail"
    required
    placeholder="ihre@email.at"
    class="review-input"
  >
  <small class="input-hint">
    🔒 Benötigt für App-Nutzung. Keine Weitergabe an Dritte.
  </small>
</div>

<div class="review-field">
  <label>Firmenname *</label>
  <input
    type="text"
    id="setupCompanyName"
    required
    placeholder="Ihre Firma GmbH"
    class="review-input"
  >
</div>

<!-- Optional fields in collapsible section -->
<details>
  <summary>Weitere Details (optional)</summary>
  <!-- Website, Calendar, Free Offer -->
</details>
```

---

## localStorage Schema (Updated)

```javascript
{
  "userEmail": "max@beispiel.at",     // ← NEW: Lead Magnet!
  "companyName": "Beispiel GmbH",
  "website": "https://beispiel.at",
  "calendarLink": "https://cal.com/...",
  "freeOffer": "Gratis Erstgespräch",
  "icon": "data:image/png;base64,...",
  "setupDate": "2025-10-05T10:00:00Z"
}
```

---

## Validation

### Setup Form Validation

```javascript
function saveSetupAndStart() {
  const userEmail = document.getElementById('setupUserEmail').value.trim();

  // Email validation
  if (!userEmail) {
    alert('Bitte Email-Adresse eingeben.');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    alert('Bitte gültige Email-Adresse eingeben (z.B. name@firma.at).');
    return;
  }

  // Rest of setup...
}
```

### Proxy Request Validation

```typescript
// In proxy.ts
if (!user_email || !user_email.includes('@') || !user_email.includes('.')) {
  return Response.json(
    { error: 'Ungültige Email-Adresse' },
    { status: 400 }
  );
}
```

---

## Privacy Message

**In Setup Form anzeigen**:

```html
<p class="privacy-note" style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 1rem;">
  🔒 Ihre Email wird nur für App-Zugang gespeichert.
  <br>
  Keine Weitergabe an Dritte. Keine Werbemails.
  <br>
  <a href="https://libralab.ai/datenschutz" target="_blank">Datenschutz</a>
</p>
```

---

## Analytics (Post-Herbstmesse)

### Query Demo Users

```bash
# Total users
redis-cli SCARD speedconnect:demo:users

# All emails
redis-cli SMEMBERS speedconnect:demo:users

# User details
redis-cli HGETALL speedconnect:demo:user:max@beispiel.at

# Example output:
# email: max@beispiel.at
# first_seen: 2025-11-15T10:30:00Z
# last_used: 2025-11-15T14:20:00Z
# usage_count: 8
```

### Follow-up Campaign

**1 Woche nach Herbstmesse**:
```
An: [Alle Demo User Emails]
Betreff: SpeedConnect - Jetzt verfügbar mit 50% Rabatt

Hallo,

Sie haben SpeedConnect auf der Herbstmesse getestet.
Jetzt ist die Vollversion verfügbar!

Early Bird Special: 50% Rabatt für Herbstmesse-Tester
→ https://libralab.ai/speedconnect?code=HMESSE50

LG aus Tirol,
Thomas Seiger
LibraLab
```

---

## Rate Limiting (per Email, not IP)

**Warum per Email**:
- User kann nicht mit VPN umgehen
- Fairere Limits
- Besseres Tracking

**Limit**: 10 API calls pro Minute pro Email

```typescript
const rateLimitKey = `speedconnect:demo:ratelimit:${user_email}`;
const count = await kv.incr(rateLimitKey);
if (count === 1) await kv.expire(rateLimitKey, 60);

if (count > 10) {
  return Response.json(
    { error: 'Zu viele Anfragen. Bitte 1 Minute warten.' },
    { status: 429 }
  );
}
```

---

## Summary

**Email Lead Magnet Mechanismus**:

1. User öffnet Demo PWA
2. Setup Form verlangt Email + Firmenname
3. User gibt Email ein (required!)
4. Email in localStorage gespeichert
5. Jeder API call sendet Email mit
6. Proxy speichert Email in Redis
7. User kann App nutzen
8. LibraLab hat Email für Follow-up

**Win-Win**:
- User: Gratis Tool
- LibraLab: Qualifizierte Leads (Exhibitors die Lead-Management brauchen)

---

**Environment Variable benötigt**:
```bash
GROQ_TEST_API_KEY=[test@leodin.com Groq key]
```

**Kein Resend, kein Perplexity, nur Groq!**
