# SpeedConnect Demo PWA - Quick Start

**Deployment**: `https://app.libralab.ai/speedconnect-demo`
**Repo**: `/Users/libra/GitHub/lapps`

---

## 📋 Für Coding Agent

### Was zu bauen ist

**PWA Demo App** für Lead-Scanner auf Messen:
- One-time Setup (Firmenname, Website, Calendar)
- Dynamisch generiertes Icon (Firmen-Initialen)
- Photo → OCR → Review → Email → Gmail Link
- Installierbar als PWA

### Dokumentation

1. **`IMPLEMENTATION.md`** - Vollständige Implementation mit Code
2. **`speedconnect-demo-direct-plan.md`** - Strategie & Architektur
3. **`speedconnect-icon-prompt.md`** - Icon Generator Prompts

**WICHTIG**: Demo PWA verwendet KEIN Email-Proxy! Nur Gmail Link.

---

## 🚀 Quick Implementation Steps

### 1. Base Template kopieren

```bash
# Copy from LibraLeads repo
cp /Users/libra/GitHub/_quicks/_LibraLeads/SpeedConnect_Thomas.html \
   public/speedconnect-demo/index.html
```

### 2. Anpassungen (siehe IMPLEMENTATION.md)

**Entfernen**:
- Hardcoded API keys (Groq, Resend, Perplexity)
- Perplexity research integration
- Redis sync functions
- Direct email send

**Hinzufügen**:
- Setup form (first load)
- Icon generator function
- Settings button
- Groq proxy calls
- Gmail link generation

### 3. Groq Proxy API erstellen

```bash
# Create API file
mkdir -p api/speedconnect
touch api/speedconnect/proxy.ts
```

Code in `IMPLEMENTATION.md` Section 2.

### 4. Environment Variable

```bash
vercel env add GROQ_TEST_API_KEY production
# Paste test@leodin.com Groq key
```

### 5. Deploy

```bash
vercel --prod
```

### 6. Test

```
https://app.libralab.ai/speedconnect-demo
```

---

## ⏱️ Zeit-Schätzung

- Copy & Adapt HTML: 1.5h
- Groq Proxy API: 1h
- Setup Form + Icon Generator: 1.5h
- Gmail Integration: 1h
- PWA Setup: 1h
- **Total**: 6 Stunden

---

## 🎯 Priorität

**Must Have**:
- ✅ Setup form funktioniert
- ✅ Icon generator zeigt Initialen
- ✅ OCR via Groq proxy
- ✅ Email generation via proxy
- ✅ Gmail link öffnet korrekt
- ✅ PWA installierbar

**Nice to Have** (später):
- ⚠️ Perplexity research (skip for demo)
- ⚠️ Advanced settings
- ⚠️ Usage analytics

---

## 📞 Support

Bei Fragen: Alle Details in `IMPLEMENTATION.md`

**Deployment URL**: https://app.libralab.ai/speedconnect-demo
**Test User**: Herbstmesse Exhibitors
**Launch**: Herbstmesse Innsbruck 2025 (in 4-5 Tagen)

---

**Los geht's! 🚀**
