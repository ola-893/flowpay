import express from 'express';
import cors from 'cors';
const flowPayMiddleware = require('../server/middleware/flowPayMiddleware');
import { ethers } from 'ethers';

// Demo Provider: "The Gatekeeper"
// Exposes premium content behind FlowPay wall.

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

// Mock Configuration
const config = {
    mneeAddress: "0xMockMneeAddress",
    flowPayContractAddress: "0xMockFlowPayContract",
    rpcUrl: "http://localhost:8545",
    mockContract: {
        // Mock Contract for Middleware Validation
        isStreamActive: async (id: any) => {
            console.log(`[Gatekeeper] Checking Stream #${id}...`);
            return true; // Always validate for demo
        }
    },
    routes: {
        '/api/premium': {
            mode: 'streaming',
            price: '0.0001' // 0.0001 MNEE per second
        },
        '/api/ai-insight': {
            mode: 'direct',
            price: '5.0' // 5 MNEE one-off
        }
    }
};

// Apply FlowPay Middleware Globaly (to match full paths in config)
app.use(flowPayMiddleware(config));

// Protected Routes
app.get('/api/premium', (req: any, res) => {
    res.json({
        data: "🌟 This is PREMIUM content delivered via Streaming Payment!",
        streamId: req.flowPay.streamId,
        timestamp: Date.now()
    });
});

app.get('/api/ai-insight', (req: any, res) => {
    res.json({
        insight: "buy low, sell high",
        paidWith: req.flowPay.txHash
    });
});

// Start if not imported (allows testing)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`[Gatekeeper] Provider Agent running on http://localhost:${PORT}`);
        console.log(`[Gatekeeper] Protected Routes: /api/premium, /api/ai-insight`);
    });
}

export default app;
