import { expect } from 'chai';
import { FlowPaySDK } from '../src/FlowPaySDK';
import { Wallet, ethers } from 'ethers';
import express, { Express } from 'express';
import { Server } from 'http';

/**
 * End-to-End Integration Tests for FlowPay System
 * 
 * These tests validate the complete x402 handshake flow:
 * 1. Blind request → 402 Payment Required
 * 2. SDK parses x402 headers
 * 3. AI decides payment mode (streaming vs direct)
 * 4. Stream creation (1 signature)
 * 5. Retry with X-FlowPay-Stream-ID
 * 6. Multiple requests (0 signatures)
 * 7. Efficiency metrics validation
 * 
 * Validates: All requirements integration
 */

// Mock Provider Server (The Gatekeeper)
const createMockServer = () => {
    const app = express();
    app.use(express.json());

    // Track metrics
    let requestCount = 0;
    let streamVerifications = 0;

    // Mock contract for stream verification
    const mockContract = {
        isStreamActive: async (id: bigint) => {
            streamVerifications++;
            // Accept streams 1-1000 as valid
            return id >= 1n && id <= 1000n;
        }
    };

    // x402 Protected Route - Weather API (Streaming)
    app.get('/api/weather', (req, res) => {
        requestCount++;
        const streamId = req.headers['x-flowpay-stream-id'];

        if (!streamId) {
            // Return 402 Payment Required with x402 headers
            return res.status(402)
                .set({
                    'X-Payment-Required': 'true',
                    'X-FlowPay-Mode': 'streaming',
                    'X-FlowPay-Rate': '0.0001',
                    'X-MNEE-Address': '0xMockMNEE',
                    'X-FlowPay-Contract': '0xMockContract'
                })
                .json({
                    message: 'Payment Required',
                    requirements: {
                        mode: 'streaming',
                        price: '0.0001',
                        currency: 'MNEE'
                    }
                });
        }

        // Verify stream (mock)
        const id = BigInt(streamId as string);
        if (id >= 1n && id <= 1000n) {
            return res.json({
                temperature: 22,
                city: 'London',
                condition: 'Sunny',
                streamId: streamId,
                requestNumber: requestCount
            });
        }

        return res.status(402).json({ error: 'Invalid stream' });
    });

    // x402 Protected Route - Premium Content (Hybrid)
    app.get('/api/premium', (req, res) => {
        requestCount++;
        const streamId = req.headers['x-flowpay-stream-id'];
        const txHash = req.headers['x-flowpay-tx-hash'];

        if (!streamId && !txHash) {
            return res.status(402)
                .set({
                    'X-Payment-Required': 'true',
                    'X-FlowPay-Mode': 'hybrid',
                    'X-FlowPay-Rate': '0.001',
                    'X-MNEE-Address': '0xMockMNEE',
                    'X-FlowPay-Contract': '0xMockContract'
                })
                .json({
                    message: 'Payment Required',
                    requirements: {
                        mode: 'hybrid',
                        price: '0.001',
                        currency: 'MNEE'
                    }
                });
        }

        if (txHash) {
            return res.json({
                content: 'Premium content via direct payment',
                method: 'direct',
                txHash: txHash
            });
        }

        return res.json({
            content: 'Premium content via streaming',
            method: 'stream',
            streamId: streamId
        });
    });

    // Public Route (no payment required)
    app.get('/api/free', (req, res) => {
        res.json({ message: 'Free content', requestCount });
    });

    // Metrics endpoint
    app.get('/metrics', (req, res) => {
        res.json({ requestCount, streamVerifications });
    });

    // Reset metrics
    app.post('/reset', (req, res) => {
        requestCount = 0;
        streamVerifications = 0;
        res.json({ reset: true });
    });

    return app;
};

describe('FlowPay End-to-End Integration Tests', function () {
    this.timeout(10000);

    let server: Server;
    let sdk: FlowPaySDK;
    const PORT = 3010;
    const BASE_URL = `http://localhost:${PORT}`;

    before((done) => {
        const app = createMockServer();
        server = app.listen(PORT, done);
    });

    after((done) => {
        server.close(done);
    });

    beforeEach(async () => {
        // Reset server metrics
        await fetch(`${BASE_URL}/reset`, { method: 'POST' });

        // Initialize SDK with mock stream creation
        sdk = new FlowPaySDK({
            privateKey: Wallet.createRandom().privateKey,
            rpcUrl: 'http://localhost:8545',
            agentId: 'Integration-Test-Agent'
        });

        // Mock createStream to return predictable stream IDs
        let streamCounter = 0;
        (sdk as any).createStream = async () => {
            streamCounter++;
            return {
                streamId: String(streamCounter),
                startTime: BigInt(Math.floor(Date.now() / 1000))
            };
        };

        // Mock direct payment
        (sdk as any).performDirectPayment = async (url: string, options: any) => {
            const axios = require('axios');
            return axios(url, {
                ...options,
                headers: { ...options?.headers, 'X-FlowPay-Tx-Hash': '0xMockTxHash' }
            });
        };
    });

    describe('Complete x402 Handshake Flow', () => {
        it('should complete blind request → 402 → stream → success flow', async () => {
            // Step 1: Make blind request (SDK handles 402 automatically)
            const response = await sdk.makeRequest(`${BASE_URL}/api/weather`);

            // Step 2: Verify successful response
            expect(response.status).to.equal(200);
            expect(response.data.temperature).to.equal(22);
            expect(response.data.streamId).to.equal('1');

            // Step 3: Verify metrics show stream was created
            const metrics = sdk.getMetrics();
            expect(metrics.signersTriggered).to.equal(1);
        });

        it('should reuse stream for subsequent requests (0 additional signatures)', async () => {
            // First request creates stream
            await sdk.makeRequest(`${BASE_URL}/api/weather`);

            // Make 10 more requests
            for (let i = 0; i < 10; i++) {
                const res = await sdk.makeRequest(`${BASE_URL}/api/weather`);
                expect(res.status).to.equal(200);
            }

            // Verify efficiency: 11 requests, only 1 signature
            const metrics = sdk.getMetrics();
            expect(metrics.requestsSent).to.equal(11);
            expect(metrics.signersTriggered).to.equal(1);
        });

        it('should handle concurrent requests efficiently', async () => {
            // First establish stream
            await sdk.makeRequest(`${BASE_URL}/api/weather`);

            // Fire 20 concurrent requests
            const promises = Array(20).fill(null).map(() =>
                sdk.makeRequest(`${BASE_URL}/api/weather`)
            );

            const results = await Promise.all(promises);

            // All should succeed
            results.forEach(res => expect(res.status).to.equal(200));

            // Still only 1 signature total
            const metrics = sdk.getMetrics();
            expect(metrics.signersTriggered).to.equal(1);
            expect(metrics.requestsSent).to.equal(21);
        });
    });

    describe('Hybrid Payment Mode Selection', () => {
        it('should choose direct payment for low volume (N=1)', async () => {
            const response = await sdk.makeRequest(`${BASE_URL}/api/premium`, {
                headers: { 'x-simulation-n': '1' }
            });

            expect(response.status).to.equal(200);
            expect(response.data.method).to.equal('direct');
        });

        it('should choose streaming for high volume (N=10)', async () => {
            const response = await sdk.makeRequest(`${BASE_URL}/api/premium`, {
                headers: { 'x-simulation-n': '10' }
            });

            expect(response.status).to.equal(200);
            expect(response.data.method).to.equal('stream');
        });
    });

    describe('N+1 Signature Problem Solution', () => {
        it('should require exactly 2 on-chain transactions for any request volume', async () => {
            // Simulate a full session: open stream, make many requests, close stream
            const REQUEST_COUNT = 50;

            // Open stream (1 signature)
            await sdk.makeRequest(`${BASE_URL}/api/weather`);

            // Make many requests (0 signatures)
            for (let i = 0; i < REQUEST_COUNT - 1; i++) {
                await sdk.makeRequest(`${BASE_URL}/api/weather`);
            }

            // Verify: Only 1 signature for opening (close would be 2nd)
            const metrics = sdk.getMetrics();
            expect(metrics.requestsSent).to.equal(REQUEST_COUNT);
            expect(metrics.signersTriggered).to.equal(1);

            // Efficiency ratio
            const efficiency = metrics.requestsSent / metrics.signersTriggered;
            expect(efficiency).to.equal(REQUEST_COUNT);
        });
    });

    describe('Agent Metadata and Identification', () => {
        it('should include agent ID in stream details', () => {
            const details = sdk.getStreamDetails('test-stream');
            expect(details.agentId).to.equal('Integration-Test-Agent');
            expect(details.client).to.equal('FlowPaySDK/1.0');
        });
    });

    describe('Safety Mechanisms', () => {
        it('should enforce spending limits', () => {
            const limitedSdk = new FlowPaySDK({
                privateKey: Wallet.createRandom().privateKey,
                rpcUrl: 'http://localhost:8545',
                spendingLimits: {
                    dailyLimit: ethers.parseEther('0.5'),
                    totalLimit: ethers.parseEther('1.0')
                }
            });

            // First spend should succeed
            limitedSdk.monitor.checkAndRecordSpend(ethers.parseEther('0.4'));

            // Second spend should fail (exceeds daily limit)
            expect(() => limitedSdk.monitor.checkAndRecordSpend(ethers.parseEther('0.2')))
                .to.throw('Daily spending limit exceeded');
        });

        it('should block requests after emergency stop', async () => {
            sdk.emergencyStop();

            try {
                await sdk.makeRequest(`${BASE_URL}/api/weather`);
                expect.fail('Should have thrown');
            } catch (e: any) {
                expect(e.message).to.include('Emergency Stop');
            }
        });
    });

    describe('Real-time Calculations', () => {
        it('should calculate claimable balance correctly', () => {
            const startTime = Math.floor(Date.now() / 1000) - 100; // 100 seconds ago
            const rate = ethers.parseEther('0.0001');
            const amount = ethers.parseEther('1');

            const stream = {
                streamId: 'test',
                startTime,
                rate,
                amount
            };

            const claimable = sdk.calculateClaimable(stream);
            const expected = rate * 100n;

            expect(claimable).to.equal(expected);
        });
    });
});

describe('x402 Protocol Compliance', () => {
    let server: Server;
    const PORT = 3011;
    const BASE_URL = `http://localhost:${PORT}`;

    before((done) => {
        const app = createMockServer();
        server = app.listen(PORT, done);
    });

    after((done) => {
        server.close(done);
    });

    it('should return correct x402 headers on 402 response', async () => {
        const response = await fetch(`${BASE_URL}/api/weather`);

        expect(response.status).to.equal(402);
        expect(response.headers.get('x-payment-required')).to.equal('true');
        expect(response.headers.get('x-flowpay-mode')).to.equal('streaming');
        expect(response.headers.get('x-flowpay-rate')).to.equal('0.0001');
        expect(response.headers.get('x-mnee-address')).to.exist;
        expect(response.headers.get('x-flowpay-contract')).to.exist;
    });

    it('should include payment requirements in 402 body', async () => {
        const response = await fetch(`${BASE_URL}/api/weather`);
        const body = await response.json();

        expect(body.requirements).to.exist;
        expect(body.requirements.mode).to.equal('streaming');
        expect(body.requirements.price).to.equal('0.0001');
        expect(body.requirements.currency).to.equal('MNEE');
    });
});
