// Simple tool delivery endpoint
// GET /api/tool?slug=company_product_uuid

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    try {
        const { slug } = req.query;

        if (!slug) {
            return res.status(400).send('No tool specified');
        }

        console.log('Loading tool:', slug);

        // Load customer data from Redis
        const customerData = await kv.get(`lib:app:${slug}`);

        if (!customerData) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head><title>Tool nicht gefunden</title></head>
                <body style="font-family: -apple-system, sans-serif; text-align: center; padding: 50px;">
                    <h1>🔍 Tool nicht gefunden</h1>
                    <p>Der Link <code>${slug}</code> ist ungültig.</p>
                    <a href="https://libralab.ai" style="color: #007AFF;">← Zurück zu LibraLab</a>
                </body>
                </html>
            `);
        }

        // Generate PWA manifest (PWA Builder optimized)
        const manifest = {
            "id": `/${slug}`,
            "name": `${customerData.company} - ${getProductDisplayName(customerData.product)}`,
            "short_name": customerData.company,
            "description": `Professional ${getProductDisplayName(customerData.product)} tool by LibraLab`,
            "start_url": `/${slug}`,
            "scope": `/${slug}/`,
            "display": "standalone",
            "orientation": "portrait-primary",
            "background_color": getThemeColor(customerData.product),
            "theme_color": getThemeColor(customerData.product),
            "categories": ["business", "productivity"],
            "lang": "de-AT",
            "dir": "ltr",
            "launch_handler": {
                "client_mode": "navigate-existing"
            },
            "screenshots": [
                {
                    "src": getScreenshotDataUri(customerData.product),
                    "sizes": "540x720",
                    "type": "image/png",
                    "form_factor": "narrow"
                },
                {
                    "src": getScreenshotDataUri(customerData.product, 'wide'),
                    "sizes": "720x540",
                    "type": "image/png",
                    "form_factor": "wide"
                }
            ],
            "shortcuts": [
                {
                    "name": "Neue Rechnung",
                    "short_name": "Neu",
                    "description": "Neue Rechnung erstellen",
                    "url": `/${slug}?action=new`,
                    "icons": [{ "src": getIconDataUri(customerData.product), "sizes": "96x96" }]
                },
                {
                    "name": "Rechnungen",
                    "short_name": "Liste",
                    "description": "Alle Rechnungen anzeigen",
                    "url": `/${slug}?action=list`,
                    "icons": [{ "src": getIconDataUri(customerData.product), "sizes": "96x96" }]
                }
            ],
            "icons": [
                {
                    "src": getIconDataUri(customerData.product),
                    "sizes": "192x192",
                    "type": "image/png",
                    "purpose": "any"
                },
                {
                    "src": getIconDataUri(customerData.product),
                    "sizes": "512x512",
                    "type": "image/png",
                    "purpose": "any"
                },
                {
                    "src": getIconDataUri(customerData.product),
                    "sizes": "192x192",
                    "type": "image/png",
                    "purpose": "maskable"
                }
            ]
        };

        // Use separate manifest endpoint instead of data URI
        const manifestUrl = `/api/manifest?tool=${slug}`;

        // Load and personalize template
        const template = getTemplate(customerData.product);
        const personalizedHtml = template
            .replace(/{{COMPANY_NAME}}/g, customerData.company)
            .replace(/{{PWA_MANIFEST_URL}}/g, manifestUrl)
            .replace(/{{PRODUCT_NAME}}/g, customerData.product)
            .replace(/{{THEME_COLOR}}/g, getThemeColor(customerData.product));

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600');

        return res.send(personalizedHtml);

    } catch (error) {
        console.error('Tool delivery error:', error);
        return res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head><title>Fehler</title></head>
            <body style="font-family: -apple-system, sans-serif; text-align: center; padding: 50px;">
                <h1>⚠️ Fehler</h1>
                <p>Tool konnte nicht geladen werden: ${error.message}</p>
                <a href="https://libralab.ai/support" style="color: #007AFF;">Support kontaktieren</a>
            </body>
            </html>
        `);
    }
}

function getTemplate(productName) {
    const templates = {
        'AI_Invoices': `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>{{COMPANY_NAME}} - AI Rechnungen</title>
    <meta name="description" content="Professional AI-powered invoicing tool for {{COMPANY_NAME}}">

    <!-- PWA Manifest -->
    <link rel="manifest" href="{{PWA_MANIFEST_URL}}">

    <!-- PWA Meta Tags (Enhanced) -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="{{COMPANY_NAME}} AI Rechnungen">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="theme-color" content="{{THEME_COLOR}}">
    <meta name="msapplication-TileColor" content="{{THEME_COLOR}}">
    <meta name="msapplication-navbutton-color" content="{{THEME_COLOR}}">

    <!-- Security & Performance -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="robots" content="noindex, nofollow">
    <style>
        body { font-family: -apple-system, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); min-height: 100vh; color: white; }
        .container { max-width: 900px; margin: 0 auto; }
        .header { background: white; color: #333; border-radius: 15px; padding: 25px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center; }
        .company-name { font-size: 24px; font-weight: bold; color: #4299e1; margin-bottom: 5px; }
        .tool-title { font-size: 18px; color: #666; margin-bottom: 10px; }
        .ai-badge { background: linear-gradient(45deg, #48bb78, #38a169); color: white; padding: 6px 12px; border-radius: 15px; font-size: 12px; font-weight: bold; }
        .card { background: white; color: #333; border-radius: 15px; padding: 25px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .btn { background: #4299e1; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer; }
        .success-info { background: #e6fffa; color: #234e52; padding: 20px; border-radius: 10px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company-name">{{COMPANY_NAME}}</div>
            <div class="tool-title">KI-gestützte Rechnungserstellung</div>
            <div class="ai-badge">🤖 AI Powered</div>
        </div>
        <div class="card">
            <h2>🤖 Ihr AI Rechnungs-Tool ist bereit!</h2>
            <p>Willkommen bei Ihrem personalisierten KI-gestützten Rechnungs-Tool.</p>
            <button class="btn" onclick="alert('Vollständige AI Rechnungs-Funktionalität wird geladen...\\n\\nFeatures: KI-Vorschläge, PDF-Export, Offline-Modus')">🚀 AI Tool starten</button>
        </div>
        <div class="success-info">
            <h4>✅ PWA erfolgreich aktiviert</h4>
            <p><strong>Installation:</strong> Browser Menu → "App installieren"<br>
            <strong>Features:</strong> Offline-fähig, JSON Export, KI-Vorschläge<br>
            <strong>Support:</strong> support@libralab.ai</p>
        </div>
    </div>
    <script>
        console.log('{{COMPANY_NAME}} AI Rechnungs-Tool geladen');

        // Enhanced PWA Service Worker for install detection
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(() => {
                console.log('✅ Service Worker registered');
            }).catch(() => {
                // Fallback: Inline service worker
                navigator.serviceWorker.register('data:text/javascript;base64,' + btoa(\`
                    self.addEventListener('install', () => self.skipWaiting());
                    self.addEventListener('activate', () => self.clients.claim());
                    self.addEventListener('fetch', (event) => {
                        event.respondWith(fetch(event.request));
                    });
                \`)).then(() => {
                    console.log('✅ Fallback Service Worker registered');
                });
            });
        }

        // PWA Install Detection
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;

            // Show install button
            const installBtn = document.createElement('button');
            installBtn.innerHTML = '📱 App installieren';
            installBtn.style.cssText = \`
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #48bb78;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 1000;
            \`;

            installBtn.onclick = () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        installBtn.remove();
                    }
                    deferredPrompt = null;
                });
            };

            document.body.appendChild(installBtn);
        });
    </script>
</body>
</html>`,

        'handwerker_angebote': `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{COMPANY_NAME}} - Angebote</title>
    <link rel="manifest" href="{{PWA_MANIFEST_URL}}">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="theme-color" content="{{THEME_COLOR}}">
    <style>
        body { font-family: -apple-system, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: white; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { background: white; color: #333; border-radius: 15px; padding: 25px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center; }
        .company-name { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
        .card { background: white; color: #333; border-radius: 15px; padding: 25px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .btn { background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer; }
        .success-info { background: #e6fffa; color: #234e52; padding: 20px; border-radius: 10px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company-name">{{COMPANY_NAME}}</div>
            <div>Angebots-Tool</div>
        </div>
        <div class="card">
            <h2>🎯 Ihr Angebots-Tool ist bereit!</h2>
            <p>Willkommen bei Ihrem personalisierten Angebots-Tool.</p>
            <button class="btn" onclick="alert('Vollständige Angebots-Funktionalität wird geladen...')">🚀 Tool starten</button>
        </div>
        <div class="success-info">
            <h4>✅ PWA erfolgreich aktiviert</h4>
            <p><strong>Installation:</strong> Browser Menu → "App installieren"<br>
            <strong>Features:</strong> Offline-fähig, JSON Export, PDF-Erstellung<br>
            <strong>Support:</strong> support@libralab.ai</p>
        </div>
    </div>
    <script>
        console.log('{{COMPANY_NAME}} Angebots-Tool geladen');
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('data:text/javascript;base64,' + btoa('self.addEventListener("install", () => self.skipWaiting()); self.addEventListener("activate", () => self.clients.claim());'));
        }
    </script>
</body>
</html>`
    };

    return templates[productName] || templates['handwerker_angebote'];
}

function getThemeColor(productName) {
    const colors = {
        'AI_Invoices': '#4299e1',
        'handwerker_angebote': '#667eea'
    };
    return colors[productName] || '#667eea';
}

function getProductDisplayName(productName) {
    const displayNames = {
        'AI_Invoices': 'AI Rechnungen',
        'handwerker_angebote': 'Angebote'
    };
    return displayNames[productName] || productName;
}

function getIconDataUri(productName) {
    // Generate PNG-like icon as data URI
    const colors = {
        'AI_Invoices': { bg: '#4299e1', text: 'AI' },
        'handwerker_angebote': { bg: '#667eea', text: '🔨' }
    };

    const config = colors[productName] || colors['handwerker_angebote'];

    return `data:image/svg+xml;base64,${Buffer.from(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
            <rect width="192" height="192" fill="${config.bg}" rx="32" ry="32"/>
            <text x="96" y="96" font-family="Arial, sans-serif" font-size="80" font-weight="bold"
                  text-anchor="middle" dominant-baseline="central" fill="white">${config.text}</text>
        </svg>
    `).toString('base64')}`;
}

function getScreenshotDataUri(productName, formFactor = 'narrow') {
    // Generate simple screenshot placeholder
    const width = formFactor === 'wide' ? 720 : 540;
    const height = formFactor === 'wide' ? 540 : 720;
    const color = getThemeColor(productName).replace('#', '');

    // Return placeholder screenshot
    return `data:image/svg+xml;base64,${Buffer.from(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
            <rect width="${width}" height="${height}" fill="${getThemeColor(productName)}"/>
            <text x="${width/2}" y="${height/2}" font-family="Arial, sans-serif" font-size="24"
                  text-anchor="middle" dominant-baseline="central" fill="white">
                ${getProductDisplayName(productName)} Preview
            </text>
        </svg>
    `).toString('base64')}`;
}