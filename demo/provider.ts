import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import middleware - using require for CommonJS module
// eslint-disable-next-line @typescript-eslint/no-var-requires
const flowPayMiddleware = require('../server/middleware/flowPayMiddleware');

// Contract addresses on Sepolia
const MORPHSTREAM_ADDRESS = '0x155A00fBE3D290a8935ca4Bf5244283685Bb0035';
const MOCK_MNEE_ADDRESS = '0x96B1FE54Ee89811f46ecE4a347950E0D682D3896';
// Use a more reliable RPC endpoint
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

/**
 * Demo Provider: "The Gatekeeper"
 * 
 * This is a premium API service that:
 * 1. Requires MNEE payment streams for access
 * 2. Uses x402 protocol to negotiate payments
 * 3. Validates streams on-chain before serving content
 */
const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

// Real blockchain configuration for Sepolia
const config = {
    mneeAddress: MOCK_MNEE_ADDRESS,
    flowPayContractAddress: MORPHSTREAM_ADDRESS,
    rpcUrl: SEPOLIA_RPC_URL,
    routes: {
        '/api/premium': {
            mode: 'streaming',
            price: '0.0001' // 0.0001 MNEE per second
        },
        '/api/ai-insight': {
            mode: 'streaming',
            price: '0.001' // 0.001 MNEE per second (higher tier)
        }
    }
};

console.log("🔧 Provider Configuration:");
console.log(`   MorphStream Contract: ${MORPHSTREAM_ADDRESS}`);
console.log(`   MNEE Token: ${MOCK_MNEE_ADDRESS}`);
console.log(`   RPC URL: ${SEPOLIA_RPC_URL}`);

// Apply FlowPay Middleware (validates payment streams on-chain)
app.use(flowPayMiddleware(config));

// Health check endpoint (no payment required)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// Protected Premium Content Route
app.get('/api/premium', (req: any, res) => {
    const streamId = req.flowPay?.streamId || 'unknown';
    
    console.log(`📦 Serving premium content for Stream #${streamId}`);
    
    res.json({
        success: true,
        data: "🌟 This is PREMIUM content delivered via real MNEE payment streaming!",
        streamId: streamId,
        timestamp: Date.now(),
        message: "Your AI agent successfully negotiated payment and accessed this protected resource."
    });
});

// Protected AI Insight Route (higher tier)
app.get('/api/ai-insight', (req: any, res) => {
    const streamId = req.flowPay?.streamId || 'unknown';
    const txHash = req.flowPay?.txHash;
    
    console.log(`🧠 Serving AI insight for Stream #${streamId}`);
    
    res.json({
        success: true,
        insight: "Based on current market analysis: diversify your portfolio across multiple asset classes.",
        confidence: 0.87,
        streamId: streamId,
        paidWith: txHash || `stream:${streamId}`,
        timestamp: Date.now()
    });
});

// Info endpoint (no payment required)
app.get('/api/info', (req, res) => {
    res.json({
        name: "FlowPay Demo Provider",
        version: "1.0.0",
        network: "Sepolia Testnet",
        contracts: {
            morphStream: MORPHSTREAM_ADDRESS,
            mneeToken: MOCK_MNEE_ADDRESS
        },
        protectedRoutes: [
            { path: '/api/premium', price: '0.0001 MNEE/sec', mode: 'streaming' },
            { path: '/api/ai-insight', price: '0.001 MNEE/sec', mode: 'streaming' }
        ],
        documentation: "https://flowpay.dev/docs"
    });
});

// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`\n🚀 FlowPay Demo Provider running on http://localhost:${PORT}`);
        console.log(`\n📋 Available Endpoints:`);
        console.log(`   GET /health          - Health check (free)`);
        console.log(`   GET /api/info        - API info (free)`);
        console.log(`   GET /api/premium     - Premium content (0.0001 MNEE/sec)`);
        console.log(`   GET /api/ai-insight  - AI insights (0.001 MNEE/sec)`);
        console.log(`\n💡 To test, run the consumer in another terminal:`);
        console.log(`   npx ts-node demo/consumer.ts`);
    });
}

export default app;
