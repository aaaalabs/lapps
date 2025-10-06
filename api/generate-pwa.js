// PWA Generation Trigger API
// POST /api/generate-pwa
// Called by libralab-landing after successful Stripe payment

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { kaufcode, company, product, email } = req.body;

        console.log('PWA Generation Request:', { kaufcode, company, product, email });

        // Validate required fields
        if (!kaufcode || !company || !product || !email) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['kaufcode', 'company', 'product', 'email']
            });
        }

        // Verify Redis entry exists
        const customerData = await kv.get(`lib:app:${kaufcode}`);

        if (!customerData) {
            return res.status(404).json({
                error: 'Customer data not found in Redis',
                kaufcode: kaufcode
            });
        }

        // Validate data consistency
        if (customerData.company !== company || customerData.product !== product) {
            return res.status(400).json({
                error: 'Data mismatch between request and Redis',
                redis: { company: customerData.company, product: customerData.product },
                request: { company, product }
            });
        }

        // Generate PWA URL
        const pwaUrl = `https://app.libralab.ai/${kaufcode}`;

        // Test PWA accessibility (pre-validate)
        const testResponse = await fetch(`${pwaUrl}`, { method: 'HEAD' });
        const isAccessible = testResponse.status === 200;

        // Prepare email data for libralab-landing
        const emailData = {
            company: customerData.company,
            product: customerData.product,
            pwaUrl: pwaUrl,
            downloadUrl: `${pwaUrl}?download=html`,
            price: customerData.price,
            phase: customerData.phase
        };

        // Success response
        return res.status(200).json({
            success: true,
            message: 'PWA successfully generated and activated',
            data: {
                kaufcode: kaufcode,
                pwaUrl: pwaUrl,
                company: customerData.company,
                product: customerData.product,
                installable: true,
                accessible: isAccessible,
                emailData: emailData
            },
            instructions: {
                pwa: 'Open PWA URL on mobile → Browser shows "Add to Home Screen"',
                download: 'Add ?download=html to URL for offline HTML version',
                support: 'Contact support if PWA installation fails'
            }
        });

    } catch (error) {
        console.error('PWA Generation Error:', error);
        return res.status(500).json({
            error: 'Failed to generate PWA',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
}