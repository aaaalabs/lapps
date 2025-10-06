// Test endpoint for AI_Invoices
// GET /api/test-ai-invoices

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Create AI_Invoices test entry
        const testKaufcode = 'mueller_software_AI_Invoices_test456';

        const testCustomerData = {
            company: "Müller Software GmbH",
            product: "AI_Invoices",
            purchased: "2024-09-26",
            email: "office@mueller-software.at",
            price: 29,
            phase: "launch"
        };

        // Store in Redis
        await kv.set(`lib:app:${testKaufcode}`, testCustomerData);

        // Verify storage
        const stored = await kv.get(`lib:app:${testKaufcode}`);

        return res.json({
            success: true,
            message: 'AI_Invoices test data created',
            testUrl: `https://app.libralab.ai/${testKaufcode}`,
            storedData: stored,
            demoUrl: `https://app.libralab.ai/demo/AI_Invoices/AI_Invoices_demo.html`
        });

    } catch (error) {
        console.error('AI_Invoices test error:', error);
        return res.status(500).json({
            error: 'Failed to create AI_Invoices test data',
            details: error.message
        });
    }
}