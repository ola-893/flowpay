import { expect } from 'chai';
import { FlowPaySDK } from '../src/FlowPaySDK';
import { Wallet } from 'ethers';
import express from 'express';
import { Server } from 'http';
import axios from 'axios';

// Mock Server Setup
const app = express();
app.use(express.json());

let lastReceivedHeaders: any = {};

app.get('/api/hybrid', (req, res) => {
    lastReceivedHeaders = req.headers;

    if (req.headers['x-flowpay-tx-hash'] || req.headers['x-flowpay-stream-id']) {
        // Payment provided
        return res.json({ success: true, method: req.headers['x-flowpay-tx-hash'] ? 'direct' : 'stream' });
    }

    // Return 402
    res.status(402).set({
        'X-Payment-Required': 'true',
        'X-FlowPay-Mode': 'hybrid', // Server suggesting hybrid capability
        'X-FlowPay-Rate': '0.0001',
        'X-MNEE-Address': '0xToken',
        'X-FlowPay-Contract': '0xContract'
    }).json({ error: "Payment Required" });
});

let server: Server;
const PORT = 3007; // Different port
const BASE_URL = `http://localhost:${PORT}`;

describe('FlowPaySDK Hybrid Payment Intelligence', () => {
    let sdk: FlowPaySDK;

    before((done) => {
        server = app.listen(PORT, done);
    });

    after((done) => {
        server.close(done);
    });

    beforeEach(() => {
        lastReceivedHeaders = {};
        sdk = new FlowPaySDK({
            privateKey: Wallet.createRandom().privateKey,
            rpcUrl: 'http://localhost:8545'
        });

        // Mock internal methods to avoid real chain calls
        (sdk as any).createStream = async () => {
            console.log("[Mock] createStream called");
            return { streamId: 'STREAM_101', startTime: BigInt(Date.now()) };
        };

        (sdk as any).performDirectPayment = async (url: string, options: any, token: string, amount: bigint) => {
            console.log("[Mock] performDirectPayment called");
            // Simulate success and retry
            return axios(url, {
                ...options,
                headers: { ...options.headers, 'X-FlowPay-Tx-Hash': '0xMOCK_HASH' }
            });
        };

        // Clear active streams cache
        (sdk as any).activeStreams.clear();
    });

    it('Scenario 1: Small request volume (N=1) -> Should choose Direct Payment', async () => {
        // We hint N=1 via header (or SDK default)
        const res = await sdk.makeRequest(`${BASE_URL}/api/hybrid`, {
            headers: { 'x-simulation-n': '1' }
        });

        expect(res.status).to.equal(200);
        expect(res.data.method).to.equal('direct');
        expect(lastReceivedHeaders['x-flowpay-tx-hash']).to.equal('0xMOCK_HASH');
        expect(lastReceivedHeaders['x-flowpay-stream-id']).to.be.undefined;
    });

    it('Scenario 2: Large request volume (N=10) -> Should choose Streaming', async () => {
        const res = await sdk.makeRequest(`${BASE_URL}/api/hybrid`, {
            headers: { 'x-simulation-n': '10' }
        });

        expect(res.status).to.equal(200);
        expect(res.data.method).to.equal('stream');
        expect(lastReceivedHeaders['x-flowpay-stream-id']).to.equal('STREAM_101');
        expect(lastReceivedHeaders['x-flowpay-tx-hash']).to.be.undefined;
    });

    it('AI Verification: Should default to Streaming if N is high (default 10)', async () => {
        // Default logic in SDK is N=10 if not provided
        const res = await sdk.makeRequest(`${BASE_URL}/api/hybrid`);

        expect(res.status).to.equal(200);
        expect(res.data.method).to.equal('stream');
    });
});
