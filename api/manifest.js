// Separate manifest endpoint to fix empty content issue
// GET /api/manifest?tool=[kaufcode]

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    try {
        const { tool } = req.query;

        if (!tool) {
            return res.status(400).json({ error: 'No tool specified' });
        }

        // Load customer data from Redis
        const customerData = await kv.get(`lib:app:${tool}`);

        if (!customerData) {
            return res.status(404).json({ error: 'Tool not found' });
        }

        // Generate clean manifest
        const manifest = {
            "id": `/${tool}`,
            "name": `${customerData.company} - ${getProductDisplayName(customerData.product)}`,
            "short_name": customerData.company,
            "description": `Professional ${getProductDisplayName(customerData.product)} tool by LibraLab`,
            "start_url": `/${tool}`,
            "scope": `/${tool}/`,
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
            "shortcuts": [
                {
                    "name": "Neue Rechnung",
                    "short_name": "Neu",
                    "description": "Neue Rechnung erstellen",
                    "url": `/${tool}?action=new`,
                    "icons": [{
                        "src": getIconDataUri(customerData.product),
                        "sizes": "96x96",
                        "type": "image/svg+xml"
                    }]
                },
                {
                    "name": "Übersicht",
                    "short_name": "Liste",
                    "description": "Alle Einträge anzeigen",
                    "url": `/${tool}?action=list`,
                    "icons": [{
                        "src": getIconDataUri(customerData.product),
                        "sizes": "96x96",
                        "type": "image/svg+xml"
                    }]
                }
            ],
            "icons": [
                {
                    "src": `/api/icon?tool=${tool}&size=192`,
                    "sizes": "192x192",
                    "type": "image/png",
                    "purpose": "any"
                },
                {
                    "src": `/api/icon?tool=${tool}&size=512`,
                    "sizes": "512x512",
                    "type": "image/png",
                    "purpose": "any"
                },
                {
                    "src": `/api/icon?tool=${tool}&size=192`,
                    "sizes": "192x192",
                    "type": "image/png",
                    "purpose": "maskable"
                }
            ]
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'public, max-age=3600');

        return res.json(manifest);

    } catch (error) {
        console.error('Manifest generation error:', error);
        return res.status(500).json({
            error: 'Failed to generate manifest',
            details: error.message
        });
    }
}

function getProductDisplayName(productName) {
    const displayNames = {
        'AI_Invoices': 'AI Rechnungen',
        'handwerker_angebote': 'Angebote'
    };
    return displayNames[productName] || productName;
}

function getThemeColor(productName) {
    const colors = {
        'AI_Invoices': '#4299e1',
        'handwerker_angebote': '#667eea'
    };
    return colors[productName] || '#667eea';
}

function getIconDataUri(productName) {
    // Clean SVG icons
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