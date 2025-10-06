# SpeedConnect Demo PWA - Coding Instructions

**Repo**: `/Users/libra/GitHub/lapps`
**URL**: `https://app.libralab.ai/messe-speedconnect-demo`
**Purpose**: Proof-of-concept PWA for leads to test SpeedConnect
**Tech Stack**: Single HTML file + Vercel Edge Functions + Groq API

---

## Architecture

```
SpeedConnect_Demo.html (PWA)
  ↓
First Load → 3 Bonus Setup Buttons
  ↓
localStorage saves:
  - Google Calendar link
  - Company name + website
  - Free offer details
  ↓
Photo → Groq Proxy → OCR → Review → Email Gen → Gmail Link
```

---

## File Structure

```
/lapps/
├── public/
│   └── speedconnect-demo/
│       ├── index.html                  # CREATE: Main PWA app
│       ├── manifest.json               # CREATE: PWA manifest
│       ├── sw.js                       # CREATE: Service worker
│       └── icons/
│           ├── icon-192.png            # CREATE: App icon 192x192
│           └── icon-512.png            # CREATE: App icon 512x512
└── api/
    └── speedconnect/
        └── proxy.ts                    # CREATE: Groq API proxy
```

---

## 1. Create Main PWA App

**File**: `public/speedconnect-demo/index.html`

**Base template**: Copy from `SpeedConnect_Thomas.html` but with these key differences:

### A. One-Time Setup Flow (First Load Only)

Add this section **before** the upload section:

```html
<!-- First-Time Setup (Bonus Buttons) -->
<div class="setup-section" id="setupSection" style="display: none;">
  <div class="card">
    <h2 class="section-title">🎁 Einmalige Einrichtung</h2>
    <p style="margin-bottom: 2rem; color: var(--text-secondary);">
      Personalisieren Sie Ihre Follow-up Emails in 3 Schritten:
    </p>

    <!-- Step 1: Calendar Link -->
    <div class="setup-step">
      <div class="step-header">
        <span class="step-number">1</span>
        <h3>📅 Google Calendar Link</h3>
      </div>
      <p class="step-desc">
        Fügen Sie Ihren Kalenderlink ein, damit Leads direkt Termine buchen können.
      </p>
      <input
        type="url"
        id="setupCalendarLink"
        placeholder="https://calendar.app.google/..."
        class="setup-input"
      />
      <small class="input-hint">
        Optional: Leer lassen wenn kein Kalenderlink vorhanden
      </small>
    </div>

    <!-- Step 2: Company Info -->
    <div class="setup-step">
      <div class="step-header">
        <span class="step-number">2</span>
        <h3>🏢 Firmen-Information</h3>
      </div>
      <p class="step-desc">
        Ihre Firmendaten für die Email-Signatur.
      </p>
      <div class="form-grid">
        <div class="form-group">
          <label for="setupCompanyName">Firmenname *</label>
          <input
            type="text"
            id="setupCompanyName"
            required
            placeholder="Ihre Firma GmbH"
          />
        </div>
        <div class="form-group">
          <label for="setupWebsite">Website</label>
          <input
            type="url"
            id="setupWebsite"
            placeholder="https://ihre-firma.at"
          />
        </div>
      </div>
    </div>

    <!-- Step 3: Free Offer -->
    <div class="setup-step">
      <div class="step-header">
        <span class="step-number">3</span>
        <h3>🎁 Kostenloses Angebot (CTA)</h3>
      </div>
      <p class="step-desc">
        Optional: Bieten Sie etwas kostenlos an (Beratung, E-Book, Testversion, etc.)
      </p>
      <textarea
        id="setupFreeOffer"
        placeholder="z.B. 'Kostenloses Erstgespräch (30 Min.)' oder '10% Rabatt bei Bestellung bis Jahresende'"
        rows="3"
        class="setup-input"
      ></textarea>
      <small class="input-hint">
        Wird als PS am Ende der Email eingefügt
      </small>
    </div>

    <!-- Save Button -->
    <div class="action-buttons">
      <button class="btn btn-primary btn-large" onclick="saveSetupAndStart()">
        ✅ Speichern & Los geht's
      </button>
    </div>

    <p class="setup-note">
      💡 Diese Einstellungen werden lokal auf Ihrem Gerät gespeichert.
      Sie können sie jederzeit in den Einstellungen ändern.
    </p>
  </div>
</div>
```

### B. Add Setup CSS

```css
.setup-section {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.setup-step {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: var(--radius-large);
  margin-bottom: 2rem;
  border-left: 4px solid var(--primary-color);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1.2rem;
}

.step-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--text-primary);
}

.step-desc {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.setup-input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-medium);
  font-size: 1rem;
  transition: var(--transition);
}

.setup-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
}

.input-hint {
  display: block;
  margin-top: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.setup-note {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-light);
}
```

### C. Setup JavaScript Logic

Add after existing JavaScript:

```javascript
// Check if first-time user on page load
document.addEventListener('DOMContentLoaded', function() {
  const hasSetup = localStorage.getItem('speedconnect_setup_complete');

  if (!hasSetup) {
    // First time user - show setup
    document.getElementById('setupSection').style.display = 'block';
    document.getElementById('uploadSection').style.display = 'none';
  } else {
    // Returning user - show upload
    document.getElementById('setupSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
  }

  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/speedconnect-demo/sw.js')
      .then(() => console.log('PWA ready'))
      .catch((err) => console.error('PWA registration failed:', err));
  }
});

function saveSetupAndStart() {
  // Get values
  const calendarLink = document.getElementById('setupCalendarLink').value.trim();
  const companyName = document.getElementById('setupCompanyName').value.trim();
  const website = document.getElementById('setupWebsite').value.trim();
  const freeOffer = document.getElementById('setupFreeOffer').value.trim();

  // Validate required fields
  if (!companyName) {
    alert('Bitte Firmennamen eingeben.');
    document.getElementById('setupCompanyName').focus();
    return;
  }

  // Save to localStorage
  const setupData = {
    calendarLink,
    companyName,
    website,
    freeOffer,
    setupDate: new Date().toISOString()
  };

  localStorage.setItem('speedconnect_setup', JSON.stringify(setupData));
  localStorage.setItem('speedconnect_setup_complete', 'true');

  // Hide setup, show upload
  document.getElementById('setupSection').style.display = 'none';
  document.getElementById('uploadSection').style.display = 'block';

  // Show success message
  showSuccess(`✅ Einrichtung abgeschlossen! Hallo ${companyName}-Team, willkommen bei SpeedConnect.`);
}

function getSetupData() {
  const data = localStorage.getItem('speedconnect_setup');
  return data ? JSON.parse(data) : null;
}

// Add settings menu to allow editing setup later
function openSettings() {
  const setup = getSetupData();
  if (!setup) return;

  // Pre-fill setup form with current values
  document.getElementById('setupCalendarLink').value = setup.calendarLink || '';
  document.getElementById('setupCompanyName').value = setup.companyName || '';
  document.getElementById('setupWebsite').value = setup.website || '';
  document.getElementById('setupFreeOffer').value = setup.freeOffer || '';

  // Show setup section
  document.getElementById('setupSection').style.display = 'block';
  document.getElementById('uploadSection').style.display = 'none';
}
```

### D. Update File Input for Camera + Gallery

**Replace the file input section** to support both camera AND gallery:

```html
<div class="upload-section" id="uploadSection">
  <div class="upload-area" id="uploadArea">
    <div class="upload-icon">📸</div>
    <div class="upload-text">Visitenkarte fotografieren oder auswählen</div>
    <div class="upload-subtext">Foto aufnehmen oder aus Galerie wählen</div>
  </div>

  <!-- Hidden file input - supports BOTH camera and gallery -->
  <input type="file" id="fileInput" accept="image/*">

  <div style="text-align: center; margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
    <!-- Camera Button -->
    <button class="camera-btn" onclick="openCamera()">
      📷 Kamera öffnen
    </button>

    <!-- Gallery Button -->
    <button class="camera-btn" onclick="openGallery()" style="background: var(--secondary-color);">
      🖼️ Aus Galerie wählen
    </button>
  </div>

  <div class="preview-container" id="previewContainer"></div>
</div>
```

**Update JavaScript for camera vs gallery**:

```javascript
function openCamera() {
  const input = document.getElementById('fileInput');
  input.setAttribute('capture', 'environment'); // Force camera
  input.click();
}

function openGallery() {
  const input = document.getElementById('fileInput');
  input.removeAttribute('capture'); // Allow gallery selection
  input.click();
}
```

### E. Update Email Generation to Use Setup Data

**Modify `generatePersonalizedEmail()` function**:

```javascript
async function generatePersonalizedEmail(leadData) {
  const { company, contact, position, industry } = leadData;

  // Get user's setup data
  const setup = getSetupData();
  if (!setup) {
    throw new Error('Setup-Daten nicht gefunden. Bitte Einstellungen überprüfen.');
  }

  // Build email signature with setup data
  let signature = `\n\nLG,\n${setup.companyName}`;
  if (setup.website) {
    signature += `\n🌐 ${setup.website}`;
  }

  // Add calendar CTA if available
  let calendarCTA = '';
  if (setup.calendarLink) {
    calendarCTA = `\n\nGerne können Sie direkt einen Termin buchen:\n${setup.calendarLink}`;
  }

  // Add free offer PS if available
  let offerPS = '';
  if (setup.freeOffer) {
    offerPS = `\n\nPS: ${setup.freeOffer}`;
  }

  // Build email prompt with setup context
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
5. Angebot für 20-30 Min Gespräch
${setup.calendarLink ? '6. Kalenderlink einbauen' : '6. Nach Terminvorschlägen fragen'}

SIGNATUR:
${signature}${calendarCTA}${offerPS}

---
Sent via SpeedConnect by LibraLab

STIL:
- Persönlich, Du-Form
- Maximal 120 Wörter
- Keine Marketing-Floskeln
- Authentisch

Gib Email zurück als:
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
    subject = subjectMatch ? subjectMatch[1].trim() : 'Follow-up: Schön, dich kennengelernt zu haben!';
    body = parts[1].trim();
  } else {
    subject = 'Follow-up: Schön, dich kennengelernt zu haben!';
    body = content;
  }

  return { subject, body };
}
```

### F. Replace Email Send with Gmail Link

**Replace `sendEmail()` function**:

```javascript
function openGmailDraft() {
  const recipient = document.getElementById('emailRecipient').value;
  const subject = document.getElementById('emailSubject').value;
  const body = document.getElementById('emailBody').value;

  // Validate
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

  // Track action
  trackUsage('gmail_opened');

  // Show success state
  document.querySelector('.email-preview-actions').style.display = 'none';
  document.getElementById('emailNextSteps').style.display = 'block';
}
```

**Update email preview section buttons**:

```html
<!-- Replace "Email senden" button -->
<div class="email-preview-actions">
  <button class="btn btn-secondary" onclick="regenerateEmail()">
    🔄 Neu generieren
  </button>
  <button class="btn btn-primary" onclick="openGmailDraft()">
    📤 In Gmail öffnen
  </button>
</div>
```

### G. Update OCR to Use Proxy API

**Replace `extractBusinessCardData()` function**:

```javascript
async function extractBusinessCardData(base64Image) {
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'OCR fehlgeschlagen');
  }

  const data = await response.json();

  // Parse JSON from response
  try {
    const jsonMatch = data.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Keine gültige JSON-Antwort erhalten');
    }
  } catch (parseError) {
    console.error('JSON Parse Error:', parseError);
    throw new Error('Fehler beim Parsen der AI-Antwort');
  }
}
```

### H. Add Settings Icon in Header

```html
<div class="header-content">
  <a href="#" class="logo">
    Speed<span class="logo-accent">Connect</span>
  </a>
  <div style="display: flex; align-items: center; gap: 1rem;">
    <button
      onclick="openSettings()"
      class="settings-btn"
      title="Einstellungen"
      style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">
      ⚙️
    </button>
    <div style="color: var(--impact-gray); font-size: 0.9rem;">Demo</div>
  </div>
</div>
```

### I. Add Usage Tracking (No PII)

```javascript
async function trackUsage(action) {
  try {
    await fetch('/api/speedconnect/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'track',
        event: action,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    // Silent fail - tracking is not critical
    console.log('Tracking failed:', error);
  }
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

const GROQ_API_KEY = process.env.GROQ_TEST_API_KEY; // test@leodin.com key

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { action, image_base64, prompt, event } = body;

    // Rate limiting (10 requests per minute per IP)
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `speedconnect:demo:ratelimit:${ip}`;
    const currentCount = (await kv.incr(rateLimitKey)) || 1;

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
      return await handleOCR(image_base64, ip);
    } else if (action === 'email') {
      return await handleEmailGeneration(prompt, ip);
    } else if (action === 'track') {
      return await handleTracking(event, ip);
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

async function handleOCR(image_base64: string, ip: string) {
  // Validate image
  if (!image_base64?.startsWith('data:image/')) {
    return Response.json({ error: 'Ungültiges Bildformat' }, { status: 400 });
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
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analysiere diese Visitenkarte und extrahiere als JSON:
{
  "company": "Firmenname",
  "contact": "Vor- und Nachname",
  "position": "Jobtitel",
  "email": "Email",
  "phone": "Telefon",
  "industry": "Branche",
  "website": "Website"
}
Nur JSON, keine Erklärungen.`,
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

async function handleEmailGeneration(prompt: string, ip: string) {
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
              'Du bist ein professioneller Business Development Manager, der authentische Follow-up Emails schreibt.',
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
  return btoa(ip).substring(0, 8);
}
```

---

## 3. Create PWA Manifest

**File**: `public/speedconnect-demo/manifest.json`

```json
{
  "name": "SpeedConnect - Lead Scanner",
  "short_name": "SpeedConnect",
  "description": "Visitenkarten scannen, personalisierte Emails senden",
  "start_url": "/speedconnect-demo/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#d32f2f",
  "icons": [
    {
      "src": "/speedconnect-demo/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/speedconnect-demo/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**Add manifest link to HTML** `<head>`:

```html
<link rel="manifest" href="/speedconnect-demo/manifest.json">
<meta name="theme-color" content="#d32f2f">
<link rel="apple-touch-icon" href="/speedconnect-demo/icons/icon-192.png">
```

---

## 4. Create Service Worker

**File**: `public/speedconnect-demo/sw.js`

```javascript
const CACHE_NAME = 'speedconnect-demo-v1';
const ASSETS = [
  '/speedconnect-demo/',
  '/speedconnect-demo/icons/icon-192.png',
  '/speedconnect-demo/icons/icon-512.png',
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
    caches
      .keys()
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

// Fetch - network first for API, cache first for assets
self.addEventListener('fetch', (event) => {
  // API calls always go to network
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For other resources: network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache response
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});
```

---

## 5. Environment Variables

**Add to Vercel project** (`lapps`):

```bash
vercel env add GROQ_TEST_API_KEY production
# Paste test@leodin.com Groq API key
```

---

## 6. Deployment

```bash
cd /Users/libra/GitHub/lapps

# Install dependencies if needed
npm install @vercel/kv

# Deploy to production
vercel --prod

# Verify deployment
open https://app.libralab.ai/speedconnect-demo
```

---

## Testing Checklist

**First-Time Setup**:
- [ ] Open app on phone → See setup form
- [ ] Fill in calendar link, company name, website, free offer
- [ ] Click "Speichern & Los geht's"
- [ ] Setup hidden, upload section shows
- [ ] Settings icon in header accessible

**Photo Upload**:
- [ ] Camera button opens camera
- [ ] Gallery button opens photo library
- [ ] Can select existing photo from gallery
- [ ] Upload works for both camera and gallery
- [ ] Preview shows uploaded image

**OCR Flow**:
- [ ] Photo uploads successfully
- [ ] OCR extracts data via proxy
- [ ] Data review fields populated
- [ ] Can edit extracted data
- [ ] Click "Email erstellen" generates email

**Email Generation**:
- [ ] Email includes setup data (company name, website)
- [ ] Calendar link included if provided
- [ ] Free offer PS included if provided
- [ ] Click "In Gmail öffnen" opens Gmail
- [ ] Gmail draft pre-filled correctly
- [ ] User can send from Gmail

**PWA Features**:
- [ ] Install prompt shows on mobile
- [ ] Can add to homescreen
- [ ] Icon appears on homescreen
- [ ] Launches in standalone mode
- [ ] Works offline (cached assets)
- [ ] Service worker registered

**Settings**:
- [ ] Settings icon clickable
- [ ] Opens setup form with current values
- [ ] Can update calendar link
- [ ] Can update company info
- [ ] Can update free offer
- [ ] Changes saved to localStorage

---

## Estimated Time

- Create HTML with setup flow: 2 hours
- Create Groq proxy API: 1 hour
- PWA setup (manifest + service worker): 1 hour
- Testing & debugging: 1 hour

**Total**: ~5 hours
