# 🚀 SpeedConnect Demo PWA - START HERE

**Deployment**: `app.libralab.ai/speedconnect-demo`
**Status**: Dokumentation komplett, ready to code
**Zeit**: 6 Stunden Implementation

---

## 📚 Dokumentation (in diesem Ordner)

1. **`README.md`** ← Quick overview für Coding Agent
2. **`IMPLEMENTATION.md`** ← Vollständige Code-Anleitung (23KB)
3. **`CODING_CHECKLIST.md`** ← Step-by-step Checklist (14 Steps)
4. **`API_ARCHITECTURE.md`** ← ⚠️ WICHTIG: NUR Groq Proxy, KEIN Email-Proxy!
5. **`speedconnect-demo-direct-plan.md`** ← Strategie & Architektur
6. **`speedconnect-icon-prompt.md`** ← Icon Generator Prompts

**Total**: ~2500 Zeilen Dokumentation

---

## ⚠️ WICHTIG: Email Versand

**Demo PWA nutzt GMAIL LINK, nicht Email-Proxy!**

- ✅ Groq Proxy: `/api/speedconnect/proxy` (OCR + Email Gen)
- ❌ Email-Proxy: NICHT verwendet in Demo PWA
- ✅ Gmail Link: `window.open(gmail_url)` (client-side)

---

## 🎯 Was wird gebaut

**SpeedConnect Demo PWA** für Herbstmesse Leads:

### Features
- ✅ One-time Setup (Firmenname, Website, Calendar Link)
- ✅ Dynamisches Icon (Firmen-Initialen auf Gradient)
- ✅ Photo Upload (Camera + Gallery)
- ✅ OCR via Groq Proxy (keine exposed keys)
- ✅ 6 Review-Felder (keine Perplexity research)
- ✅ Email Generation via Proxy
- ✅ Gmail Link (statt direct send)
- ✅ PWA installierbar (Homescreen Icon)
- ✅ Settings Icon (Setup editierbar)

### Simplified vs Thomas Version
- ❌ Keine Perplexity research (6 Felder statt 10)
- ❌ Kein Redis sync (nur Usage Counter)
- ❌ Kein Direct Email Send (Gmail workaround)
- ✅ Schneller zu implementieren (6h vs 8h)

---

## 📂 File Structure

```
/lapps/
├── public/
│   └── speedconnect-demo/
│       ├── index.html              ← Main PWA
│       ├── sw.js                   ← Service Worker
│       ├── manifest.json           ← PWA Manifest
│       └── icons/
│           └── icon-512.png        ← Generic fallback
└── api/
    └── speedconnect/
        └── proxy.ts                ← Groq API Proxy
```

---

## ⚡ Quick Start (für Coding Agent)

### Option A: Folge der Checkliste
```bash
# Open CODING_CHECKLIST.md
# Follow Steps 1-14
```

### Option B: Direkt zur Implementation
```bash
# Open IMPLEMENTATION.md
# Copy all code snippets
# Create files as specified
```

---

## 🔧 Environment Setup

```bash
cd /Users/libra/GitHub/lapps

# Add Groq API key
vercel env add GROQ_TEST_API_KEY production
# Value: test@leodin.com Groq API key
```

```bash
# Deploy
vercel --prod

# Test
open https://app.libralab.ai/speedconnect-demo
```

---

## 🧪 Testing

**After deployment**, test diese User Journey:

1. First load → Setup form appears
2. Enter "Test Firma" + optional fields
3. Click "Speichern" → Upload screen appears
4. Header shows "SpeedConnect by Test Firma"
5. Favicon shows "TF" initials
6. Take photo → OCR works
7. Review 6 fields
8. Generate email → Email appears
9. Signature includes "Test Firma" + setup data
10. Click "In Gmail öffnen" → Gmail opens with pre-filled draft
11. PWA installierbar (Add to Home Screen)

**Checklist**: See `IMPLEMENTATION.md` Section "Testing Checklist"

---

## 📊 Timeline

| Step | Task | Zeit |
|------|------|------|
| 1 | Copy base template | 30 min |
| 2 | Remove features | 30 min |
| 3 | Add setup form HTML | 30 min |
| 4 | Add setup JavaScript | 1h |
| 5 | Replace Groq calls | 30 min |
| 6 | Add Gmail link | 30 min |
| 7 | Create Groq proxy | 1h |
| 8 | Service worker | 15 min |
| 9 | PWA manifest | 15 min |
| 10 | Settings icon | 15 min |
| 11 | Environment vars | 5 min |
| 12 | Deploy | 10 min |
| 13 | Testing | 1h |
| 14 | Bug fixes | 30 min |
| **Total** | | **~6h** |

---

## ✅ Deliverables

Nach Implementation:

- ✅ PWA live auf `app.libralab.ai/speedconnect-demo`
- ✅ Setup funktioniert (localStorage)
- ✅ Icon Generator funktioniert (Initialen)
- ✅ OCR via Proxy funktioniert
- ✅ Gmail Link funktioniert
- ✅ Installierbar als PWA

---

## 🎁 Bonus: Icon Generator Beispiele

**Input**: "Beispiel GmbH" → **Output**: Icon mit "BG" auf Rot-Orange Gradient
**Input**: "Swarovski" → **Output**: Icon mit "SW"
**Input**: "Tech Solutions" → **Output**: Icon mit "TS"

**Code**: Siehe `generateCompanyIcon()` in `IMPLEMENTATION.md`

---

## 🚨 Wichtige Hinweise

1. **Kein Perplexity** in Demo (zu komplex, nicht kritisch)
2. **Kein Redis** (Leads managen ihre eigenen Kontakte)
3. **Gmail statt Resend** (keine Email-Credentials nötig)
4. **Groq via Proxy** (test@leodin.com key server-side)
5. **localStorage only** (Setup + Icon lokal gespeichert)

---

## 📞 Support

**Bei Fragen**: Alle Antworten in `IMPLEMENTATION.md`

**Deployment Problem**: Check `vercel logs`

**API Error**: Check browser console + network tab

---

**Los geht's mit der Implementation! 🚀**

**Start bei**: `CODING_CHECKLIST.md` Step 1
