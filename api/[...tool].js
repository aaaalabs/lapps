// Dynamic PWA Delivery System for app.libralab.ai
// Handles: app.libralab.ai/[company]_[product]_[uuid]

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    try {
        const { tool } = req.query;
        const kaufcode = Array.isArray(tool) ? tool.join('_') : tool;

        console.log('PWA Request:', kaufcode);

        // Load customer data from Redis
        const customerData = await kv.get(`lib:app:${kaufcode}`);

        if (!customerData) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head><title>Tool nicht gefunden</title></head>
                <body style="font-family: -apple-system, sans-serif; text-align: center; padding: 50px;">
                    <h1>🔍 Tool nicht gefunden</h1>
                    <p>Der angeforderte Link ist ungültig oder abgelaufen.</p>
                    <a href="https://libralab.ai" style="color: #007AFF;">← Zurück zu LibraLab</a>
                </body>
                </html>
            `);
        }

        // Load master template (from GitHub or local copy)
        const masterHtml = await loadTemplate(customerData.product);

        if (!masterHtml) {
            return res.status(500).send('Template nicht gefunden');
        }

        // Generate PWA manifest
        const manifest = generatePWAManifest(customerData, kaufcode);
        const manifestDataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(manifest)).toString('base64')}`;

        // Inject customer data into template
        const personalizedHtml = masterHtml
            .replace(/{{COMPANY_NAME}}/g, customerData.company)
            .replace(/{{PWA_MANIFEST_URL}}/g, manifestDataUri);

        // Set PWA headers
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache

        return res.send(personalizedHtml);

    } catch (error) {
        console.error('PWA Delivery Error:', error);
        return res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head><title>Fehler</title></head>
            <body style="font-family: -apple-system, sans-serif; text-align: center; padding: 50px;">
                <h1>⚠️ Fehler</h1>
                <p>Es gab ein Problem beim Laden Ihrer App.</p>
                <a href="https://libralab.ai/support" style="color: #007AFF;">Support kontaktieren</a>
            </body>
            </html>
        `);
    }
}

async function loadTemplate(productName) {
    try {
        // In production: Load from GitHub API or local file system
        // For now: Return hardcoded template path

        const templateMap = {
            'handwerker_angebote': 'handwerker_angebote_master.html',
            'restaurant_karte': 'restaurant_karte_master.html'
        };

        const templateFile = templateMap[productName];
        if (!templateFile) {
            throw new Error(`Template für ${productName} nicht gefunden`);
        }

        // TODO: Implement actual template loading from GitHub or local storage
        // For now, return the master template structure
        return getMasterTemplate();

    } catch (error) {
        console.error('Template loading error:', error);
        return null;
    }
}

function generatePWAManifest(customerData, kaufcode) {
    return {
        "name": `${customerData.company} - Business Tool`,
        "short_name": customerData.company,
        "description": "Professional Business Tool by LibraLab",
        "start_url": `/${kaufcode}`,
        "scope": `/${kaufcode}`,
        "display": "standalone",
        "orientation": "portrait",
        "background_color": "#667eea",
        "theme_color": "#667eea",
        "icons": [
            {
                "src": getIconDataUri(customerData.product),
                "sizes": "192x192",
                "type": "image/svg+xml",
                "purpose": "any maskable"
            },
            {
                "src": getIconDataUri(customerData.product),
                "sizes": "512x512",
                "type": "image/svg+xml",
                "purpose": "any maskable"
            }
        ]
    };
}

function getIconDataUri(productName) {
    // Professional SVG icons encoded as data URIs
    const icons = {
        'handwerker_angebote': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8IS0tIFByb2Zlc3Npb25hbCBncmFkaWVudCBiYWNrZ3JvdW5kIC0tPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJiZ0dyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY2N2VlYTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNzY0YmEyO3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjYmdHcmFkaWVudCkiIHJ4PSIxOCIgcnk9IjE4Ii8+CiAgPHRleHQgeD0iNTAiIHk9IjUwIiBmb250LXNpemU9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZmlsbD0id2hpdGUiPvCfm6A8L3RleHQ+Cjwvc3ZnPg=='
    };

    return icons[productName] || icons['handwerker_angebote'];
}

function getMasterTemplate() {
    // Return the master template content
    // This would normally be loaded from the solutions directory
    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{COMPANY_NAME}} - Angebote</title>
    <link rel="manifest" href="{{PWA_MANIFEST_URL}}">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="theme-color" content="#667eea">
    <style>
        body { font-family: -apple-system, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { background: white; border-radius: 15px; padding: 25px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center; }
        .company-name { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
        .card { background: white; border-radius: 15px; padding: 25px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .btn { background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer; }
        input, select, textarea { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; margin: 8px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company-name">{{COMPANY_NAME}}</div>
            <div>Angebots-Tool</div>
        </div>
        <div class="card">
            <h2>Funktional PWA Tool</h2>
            <p>Ihr personalisiertes Angebots-Tool ist ready!</p>
            <button class="btn">Tool verwenden</button>
        </div>
    </div>
    <script>
        console.log('{{COMPANY_NAME}} PWA Tool geladen');
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('data:text/javascript;base64,' + btoa('self.addEventListener("install", () => self.skipWaiting()); self.addEventListener("activate", () => self.clients.claim());'));
        }
    </script>
</body>
</html>`;
}