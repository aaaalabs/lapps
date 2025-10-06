# SpeedConnect Demo PWA - Direkter Launch Plan

**URL**: `https://app.libralab.ai/speedconnect-demo`
**Strategie**: Sofort nutzbar ohne Landing Page
**Zielgruppe**: Leads zum Testen auf Herbstmesse
**Timeline**: 4-5 Stunden

---

## Konzept-Änderung

### Alt (Landing Page zuerst)
```
Landing Page → Waitlist → Setup → Deploy PWA → Onboarding Email
```
**Problem**: Zu viele Schritte, dauert zu lang

---

### Neu (Direkter Zugang)
```
Link teilen: app.libralab.ai/speedconnect-demo
  ↓
Lead öffnet → Setup (1x, 2 Min) → Sofort nutzbar
  ↓
PWA Installation → Homescreen Icon
  ↓
Nutzung: Photo → OCR → Email → Gmail Link
```

**Vorteil**: Sofort testbar, keine Warteliste, instant value

---

## Setup Flow (First Load)

### Screen 1: Willkommen

```
┌────────────────────────────────┐
│  🚀 SpeedConnect                │
├────────────────────────────────┤
│                                 │
│  Visitenkarten in 30 Sekunden   │
│  zu personalisierten Emails     │
│                                 │
│  Einmalige Einrichtung:         │
│  2 Minuten                      │
│                                 │
│  [Los geht's]                   │
└────────────────────────────────┘
```

### Screen 2: Setup-Formular (Kompakt!)

```
┌────────────────────────────────┐
│ 🎁 Schnelle Einrichtung         │
├────────────────────────────────┤
│                                 │
│ Firmenname *                    │
│ [Ihre Firma GmbH          ]    │
│                                 │
│ Website (optional)              │
│ [https://ihre-firma.at    ]    │
│                                 │
│ Kalender-Link (optional)        │
│ [https://cal.com/...      ]    │
│                                 │
│ Gratis-Angebot (optional)       │
│ [z.B. "Gratis Erstgespräch"]   │
│                                 │
│ [✓ Speichern & Starten]         │
│                                 │
│ ℹ️ Wird lokal gespeichert       │
└────────────────────────────────┘
```

**Felder**:
1. ✅ **Firmenname** (required) - für Header & Email-Signatur
2. ⚠️ **Website** (optional) - für Email-Footer
3. ⚠️ **Google Calendar Link** (optional) - für Email CTA
4. ⚠️ **Gratis-Angebot** (optional) - für Email PS

**Gespeichert in**: `localStorage` (key: `speedconnect_setup`)

---

## Dynamisches Branding

### App Logo/Icon

**Option A: Firmen-Initialen Generator** (empfohlen!)

```javascript
function generateCompanyIcon(companyName) {
  // Extract initials
  const initials = companyName
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Create canvas icon
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Background (Herbstmesse Red)
  ctx.fillStyle = '#d32f2f';
  ctx.fillRect(0, 0, 512, 512);

  // Initials (White)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 240px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, 256, 256);

  // Return as data URL
  return canvas.toDataURL('image/png');
}

// Usage
const iconDataUrl = generateCompanyIcon('Beispiel GmbH'); // "BG"
localStorage.setItem('speedconnect_icon', iconDataUrl);
```

**Beispiele**:
- "Beispiel GmbH" → **BG**
- "Tech Solutions" → **TS**
- "Swarovski" → **S**

**Vorteil**: Professionell, personalisiert, kein Upload nötig

---

**Option B: Generisches Logo** (fallback)

```
[SC] oder [🚀] als Icon
```

**Nachteil**: Nicht personalisiert

---

### Header Branding

```html
<div class="header-content">
  <a href="#" class="logo">
    SpeedConnect <span class="logo-accent">by {Firmenname}</span>
  </a>
  <button onclick="openSettings()" class="settings-btn">⚙️</button>
</div>
```

**Beispiel**:
- "SpeedConnect by Beispiel GmbH"
- "SpeedConnect by Swarovski"

---

### Email Signatur (dynamisch)

```javascript
function buildEmailSignature(setupData) {
  let signature = `\n\nLG,\n${setupData.companyName}`;

  if (setupData.website) {
    signature += `\n🌐 ${setupData.website}`;
  }

  if (setupData.calendarLink) {
    signature += `\n\n📅 Termin vereinbaren:\n${setupData.calendarLink}`;
  }

  if (setupData.freeOffer) {
    signature += `\n\nPS: ${setupData.freeOffer}`;
  }

  signature += `\n\n───────────────────────\nSent via SpeedConnect by LibraLab\nhttps://libralab.ai/speedconnect`;

  return signature;
}
```

**Ergebnis**:
```
LG,
Beispiel GmbH
🌐 https://beispiel.at

📅 Termin vereinbaren:
https://calendar.app.google/xyz123

PS: Gratis Erstgespräch (30 Min) - Keine Verpflichtung

───────────────────────
Sent via SpeedConnect by LibraLab
https://libralab.ai/speedconnect
```

---

## PWA Manifest (Dynamisch)

### Problem

Manifest.json ist statisch, aber wir brauchen dynamischen Firmennamen + Icon.

### Lösung: Manifest via JavaScript generieren

```javascript
function generatePWAManifest(setupData) {
  const manifest = {
    "name": `${setupData.companyName} - SpeedConnect`,
    "short_name": "SpeedConnect",
    "description": "Lead-Scanner für Messen",
    "start_url": "/speedconnect-demo/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#d32f2f",
    "icons": [
      {
        "src": localStorage.getItem('speedconnect_icon') || '/speedconnect/icons/icon-512.png',
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ]
  };

  // Create blob URL for manifest
  const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
  const manifestUrl = URL.createObjectURL(manifestBlob);

  // Update manifest link
  const linkEl = document.querySelector('link[rel="manifest"]');
  if (linkEl) {
    linkEl.href = manifestUrl;
  }
}

// Call after setup
document.addEventListener('DOMContentLoaded', () => {
  const setup = getSetupData();
  if (setup) {
    generatePWAManifest(setup);
  }
});
```

---

## Architektur

### File Structure (lapps repo)

```
/lapps/
├── public/
│   └── speedconnect-demo/
│       ├── index.html              # Main PWA
│       ├── icons/
│       │   ├── icon-generic.png    # Fallback icon
│       │   └── icon-512.png        # Generic SpeedConnect
│       └── sw.js                   # Service Worker
└── api/
    └── speedconnect/
        └── proxy.ts                # Groq API proxy
```

### Deployment URLs

**PWA**: `https://app.libralab.ai/speedconnect-demo`
**Groq Proxy**: `https://app.libralab.ai/api/speedconnect/proxy`

---

## Groq Proxy API

**File**: `/Users/libra/GitHub/lapps/api/speedconnect/proxy.ts`

```typescript
import { kv } from '@vercel/kv';

export const config = { runtime: 'edge' };

const GROQ_API_KEY = process.env.GROQ_TEST_API_KEY; // test@leodin.com

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { action, image_base64, prompt } = await req.json();

    // Rate limiting (10 requests per minute per IP)
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `speedconnect:demo:ratelimit:${ip}`;
    const currentCount = (await kv.incr(rateLimitKey)) || 1;

    if (currentCount === 1) {
      await kv.expire(rateLimitKey, 60);
    }

    if (currentCount > 10) {
      return Response.json(
        { error: 'Zu viele Anfragen. Bitte 1 Minute warten.' },
        { status: 429 }
      );
    }

    // Handle OCR action
    if (action === 'ocr') {
      return await handleOCR(image_base64);
    }

    // Handle email generation action
    if (action === 'email') {
      return await handleEmailGeneration(prompt);
    }

    // Handle Perplexity research action
    if (action === 'research') {
      return await handleResearch(prompt);
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

async function handleOCR(image_base64) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analysiere diese Visitenkarte als JSON:
{
  "company": "Firmenname",
  "contact": "Vor- und Nachname",
  "position": "Jobtitel",
  "email": "Email",
  "phone": "Telefon",
  "industry": "Branche"
}
Nur JSON, keine Erklärungen.`
            },
            {
              type: 'image_url',
              image_url: { url: image_base64 }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();

  // Track usage
  await kv.incr('speedconnect:demo:ocr_count');

  return Response.json({
    success: true,
    content: data.choices[0].message.content
  });
}

async function handleEmailGeneration(prompt) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Du bist ein professioneller Business Development Manager, der authentische Follow-up Emails schreibt.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();

  // Track usage
  await kv.incr('speedconnect:demo:email_count');

  return Response.json({
    success: true,
    content: data.choices[0].message.content
  });
}

async function handleResearch(prompt) {
  // For now, skip Perplexity in demo version
  // Can add later if needed
  return Response.json({
    success: true,
    content: null
  });
}
```

---

## localStorage Schema

```javascript
// Key: speedconnect_setup
{
  "companyName": "Beispiel GmbH",
  "website": "https://beispiel.at",
  "calendarLink": "https://calendar.app.google/xyz123",
  "freeOffer": "Gratis Erstgespräch (30 Min)",
  "setupDate": "2025-10-05T10:00:00Z",
  "icon": "data:image/png;base64,..." // Generated icon
}

// Key: speedconnect_setup_complete
"true"
```

---

## Icon Generator

```javascript
function generateCompanyIcon(companyName, size = 512) {
  // Extract initials (max 2 characters)
  const words = companyName.trim().split(/\s+/);
  const initials = words.length === 1
    ? companyName.substring(0, 2).toUpperCase()
    : words.map(w => w[0]).join('').substring(0, 2).toUpperCase();

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Background gradient (Herbstmesse colors)
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#d32f2f'); // Red
  gradient.addColorStop(1, '#ff6f00'); // Orange
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Border radius effect (optional)
  // ctx.beginPath();
  // ctx.roundRect(0, 0, size, size, size * 0.2);
  // ctx.clip();

  // Initials text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.45}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, size / 2, size / 2);

  // Return as data URL
  return canvas.toDataURL('image/png');
}

// Usage
const iconDataUrl = generateCompanyIcon('Beispiel GmbH');
localStorage.setItem('speedconnect_icon', iconDataUrl);

// Also set as favicon
const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
link.type = 'image/png';
link.rel = 'icon';
link.href = iconDataUrl;
document.getElementsByTagName('head')[0].appendChild(link);
```

**Beispiele**:
- "Beispiel GmbH" → **BG** (weiß auf rot-orange Gradient)
- "Tech Solutions" → **TS**
- "Swarovski" → **SW** (oder nur **S**)
- "WIFI Tirol" → **WT**

---

## PWA Installation

### Installation Prompt

Nach Setup anzeigen:

```
┌────────────────────────────────┐
│ ✅ Setup abgeschlossen!          │
├────────────────────────────────┤
│                                 │
│ 📱 App installieren:            │
│                                 │
│ iOS Safari:                     │
│ Teilen-Icon → "Zum Home-        │
│ Bildschirm hinzufügen"          │
│                                 │
│ Android Chrome:                 │
│ Menü → "App installieren"       │
│                                 │
│ [App jetzt nutzen →]            │
└────────────────────────────────┘
```

### Service Worker

**File**: `public/speedconnect-demo/sw.js`

```javascript
const CACHE_NAME = 'speedconnect-demo-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/speedconnect-demo/',
        '/speedconnect/icons/icon-512.png'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Network-first for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache-first for assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

---

## Unterschiede zu Thomas Version

| Feature | Thomas Version | Demo PWA |
|---------|---------------|----------|
| **Deployment** | Local HTML file | Hosted at app.libralab.ai |
| **Branding** | SpeedConnect by LibraLab | SpeedConnect by {Firmenname} |
| **Setup** | None (hardcoded) | One-time setup form |
| **Icon** | Generic | Firmen-Initialen (dynamisch) |
| **Groq API** | Direct (hardcoded key) | Via proxy (server-side key) |
| **Perplexity** | Direct (hardcoded key) | Skip for demo (to reduce complexity) |
| **Email Send** | Resend API (direct) | Gmail link workaround |
| **Redis Sync** | Yes (lib:leads) | No (only usage tracking) |
| **PWA** | No | Yes (installable) |
| **Settings** | None | Edit setup via ⚙️ icon |

---

## Simplified Demo Version

**Was WEG lassen für schnellere Implementation**:

1. ❌ **Perplexity Research** - Zu komplex für Demo
   - Keep 6 basic OCR fields only
   - Skip painPoint/offering auto-generation
   - User can manually add notes if needed

2. ❌ **Redis Lead Storage** - Demo braucht kein CRM
   - Only track usage counts (no PII)
   - Leads manage their own contacts via Gmail

3. ❌ **Image Preview** - Nicht kritisch
   - Upload → Processing → Results (kein Preview nötig)

4. ❌ **Regenerate Email** - Button entfernen
   - Email quality should be good on first try
   - User can edit via fullscreen editor

**Result**: Simpler, faster implementation

---

## Implementation Plan (4-5 Stunden)

### Hour 1: Base HTML

**Copy from**: `SpeedConnect_Thomas.html`
**Changes**:
- Remove Perplexity integration
- Remove Redis sync
- Remove Resend API calls
- Add setup form (first load)
- Add settings icon

---

### Hour 2: Setup Flow & Branding

**Implement**:
- Setup form with 4 fields
- localStorage save/load
- Company icon generator
- Dynamic header branding
- Settings icon to re-open setup

---

### Hour 3: Groq Proxy & API Integration

**Create**: `/api/speedconnect/proxy.ts`
**Implement**:
- OCR action (Groq Vision)
- Email generation action (Groq Text)
- Rate limiting (10 req/min)
- Usage tracking (counts only)

**Update HTML**:
- Replace direct Groq calls with proxy
- Remove hardcoded API keys

---

### Hour 4: Gmail Integration

**Implement**:
- Gmail compose URL generation
- Email signature with setup data
- "In Gmail öffnen" button
- Success state after Gmail opens

---

### Hour 5: PWA Setup & Testing

**Create**:
- Dynamic manifest.json generation
- Service worker registration
- Installation prompt
- Favicon update with generated icon

**Test**:
- Full flow on phone
- PWA installation
- Gmail link opens correctly
- Icon shows company initials

---

## Minimal UI (Demo Version)

### Screen Flow

```
1. Setup (first load only)
   ↓
2. Upload Photo
   ↓
3. Review 6 Fields (no research)
   ↓
4. Email Preview (compact)
   ↓
5. Gmail Link Opens
   ↓
6. Success → Next Lead
```

**Total Screens**: 6
**Total Time**: ~40 seconds per lead

---

## Testing Checklist

### Setup Flow
- [ ] First load shows setup form
- [ ] Can enter company name
- [ ] Can enter optional fields
- [ ] Click "Speichern & Starten" works
- [ ] Setup saved to localStorage
- [ ] Upload screen appears
- [ ] Settings icon accessible

### Branding
- [ ] Header shows "SpeedConnect by [Firmenname]"
- [ ] Generated icon shows initials
- [ ] Favicon updated with company icon
- [ ] Email signature includes company name
- [ ] Website link in footer (if provided)
- [ ] Calendar link in email (if provided)

### Photo Upload
- [ ] Camera button works
- [ ] Gallery button works
- [ ] Image compresses before upload
- [ ] OCR via proxy works
- [ ] 6 fields populated

### Email Generation
- [ ] Email generated via proxy
- [ ] Signature includes setup data
- [ ] Free offer in PS (if provided)
- [ ] "Sent via SpeedConnect" footer

### Gmail Integration
- [ ] Click "In Gmail öffnen"
- [ ] Gmail app opens (or web)
- [ ] Email pre-filled correctly
- [ ] User can send from Gmail
- [ ] Sent email tracked in Gmail "Sent" folder

### PWA
- [ ] Install prompt shows
- [ ] Can add to homescreen
- [ ] Icon shows company initials
- [ ] Launches in standalone mode
- [ ] Works offline (cached assets)

---

## Quick Start (für Leads)

### Thomas teilt Link

**Am Messestand**:
> "Willst du SpeedConnect auch probieren? Hier der Link:
> app.libralab.ai/speedconnect-demo
>
> Dauert 2 Minuten Setup, dann kannst du sofort scannen!"

### Lead Setup (2 Minuten)

1. Link öffnen
2. Firmenname eingeben
3. Optional: Website, Kalender, Angebot
4. "Speichern" → Fertig!
5. Zum Homescreen hinzufügen (optional)

### Lead Nutzung

1. Öffne App (Homescreen Icon)
2. Foto von Visitenkarte
3. Daten überprüfen
4. Email erstellen
5. In Gmail öffnen & senden
6. Fertig!

---

## Upsell zu Thomas

**Nach Test auf Herbstmesse**:

Lead nutzt Demo → Sieht "Sent via SpeedConnect by LibraLab" → Klickt Link

**Optionen**:
1. **Landing Page** bauen (später) mit "Upgrade to Pro"
2. **Direkter Kontakt**: "Interesse? Email an thomas@libralab.ai"
3. **Viral nur über Footer**: Passiver Upsell

**Für jetzt**: Einfach Footer-Link, kein aktiver Upsell

---

## Deliverables

### Dateien zu erstellen

1. **`/lapps/public/speedconnect-demo/index.html`**
   - Setup form
   - Icon generator
   - Groq proxy calls
   - Gmail link generation
   - PWA manifest handling

2. **`/lapps/api/speedconnect/proxy.ts`**
   - OCR proxy
   - Email generation proxy
   - Rate limiting
   - Usage tracking

3. **`/lapps/public/speedconnect-demo/sw.js`**
   - Service worker
   - Cache assets
   - Offline support

4. **`/lapps/public/speedconnect/icons/icon-512.png`**
   - Generic SpeedConnect icon (fallback)

---

## Zeit-Schätzung

**Optimistisch** (wenn alles glatt läuft):
- Base HTML (copy + adapt): 1h
- Setup flow + icon generator: 1h
- Groq proxy API: 1h
- Gmail integration: 1h
- PWA setup: 1h
- **Total**: 5 Stunden

**Realistisch** (mit Testing + Debugging):
- Implementation: 5h
- Testing & Debugging: 1-2h
- **Total**: 6-7 Stunden

---

## Priorität

**Must Have** (Demo funktioniert):
- ✅ Setup form (company name)
- ✅ Icon generator (Initialen)
- ✅ Groq proxy (OCR + Email)
- ✅ Gmail link
- ✅ PWA manifest

**Nice to Have** (kann später):
- ⚠️ Perplexity research (skip for demo)
- ⚠️ Advanced settings (colors, fonts)
- ⚠️ Multi-language (nur Deutsch)
- ⚠️ Usage analytics dashboard

---

## Nächster Schritt

**Option A**: Demo PWA jetzt bauen (5-7h)
**Option B**: Thomas version erst auf Phone testen
**Option C**: Beide parallel (2 Geräte)

**Empfehlung**: Option A - Demo PWA bauen, dann beide zusammen testen auf Herbstmesse.

Soll ich starten mit Demo PWA?
