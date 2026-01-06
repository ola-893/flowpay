import { expect } from 'chai';
import { FlowPaySDK } from '../src/FlowPaySDK';
import { Wallet, ethers } from 'ethers';
import express, { Express } from 'express';
import { Server } from 'http';

// Mock Server Setup
const app = express();
app.use(express.json());

// Mock 402 Route
app.get('/api/resource', (req, res) => {
    const streamId = req.headers['x-flowpay-stream-id'];
    if (streamId === '12345') {
        res.json({ success: true, da: 'ta' });
    } else {
        res.status(402).set({
            'X-Payment-Required': 'true',
            'X-FlowPay-Mode': 'streaming',
            'X-FlowPay-Rate': '0.0001',
            'X-MNEE-Address': '0xToken',
            'X-FlowPay-Contract': '0xContract'
        }).json({
            error: "Payment Required"
        });
    }
});

// Mock Auth Route
app.get('/api/secure', (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== 'secret-key') {
        return res.status(401).json({ error: "Unauthorized" });
    }

    // Auth success, now check payment
    const streamId = req.headers['x-flowpay-stream-id'];
    if (streamId === '12345') {
        res.json({ success: true, secure: 'data' });
    } else {
        res.status(402).set({
            'X-Payment-Required': 'true',
            'X-FlowPay-Mode': 'streaming',
            'X-FlowPay-Rate': '0.0002', // Higher rate
            'X-MNEE-Address': '0xToken',
            'X-FlowPay-Contract': '0xContract'
        }).json({
            error: "Payment Required"
        });
    }
});

let server: Server;
const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

describe('FlowPaySDK Integration & Property Tests', () => {
    let sdk: FlowPaySDK;
    let createStreamSpy: any;

    before((done) => {
        server = app.listen(PORT, done);
    });

    after((done) => {
        server.close(done);
    });

    beforeEach(() => {
        // Init SDK with dummy config
        sdk = new FlowPaySDK({
            privateKey: Wallet.createRandom().privateKey,
            rpcUrl: 'http://localhost:8545',
            apiKey: 'secret-key' // Default valid key
        });

        // Mock createStream
        createStreamSpy = {
            called: false,
            args: {} as any
        };

        sdk.createStream = async (contract: string, token: string, amount: bigint, duration: number) => {
            console.log(`[Mock] createStream called for ${amount} MNEE`);
            createStreamSpy.called = true;
            createStreamSpy.args = { contract, token, amount, duration };
            return { streamId: '12345', startTime: BigInt(Date.now()) };
        };
    });

    // Property 4: x402 Response Parsing and Retry
    it('Property 4: Should intercept 402, parse headers, and retry with stream ID', async () => {
        const response = await sdk.makeRequest(`${BASE_URL}/api/resource`);
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;

        // internal verify
        expect(createStreamSpy.called).to.be.true;
    });

    it('Property 4: Should fail if mode is not streaming', async () => {
        app.get('/api/badmode', (req, res) => {
            res.status(402).set({
                'X-FlowPay-Mode': 'one-time',
                'X-FlowPay-Contract': '0xContract'
            }).end();
        });

        try {
            await sdk.makeRequest(`${BASE_URL}/api/badmode`);
            expect.fail("Should have thrown");
        } catch (e: any) {
            expect(e.message).to.include("only supports 'streaming' or 'hybrid' mode");
        }
    });

    // Property 9: Automatic Stream Creation from 402
    it('Property 9: Should calculate correct stream amount based on Rate header', async () => {
        // Rate is 0.0001 (from /api/resource). Duration hardcoded to 3600 in SDK.
        // Expected = 0.0001 * 3600 = 0.36
        const expectedAmount = ethers.parseEther("0.36");

        await sdk.makeRequest(`${BASE_URL}/api/resource`);

        expect(createStreamSpy.called).to.be.true;
        expect(createStreamSpy.args.amount).to.equal(expectedAmount);
        expect(createStreamSpy.args.duration).to.equal(3600);
    });

    // Property 14: API Key Authentication
    it('Property 14: Should send API key and handle 401 if missing/invalid', async () => {
        // 1. Test with Valid Key (already set in beforeEach)
        // Hit /api/secure which requires Auth AND Payment
        const res = await sdk.makeRequest(`${BASE_URL}/api/secure`);
        expect(res.status).to.equal(200);
        expect(res.data.secure).to.equal('data');

        // Check if createStream used the HIGHER rate from /api/secure
        // Rate 0.0002 * 3600 = 0.72
        expect(createStreamSpy.args.amount).to.equal(ethers.parseEther("0.72"));
    });

    it('Property 14: Should fail with 401 if API key is invalid', async () => {
        const badSdk = new FlowPaySDK({
            privateKey: Wallet.createRandom().privateKey,
            rpcUrl: 'http://localhost:8545',
            apiKey: 'wrong-key'
        });

        try {
            await badSdk.makeRequest(`${BASE_URL}/api/secure`);
            expect.fail("Should have failed with 401");
        } catch (e: any) {
            expect(e.response.status).to.equal(401);
        }
    });
});
