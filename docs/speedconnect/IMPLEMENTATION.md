# SpeedConnect Demo PWA - Implementation Guide

**Deployment URL**: `https://app.libralab.ai/speedconnect-demo`
**Repo**: `/Users/libra/GitHub/lapps`
**Timeline**: 5-7 hours
**Status**: Ready to implement

---

## Quick Start für Coding Agent

### Files zu erstellen

```
/lapps/
├── public/
│   └── speedconnect-demo/
│       ├── index.html              # Main PWA app
│       ├── sw.js                   # Service Worker
│       └── icons/
│           └── icon-512.png        # Generic SpeedConnect icon
└── api/
    └── speedconnect/
        └── proxy.ts                # Groq API proxy (OCR + Email Gen)
```

### Environment Variables

```bash
# In Vercel (lapps project)
vercel env add GROQ_TEST_API_KEY production
# Value: Test@leodin.com Groq API key
```

---

## 1. Create Main PWA HTML

**Source**: Copy from `/Users/libra/GitHub/_quicks/_LibraLeads/SpeedConnect_Thomas.html`

**File**: `public/speedconnect-demo/index.html`

### Changes from Thomas Version

#### A. Remove Hardcoded API Keys

```javascript
// DELETE these lines
const GROQ_API_KEY = "gsk_...";
const RESEND_API_KEY = "re_...";
const PERPLEXITY_API_KEY = "pplx_...";
```

#### B. Add Setup Form (First Load)

Insert BEFORE upload section:

```html
<!-- First-Time Setup -->
<div class="setup-section" id="setupSection" style="display: none;">
  <div class="card">
    <h2 class="section-title">🎁 Schnelle Einrichtung (2 Min)</h2>

    <div class="review-field">
      <label>Firmenname *</label>
      <input type="text" id="setupCompanyName" required placeholder="Ihre Firma GmbH" class="review-input">
    </div>

    <div class="review-field">
      <label>Website (optional)</label>
      <input type="url" id="setupWebsite" placeholder="https://ihre-firma.at" class="review-input">
    </div>

    <div class="review-field">
      <label>Google Calendar Link (optional)</label>
      <input type="url" id="setupCalendarLink" placeholder="https://calendar.app.google/..." class="review-input">
      <small class="input-hint">Für direkten Termin-Buchungs-Link in Emails</small>
    </div>

    <div class="review-field">
      <label>Gratis-Angebot (optional)</label>
      <input type="text" id="setupFreeOffer" placeholder="z.B. 'Gratis Erstgespräch (30 Min)'" class="review-input">
      <small class="input-hint">Wird als PS in Email eingefügt</small>
    </div>

    <button class="btn btn-primary btn-large" onclick="saveSetupAndStart()">
      ✅ Speichern & Los geht's
    </button>

    <p class="setup-note">
      💡 Wird lokal auf Ihrem Gerät gespeichert. Über ⚙️ Symbol jederzeit änderbar.
    </p>
  </div>
</div>
```

#### C. Add Settings Icon to Header

```html
<div class="header-content">
  <a href="#" class="logo">
    Speed<span class="logo-accent">Connect</span>
    <span class="logo-by" id="companyBranding" style="display: none;">by {Firma}</span>
  </a>
  <button onclick="openSettings()" class="settings-btn" title="Einstellungen">⚙️</button>
</div>
```

CSS for settings button:

```css
.settings-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  transition: var(--transition);
}

.settings-btn:hover {
  transform: scale(1.1);
}

.logo-by {
  font-size: 0.7em;
  font-weight: 400;
  color: var(--text-secondary);
  margin-left: 8px;
}

.setup-note {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-light);
}

.input-hint {
  display: block;
  margin-top: 4px;
  color: var(--text-secondary);
  font-size: 0.8rem;
}
```

#### D. Remove Perplexity Research

**Delete**:
- researchCompanyWithPerplexity() function
- Extended research fields HTML (reviewBusinessModel, reviewPainPoint, etc.)
- Perplexity API call in processImage()

**Keep only 6 basic fields**:
- Name, Firma, Position, Email, Telefon, Branche

#### E. Replace Groq Calls with Proxy

**OLD (direct)**:
```javascript
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${GROQ_API_KEY}`,
    ...
  }
});
```

**NEW (via proxy)**:
```javascript
const response = await fetch('/api/speedconnect/proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'ocr',
    image_base64: base64Image
  })
});
```

#### F. Replace Email Send with Gmail Link

**DELETE sendEmail() function entirely**

**ADD openGmailDraft() function**:

```javascript
function openGmailDraft() {
  const recipient = document.getElementById('emailRecipient').value;
  const subject = document.getElementById('emailSubject').value;
  const body = document.getElementById('emailBody').value;

  if (!recipient || !subject || !body) {
    showError('Bitte alle Felder ausfüllen.');
    return;
  }

  // Generate Gmail compose URL
  const params = new URLSearchParams({
    view: 'cm',
    to: recipient,
    su: subject,
    body: body
  });

  const gmailUrl = `https://mail.google.com/mail/?${params.toString()}`;

  // Open Gmail in new tab
  window.open(gmailUrl, '_blank');

  // Show success
  showSuccess('📧 Gmail geöffnet! Bitte Email prüfen und senden.');

  // Show reset button
  setTimeout(() => {
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-primary btn-large';
    resetBtn.textContent = '🔄 Nächste Visitenkarte';
    resetBtn.onclick = resetForm;
    resetBtn.style.marginTop = '1rem';
    document.getElementById('successMessage').appendChild(resetBtn);
  }, 500);
}
```

**Update email preview buttons**:

```html
<div class="email-actions-compact">
  <button class="btn btn-outline" onclick="openEmailEditor()">✏️ Bearbeiten</button>
  <button class="btn btn-primary" onclick="openGmailDraft()">📤 In Gmail öffnen</button>
</div>
```

#### G. Remove Redis Sync

**DELETE**:
- saveToLocalStorage() function
- downloadFromRedis() function
- uploadToRedis() function
- All Redis config
- autoSaveLead() function (since no Redis)

**KEEP**:
- generateId() function (for local tracking)
- getNextWeekDate() function (might be useful)

#### H. Add Setup JavaScript

```javascript
// Check first load on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  const hasSetup = localStorage.getItem('speedconnect_setup_complete');

  if (!hasSetup) {
    // First time user
    document.getElementById('setupSection').style.display = 'block';
    document.getElementById('uploadSection').style.display = 'none';
  } else {
    // Returning user
    document.getElementById('setupSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';

    // Apply branding
    applyBranding();
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/speedconnect-demo/sw.js')
      .then(() => console.log('PWA ready'))
      .catch((err) => console.error('PWA failed:', err));
  }

  console.log('SpeedConnect Demo - Ready');
});

function saveSetupAndStart() {
  const companyName = document.getElementById('setupCompanyName').value.trim();
  const website = document.getElementById('setupWebsite').value.trim();
  const calendarLink = document.getElementById('setupCalendarLink').value.trim();
  const freeOffer = document.getElementById('setupFreeOffer').value.trim();

  // Validate
  if (!companyName) {
    alert('Bitte Firmennamen eingeben.');
    document.getElementById('setupCompanyName').focus();
    return;
  }

  // Generate company icon
  const iconDataUrl = generateCompanyIcon(companyName);

  // Save to localStorage
  const setupData = {
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

  // Hide setup, show upload
  document.getElementById('setupSection').style.display = 'none';
  document.getElementById('uploadSection').style.display = 'block';

  showSuccess(`✅ Setup abgeschlossen! Willkommen ${companyName}.`);
}

function getSetupData() {
  const data = localStorage.getItem('speedconnect_setup');
  return data ? JSON.parse(data) : null;
}

function applyBranding() {
  const setup = getSetupData();
  if (!setup) return;

  // Update header
  const branding = document.getElementById('companyBranding');
  if (branding) {
    branding.textContent = `by ${setup.companyName}`;
    branding.style.display = 'inline';
  }

  // Update favicon
  const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  link.type = 'image/png';
  link.rel = 'icon';
  link.href = setup.icon;
  document.head.appendChild(link);

  // Update page title
  document.title = `${setup.companyName} - SpeedConnect`;
}

function openSettings() {
  const setup = getSetupData();
  if (!setup) return;

  // Pre-fill form
  document.getElementById('setupCompanyName').value = setup.companyName || '';
  document.getElementById('setupWebsite').value = setup.website || '';
  document.getElementById('setupCalendarLink').value = setup.calendarLink || '';
  document.getElementById('setupFreeOffer').value = setup.freeOffer || '';

  // Show setup form
  document.getElementById('setupSection').style.display = 'block';
  document.getElementById('uploadSection').style.display = 'none';
  document.getElementById('dataReviewSection').style.display = 'none';
  document.getElementById('emailPreviewSection').style.display = 'none';
}

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

  // Initials text (white, bold)
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.45}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, size / 2, size / 2);

  return canvas.toDataURL('image/png');
}
```

#### I. Update Email Generation with Setup Data

```javascript
async function generatePersonalizedEmail(leadData) {
  const { company, contact, position, industry } = leadData;

  // Get user's setup data
  const setup = getSetupData();
  if (!setup) {
    throw new Error('Setup-Daten nicht gefunden. Bitte Einstellungen überprüfen.');
  }

  // Build email signature
  let signature = `\n\nLG,\n${setup.companyName}`;
  if (setup.website) {
    signature += `\n🌐 ${setup.website}`;
  }

  // Add calendar CTA
  let calendarCTA = '';
  if (setup.calendarLink) {
    calendarCTA = `\n\nGerne können Sie direkt einen Termin buchen:\n${setup.calendarLink}`;
  }

  // Add free offer PS
  let offerPS = '';
  if (setup.freeOffer) {
    offerPS = `\n\nPS: ${setup.freeOffer}`;
  }

  // Add SpeedConnect footer
  const footer = `\n\n───────────────────────\nSent via SpeedConnect by LibraLab\nhttps://libralab.ai/speedconnect`;

  const prompt = `Schreibe eine kurze Follow-up Email nach Messebesuch.

KONTEXT:
- Person: ${contact}${position ? `, ${position}` : ''}
- Firma: ${company}
- Branche: ${industry || 'unbekannt'}
- Event: Herbstmesse Innsbruck 2025
- Absender: ${setup.companyName}

ANFORDERUNGEN:
1. Anrede: "Hallo ${contact.split(' ')[0]}," (nur Vorname)
2. Dank für Besuch am Messestand
3. Kurze Erinnerung an Gesprächsthema (basierend auf Branche)
4. Eine konkrete Frage oder Anknüpfungspunkt
5. ${setup.calendarLink ? 'Kalenderlink einbauen' : 'Nach Terminvorschlägen fragen'}

SIGNATUR:
${signature}${calendarCTA}${offerPS}${footer}

STIL:
- Persönlich, Du-Form
- Maximal 120 Wörter
- Authentisch

Format:
BETREFF: [Betreff]
---
[Email-Text]`;

  // Call Groq via proxy
  const response = await fetch('/api/speedconnect/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'email',
      prompt: prompt
    })
  });

  if (!response.ok) {
    throw new Error('Email-Generierung fehlgeschlagen');
  }

  const data = await response.json();
  const content = data.content;

  // Parse subject and body
  const parts = content.split('---');
  let subject = '';
  let body = '';

  if (parts.length >= 2) {
    const subjectMatch = parts[0].match(/BETREFF:\s*(.+)/i);
    subject = subjectMatch ? subjectMatch[1].trim() : 'Follow-up: Schön dich kennengelernt zu haben!';
    body = parts[1].trim();
  } else {
    subject = 'Follow-up: Schön dich kennengelernt zu haben!';
    body = content;
  }

  return { subject, body };
}
```

---

## 2. Create Groq Proxy API

**File**: `api/speedconnect/proxy.ts`

```typescript
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

    // Handle different actions
    if (action === 'ocr') {
      return await handleOCR(image_base64);
    } else if (action === 'email') {
      return await handleEmailGeneration(prompt);
    } else {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Proxy error:', error);
    return Response.json(
      { error: 'Verarbeitung fehlgeschlagen' },
      { status: 500 }
    );
  }
}

async function handleOCR(image_base64: string) {
  if (!image_base64?.startsWith('data:image/')) {
    return Response.json({ error: 'Ungültiges Bildformat' }, { status: 400 });
  }

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

  // Track usage (no PII)
  await kv.incr('speedconnect:demo:ocr_count');

  return Response.json({
    success: true,
    content: data.choices[0].message.content
  });
}

async function handleEmailGeneration(prompt: string) {
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
```

---

## 3. Create Service Worker

**File**: `public/speedconnect-demo/sw.js`

```javascript
const CACHE_NAME = 'speedconnect-demo-v1';
const ASSETS = [
  '/speedconnect-demo/',
  '/speedconnect/icons/icon-512.png'
];

// Install - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch - network first for API, cache for assets
self.addEventListener('fetch', (event) => {
  // Always network for API
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
```

---

## 4. Add PWA Manifest Link

Add to `<head>` in index.html:

```html
<link rel="manifest" href="/speedconnect-demo/manifest.json">
<meta name="theme-color" content="#d32f2f">
<link rel="apple-touch-icon" href="/speedconnect/icons/icon-512.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

**Static manifest** (will be overridden by generated one):

**File**: `public/speedconnect-demo/manifest.json`

```json
{
  "name": "SpeedConnect - Lead Scanner",
  "short_name": "SpeedConnect",
  "description": "Visitenkarten scannen, Emails senden",
  "start_url": "/speedconnect-demo/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#d32f2f",
  "icons": [
    {
      "src": "/speedconnect/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

---

## 5. Deployment

### Environment Variables

```bash
cd /Users/libra/GitHub/lapps

# Add Groq test API key
vercel env add GROQ_TEST_API_KEY production
# Paste: [test@leodin.com Groq API key]
```

### Deploy to Vercel

```bash
# Deploy
vercel --prod

# Verify
open https://app.libralab.ai/speedconnect-demo
```

### Vercel Configuration

**File**: `vercel.json` (if not exists, create)

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/speedconnect-demo/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/api/speedconnect/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "POST, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type"
        }
      ]
    }
  ]
}
```

---

## Testing Checklist

### First Load (Setup)
- [ ] Open https://app.libralab.ai/speedconnect-demo
- [ ] See setup form (not upload screen)
- [ ] Enter company name "Test Firma"
- [ ] Enter optional fields
- [ ] Click "Speichern & Los geht's"
- [ ] Setup hidden, upload screen appears
- [ ] Header shows "SpeedConnect by Test Firma"
- [ ] Favicon shows "TF" initials

### PWA Installation
- [ ] iOS Safari: Share → Add to Home Screen
- [ ] Android Chrome: Menu → Install app
- [ ] Icon on homescreen shows "TF" initials
- [ ] App name: "Test Firma - SpeedConnect"
- [ ] Launches in standalone mode

### Photo Upload
- [ ] Camera button works
- [ ] Gallery button works
- [ ] Image compresses
- [ ] OCR via /api/speedconnect/proxy works
- [ ] 6 fields populated

### Email Generation
- [ ] Click "Email erstellen"
- [ ] Email generated via proxy
- [ ] Signature includes company name
- [ ] Website link in footer (if provided)
- [ ] Calendar link in email (if provided)
- [ ] Free offer in PS (if provided)
- [ ] SpeedConnect footer present

### Gmail Integration
- [ ] Click "In Gmail öffnen"
- [ ] Gmail app/web opens
- [ ] Email pre-filled with to, subject, body
- [ ] User can review and send
- [ ] Email sent from user's Gmail account

### Settings
- [ ] Click ⚙️ icon in header
- [ ] Setup form appears with current values
- [ ] Can edit company name
- [ ] Can edit other fields
- [ ] Click "Speichern" updates branding
- [ ] New icon generated if company name changed

### Error Handling
- [ ] No internet → Friendly error
- [ ] Invalid photo → Friendly error
- [ ] Groq API down → Friendly error
- [ ] Rate limit hit → "Bitte 1 Minute warten"

---

## Estimated File Sizes

**index.html**: ~60KB (less than Thomas version, no Perplexity/Redis)
**proxy.ts**: ~3KB
**sw.js**: ~1KB
**manifest.json**: ~0.5KB

**Total**: ~65KB

---

## Key Simplifications from Thomas Version

| Feature | Thomas | Demo PWA | Reason |
|---------|--------|----------|--------|
| Perplexity Research | ✅ | ❌ | Zu komplex, nicht kritisch für Demo |
| Redis Sync | ✅ | ❌ | Demo braucht kein CRM backend |
| Direct Email Send | ✅ | ❌ | Gmail link ist sicherer für multi-tenant |
| Hardcoded Keys | ✅ | ❌ | Proxy versteckt keys |
| Setup Form | ❌ | ✅ | Jeder Lead braucht eigene Branding |
| Dynamic Icon | ❌ | ✅ | Personalisierung |
| PWA Install | ❌ | ✅ | Homescreen Installation |

---

## Success Criteria

**Demo ist erfolgreich wenn**:
- ✅ Lead kann in 2 Minuten setup
- ✅ Icon zeigt Firmen-Initialen
- ✅ Emails sind personalisiert mit Firmendaten
- ✅ Gmail Link funktioniert auf iOS + Android
- ✅ PWA installierbar auf Homescreen
- ✅ Keine Crashes oder kritische Bugs

**Nutzung auf Herbstmesse**:
- Thomas zeigt Demo 3-5 interessierten Leads
- Leads installieren PWA vor Ort
- Testen mit 1-2 eigenen Business Cards
- Feedback sammeln

---

## Next Steps for Coding Agent

1. **Start**: Copy `SpeedConnect_Thomas.html` → `public/speedconnect-demo/index.html`
2. **Remove**: Perplexity, Redis, hardcoded keys
3. **Add**: Setup form, icon generator, settings
4. **Replace**: Direct API calls → Proxy calls
5. **Replace**: Resend email → Gmail link
6. **Create**: `api/speedconnect/proxy.ts`
7. **Create**: Service worker + manifest
8. **Deploy**: `vercel --prod`
9. **Test**: Full flow on mobile

**Estimated time**: 5-7 hours

---

## Start Implementation?

All details are in this docs folder:
- `IMPLEMENTATION.md` (this file)
- `../speedconnect-icon-prompt.md` (icon generation)
- `../email-proxy-essentials.md` (if needed for reference)

Ready to code! 🚀
