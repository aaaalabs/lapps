export default function handler(req, res) {
    const { html, name, icon } = req.method === 'POST' ? req.body : req.query;

    if (!html) {
        return res.status(400).json({ error: 'No HTML provided' });
    }

    const appName = name || 'LApp';
    const appIcon = icon || '📱';

    // Generate PWA-ready HTML with service worker and manifest
    const pwaHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName}</title>

    <!-- PWA Manifest -->
    <link rel="manifest" href="data:application/json;base64,${Buffer.from(JSON.stringify({
        "name": appName,
        "short_name": appName,
        "description": "Installierbare LApp",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#667eea",
        "theme_color": "#667eea",
        "icons": [
            {
                "src": "data:image/svg+xml;base64," + Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="50" text-anchor="middle" dominant-baseline="central" x="50">${appIcon}</text></svg>`).toString('base64'),
                "sizes": "192x192",
                "type": "image/svg+xml"
            }
        ]
    })).toString('base64')}">

    <!-- PWA Meta Tags -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="${appName}">
    <meta name="mobile-web-app-capable" content="yes">

    <style>
        /* Install button styles */
        #pwa-install-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #007AFF;
            color: white;
            border: none;
            border-radius: 25px;
            padding: 12px 20px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(0,122,255,0.3);
            cursor: pointer;
            z-index: 9999;
            font-family: -apple-system, sans-serif;
            display: none;
        }
        #pwa-install-btn:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <!-- Original HTML Content -->
    ${html}

    <!-- PWA Install Button -->
    <button id="pwa-install-btn" onclick="installPWA()">
        📱 Als App installieren
    </button>

    <script>
        // PWA Installation Logic
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            document.getElementById('pwa-install-btn').style.display = 'block';
        });

        function installPWA() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('PWA installation accepted');
                        document.getElementById('pwa-install-btn').style.display = 'none';
                    }
                    deferredPrompt = null;
                });
            } else {
                // Fallback: Manual instructions
                alert('Installiere diese App:\\n\\n1. Browser Menu öffnen\\n2. "Zum Startbildschirm hinzufügen"\\n3. App Icon erscheint auf Homescreen');
            }
        }

        // Hide install button if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            document.getElementById('pwa-install-btn').style.display = 'none';
        }

        // Service Worker Registration (minimal)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('data:text/javascript;base64,' + btoa(\`
                self.addEventListener('install', () => self.skipWaiting());
                self.addEventListener('activate', () => self.clients.claim());
                self.addEventListener('fetch', (event) => {
                    event.respondWith(fetch(event.request));
                });
            \`));
        }
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(pwaHtml);
}