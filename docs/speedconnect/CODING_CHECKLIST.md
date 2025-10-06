# SpeedConnect Demo PWA - Coding Checklist

**Für Coding Agent im lapps Repo**

---

## ✅ Step-by-Step Implementation

### Step 1: Base HTML Setup (60 min)

**File**: `public/speedconnect-demo/index.html`

- [ ] Copy `/Users/libra/GitHub/_quicks/_LibraLeads/SpeedConnect_Thomas.html`
- [ ] Paste as `public/speedconnect-demo/index.html`

---

### Step 2: Remove Features (30 min)

**Delete from index.html**:

- [ ] Delete lines with `GROQ_API_KEY =`
- [ ] Delete lines with `RESEND_API_KEY =`
- [ ] Delete lines with `PERPLEXITY_API_KEY =`
- [ ] Delete `researchCompanyWithPerplexity()` function
- [ ] Delete research fields HTML (reviewBusinessModel, reviewPainPoint, etc.)
- [ ] Delete `saveToLocalStorage()` function
- [ ] Delete `downloadFromRedis()` function
- [ ] Delete `uploadToRedis()` function
- [ ] Delete `autoSaveLead()` function
- [ ] Delete `sendEmail()` function
- [ ] Delete `syncLead()` function

---

### Step 3: Add Setup Form (60 min)

**Insert BEFORE** `<div class="upload-section" id="uploadSection">`:

- [ ] Copy setup form HTML from `IMPLEMENTATION.md` Section 1.B
- [ ] Add CSS for `.setup-note`, `.input-hint`
- [ ] Test: Setup form displays correctly

---

### Step 4: Add Setup JavaScript (60 min)

**Add these functions** (code in IMPLEMENTATION.md Section 1.H):

- [ ] `saveSetupAndStart()` - Save setup to localStorage
- [ ] `getSetupData()` - Retrieve setup from localStorage
- [ ] `applyBranding()` - Update header, favicon with company data
- [ ] `openSettings()` - Re-open setup form
- [ ] `generateCompanyIcon(companyName)` - Create initials icon

**Add DOMContentLoaded handler**:
- [ ] Check if `speedconnect_setup_complete` exists
- [ ] If no: Show setup form
- [ ] If yes: Show upload, apply branding
- [ ] Register service worker

---

### Step 5: Replace Groq Calls with Proxy (30 min)

**Update `extractBusinessCardData()` function**:

```javascript
// OLD
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, ... }
});

// NEW
const response = await fetch('/api/speedconnect/proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'ocr',
    image_base64: base64Image
  })
});

const data = await response.json();
const content = data.content; // Note: response structure changed
```

**Update in `generatePersonalizedEmail()` function**:

- [ ] Build prompt with setup data (see Section 1.I)
- [ ] Call `/api/speedconnect/proxy` with `action: 'email'`
- [ ] Parse response

---

### Step 6: Add Gmail Link Function (30 min)

**WICHTIG**: Kein Email-Proxy! Nur Gmail Link!

- [ ] Delete `sendEmail()` function entirely
- [ ] Delete `convertToHtml()` function (not needed)
- [ ] Delete all email-proxy related code
- [ ] Add `openGmailDraft()` function (siehe `WICHTIG_GMAIL_LINK.md`)
- [ ] Update email preview buttons: Change "Senden" → "In Gmail öffnen"
- [ ] Update onclick handler: `onclick="openGmailDraft()"`

---

### Step 7: Create Groq Proxy API (60 min)

**File**: `api/speedconnect/proxy.ts`

- [ ] Create file
- [ ] Copy code from `IMPLEMENTATION.md` Section 2
- [ ] Implement `handleOCR()` function
- [ ] Implement `handleEmailGeneration()` function
- [ ] Add rate limiting (10 req/min per IP)
- [ ] Add usage tracking (counts only, no PII)

---

### Step 8: Create Service Worker (15 min)

**File**: `public/speedconnect-demo/sw.js`

- [ ] Create file
- [ ] Copy code from `IMPLEMENTATION.md` Section 3
- [ ] Cache strategy: Network-first for API, cache for assets

---

### Step 9: Create PWA Manifest (15 min)

**File**: `public/speedconnect-demo/manifest.json`

- [ ] Create file
- [ ] Copy code from `IMPLEMENTATION.md` Section 4
- [ ] Add manifest link to index.html `<head>`
- [ ] Add meta tags (theme-color, apple-touch-icon)

---

### Step 10: Add Settings Icon to Header (15 min)

- [ ] Add `<button onclick="openSettings()">⚙️</button>` to header
- [ ] Add CSS for `.settings-btn`
- [ ] Add `<span id="companyBranding">` for "by {Firma}" text
- [ ] Test: Settings icon clickable

---

### Step 11: Environment Variables (5 min)

```bash
cd /Users/libra/GitHub/lapps
vercel env add GROQ_TEST_API_KEY production
# Value: test@leodin.com Groq API key
```

---

### Step 12: Deploy to Vercel (10 min)

```bash
vercel --prod
```

- [ ] Deployment successful
- [ ] Open https://app.libralab.ai/speedconnect-demo
- [ ] Verify setup form shows on first load

---

### Step 13: Testing (60 min)

**Use testing checklist in `IMPLEMENTATION.md` Section "Testing Checklist"**

**Critical tests**:
- [ ] Setup form → Save → Upload screen appears
- [ ] Icon generator creates "TF" for "Test Firma"
- [ ] Favicon updated with generated icon
- [ ] Photo upload works
- [ ] OCR via proxy works
- [ ] Email generation via proxy works
- [ ] Gmail link opens correctly
- [ ] PWA installable on iOS Safari
- [ ] PWA installable on Android Chrome

---

### Step 14: Bug Fixes (variable)

- [ ] Fix any errors from testing
- [ ] Re-deploy if needed
- [ ] Re-test

---

## 🔍 Debugging Tips

### Setup not showing on first load

**Check**:
```javascript
// In browser console
localStorage.getItem('speedconnect_setup_complete')
// Should be null on first load

// Force show setup
localStorage.removeItem('speedconnect_setup_complete');
location.reload();
```

### Icon not generating

**Check**:
```javascript
// In browser console
const icon = generateCompanyIcon('Test Firma');
console.log(icon); // Should start with "data:image/png;base64,"

// Test canvas
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
console.log(ctx); // Should not be null
```

### Proxy not responding

**Check**:
```bash
# Test proxy endpoint
curl -X POST https://app.libralab.ai/api/speedconnect/proxy \
  -H "Content-Type: application/json" \
  -d '{"action":"email","prompt":"Test"}'

# Should return JSON, not 404
```

**Verify**:
- File exists at `api/speedconnect/proxy.ts`
- Environment variable `GROQ_TEST_API_KEY` is set
- Vercel deployment includes API routes

### Gmail link not opening

**Check**:
```javascript
// In browser console
const url = "https://mail.google.com/mail/?view=cm&to=test@example.com&su=Test&body=Test";
window.open(url, '_blank');
// Should open Gmail compose
```

**Common issues**:
- Pop-up blocker enabled (disable)
- URL encoding issues (use URLSearchParams)
- Gmail not signed in

---

## 📦 Deliverables

After completion, you should have:

- ✅ `public/speedconnect-demo/index.html` (~60KB)
- ✅ `public/speedconnect-demo/sw.js` (~1KB)
- ✅ `public/speedconnect-demo/manifest.json` (~0.5KB)
- ✅ `api/speedconnect/proxy.ts` (~3KB)
- ✅ `public/speedconnect/icons/icon-512.png` (generic fallback)
- ✅ Deployed to `https://app.libralab.ai/speedconnect-demo`

---

## ✅ Definition of Done

**Demo PWA is complete when**:

1. ✅ Opens at https://app.libralab.ai/speedconnect-demo
2. ✅ First load shows setup form
3. ✅ Can enter company name + optional fields
4. ✅ Setup saved, upload screen appears
5. ✅ Header shows "SpeedConnect by {Firma}"
6. ✅ Favicon shows company initials
7. ✅ Can take/upload photo
8. ✅ OCR extracts 6 fields via proxy
9. ✅ Can review/edit fields
10. ✅ Email generation via proxy works
11. ✅ Email includes company signature
12. ✅ Gmail link opens with pre-filled email
13. ✅ PWA installable to homescreen
14. ✅ Settings icon reopens setup
15. ✅ No critical bugs or crashes

---

## 🎯 Start Coding!

**Begin with**: Step 1 (Copy base template)
**Follow**: Steps 2-14 in order
**Reference**: `IMPLEMENTATION.md` for all code details
**Timeline**: 6 hours

**Questions?** All answers in `IMPLEMENTATION.md`

**Ready? Let's build! 🚀**
