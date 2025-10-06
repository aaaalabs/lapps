// Icon generator endpoint
// GET /api/icon?tool=[kaufcode]&size=[192|512]

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    try {
        const { tool, size = '192' } = req.query;

        if (!tool) {
            return res.status(400).send('No tool specified');
        }

        // Load customer data from Redis
        const customerData = await kv.get(`lib:app:${tool}`);

        if (!customerData) {
            return res.status(404).send('Tool not found');
        }

        // Generate PNG icon as SVG (browsers render as PNG)
        const iconSvg = generateIconSVG(customerData.product, parseInt(size));

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours

        return res.send(iconSvg);

    } catch (error) {
        console.error('Icon generation error:', error);
        return res.status(500).send('Icon generation failed');
    }
}

function generateIconSVG(productName, size) {
    const configs = {
        'AI_Invoices': {
            bg: '#4299e1',
            bgSecondary: '#3182ce',
            icon: 'AI',
            fontSize: Math.floor(size * 0.4)
        },
        'handwerker_angebote': {
            bg: '#667eea',
            bgSecondary: '#5a67d8',
            icon: '🔨',
            fontSize: Math.floor(size * 0.4)
        }
    };

    const config = configs[productName] || configs['handwerker_angebote'];

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${config.bg};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${config.bgSecondary};stop-opacity:1" />
        </linearGradient>
    </defs>

    <!-- Background with rounded corners -->
    <rect width="${size}" height="${size}" fill="url(#bgGradient)" rx="${size * 0.15}" ry="${size * 0.15}"/>

    <!-- Professional highlight -->
    <circle cx="${size * 0.85}" cy="${size * 0.15}" r="${size * 0.03}" fill="rgba(255,255,255,0.3)"/>

    <!-- Icon text -->
    <text x="${size/2}" y="${size/2}"
          font-family="system-ui, -apple-system, Arial, sans-serif"
          font-size="${config.fontSize}"
          font-weight="900"
          text-anchor="middle"
          dominant-baseline="central"
          fill="white">${config.icon}</text>

    <!-- Subtle shadow for depth -->
    <rect width="${size}" height="${size}" fill="none"
          stroke="rgba(0,0,0,0.1)"
          stroke-width="1"
          rx="${size * 0.15}"
          ry="${size * 0.15}"/>
</svg>`;
}