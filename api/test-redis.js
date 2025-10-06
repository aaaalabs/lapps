// Test endpoint to populate Redis with demo data
// GET /api/test-redis

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Create test entry in Redis
        const testKaufcode = 'demo_handwerk_handwerker_angebote_test123';

        const testCustomerData = {
            company: "Demo Handwerk GmbH",
            product: "handwerker_angebote",
            purchased: "2024-09-26",
            email: "demo@handwerk.at",
            price: 29,
            phase: "launch"
        };

        // Store in Redis
        await kv.set(`lib:app:${testKaufcode}`, testCustomerData);

        // Verify storage
        const stored = await kv.get(`lib:app:${testKaufcode}`);

        return res.json({
            success: true,
            message: 'Test data created',
            testUrl: `https://app.libralab.ai/${testKaufcode}`,
            storedData: stored
        });

    } catch (error) {
        console.error('Redis test error:', error);
        return res.status(500).json({
            error: 'Failed to create test data',
            details: error.message
        });
    }
}