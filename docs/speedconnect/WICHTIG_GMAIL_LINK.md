# ⚠️ WICHTIG: Gmail Link statt Email-Versand

**Für Demo PWA Coding Agent**

---

## Email-Versand in Demo PWA

### ❌ NICHT so (Thomas Version)

```javascript
// Thomas Version verwendet Email-Proxy
await fetch('https://libralab.ai/api/email/proxy', {
  headers: {
    'Authorization': 'Bearer re_...'  // ← Resend API key
  },
  body: JSON.stringify({
    from: 'thomas@libralab.at',
    to: recipient,
    subject: subject,
    html: htmlBody
  })
});
```

**Problem für Demo**: Resend API key kann nicht public gemacht werden

---

### ✅ SO MACHEN (Demo PWA)

```javascript
// Demo PWA nutzt Gmail Link
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

  // Show success message
  showSuccess('📧 Gmail geöffnet! Bitte Email prüfen und senden.');

  // Show reset button after 1 second
  setTimeout(() => {
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-primary btn-large';
    resetBtn.textContent = '🔄 Nächste Visitenkarte';
    resetBtn.onclick = resetForm;
    resetBtn.style.marginTop = '1rem';
    document.getElementById('successMessage').appendChild(resetBtn);
  }, 1000);
}
```

**Kein API call, kein Proxy, nur URL generation!**

---

## Button Update

### HTML ändern

**ALT (Thomas Version)**:
```html
<button class="btn btn-primary" onclick="sendEmail()">
  📤 Email senden
</button>
```

**NEU (Demo PWA)**:
```html
<button class="btn btn-primary" onclick="openGmailDraft()">
  📤 In Gmail öffnen
</button>
```

---

## User Flow

```
1. Email generiert (via Groq Proxy)
2. Email preview sichtbar
3. User klickt "In Gmail öffnen"
4. Gmail app/web öffnet mit pre-filled draft
5. User reviewed email in Gmail
6. User klickt "Senden" in Gmail
7. Email wird von User's Gmail Account gesendet
8. Email in User's "Sent" folder
```

**Vorteil**: User behält volle Kontrolle + Tracking

---

## Zu löschen aus Thomas Version

Wenn du `SpeedConnect_Thomas.html` kopierst für Demo PWA:

**DELETE**:
```javascript
// Delete entire sendEmail() function
async function sendEmail() {
  // ... 50 lines of Resend API code
}

// Delete convertToHtml() function (not needed for Gmail link)
function convertToHtml(plainText) {
  // ... 30 lines
}

// Delete email-proxy specific code
const RESEND_API_KEY = "re_...";
```

**KEEP**:
```javascript
// Keep email preview display
document.getElementById('emailBodyDisplay').textContent = emailBody;

// Keep email data in hidden fields
document.getElementById('emailRecipient').value = email;
document.getElementById('emailSubject').value = subject;
document.getElementById('emailBody').value = body;
```

**ADD**:
```javascript
// Add Gmail link function (see above)
function openGmailDraft() { ... }
```

---

## Testing

### Verify Gmail Link Works

**Test URL direkt**:
```javascript
const testUrl = "https://mail.google.com/mail/?view=cm&to=test@example.com&su=Test%20Subject&body=Test%20Body";
window.open(testUrl, '_blank');
```

**Sollte**:
- Gmail öffnen (app oder web)
- To-Feld pre-filled: test@example.com
- Subject pre-filled: Test Subject
- Body pre-filled: Test Body

**Auf iOS**: Safari öffnet Gmail app automatisch (wenn installiert)
**Auf Android**: Chrome öffnet Gmail app automatisch

---

## Warum kein Email-Proxy in Demo?

**Reasons**:
1. ✅ **Security**: Resend API key kann nicht public gemacht werden
2. ✅ **Domain Lock**: Resend nur für libralab.at/ai emails
3. ✅ **User Control**: Lead will von eigenem Gmail senden
4. ✅ **Tracking**: Sent emails in user's Gmail "Sent" folder
5. ✅ **Simplicity**: Weniger Code, kein API call nötig

---

## Environment Variables (Demo PWA)

**Required**:
```bash
GROQ_TEST_API_KEY=[Groq API Key vom test@leodin.com Account]
```

**⚠️ Bitte bereitstellen**: Vollständigen Groq API Key von test@leodin.com

**NOT Required**:
```bash
RESEND_API_KEY=re_...        # ❌ Nicht nötig!
PERPLEXITY_API_KEY=pplx_...  # ❌ Nicht nötig!
```

---

## Zusammenfassung

**Demo PWA nutzt**:
- ✅ Groq Proxy (`/api/speedconnect/proxy`)
- ✅ Gmail Link (`window.open()`)

**Demo PWA nutzt NICHT**:
- ❌ Email Proxy (`libralab.ai/api/email/proxy`)
- ❌ Resend API
- ❌ Perplexity API
- ❌ Redis Sync

**Einfach, sicher, funktioniert! 🚀**
