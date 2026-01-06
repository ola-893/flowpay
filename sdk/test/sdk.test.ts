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

let server: Server;
const PORT = 3005;
const URL = `http://localhost:${PORT}/api/resource`;

describe('FlowPaySDK Integration', () => {
    let sdk: FlowPaySDK;

    before((done) => {
        server = app.listen(PORT, done);
    });

    after((done) => {
        server.close(done);
    });

    beforeEach(() => {
        // Init SDK with dummy config (we will mock the internal wallet/contract calls)
        sdk = new FlowPaySDK({
            privateKey: Wallet.createRandom().privateKey,
            rpcUrl: 'http://localhost:8545'
        });

        // Mock the `createStream` method to avoid real blockchain calls
        // We use `any` casting to override private/protected if needed, or better, 
        // we can just spy/stub if we used Sinon, but let's do a simple override for this test.
        sdk.createStream = async (contract: string, token: string, amount: bigint, duration: number) => {
            console.log(`[Mock] createStream called for ${amount} MNEE`);
            return '12345';
        };
    });

    it('should handle 402 and inject stream ID', async () => {
        const response = await sdk.makeRequest(URL);
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
    });

    it('should throw if mode is not streaming', async () => {
        // Setup a route that returns bad mode
        app.get('/api/badmode', (req, res) => {
            res.status(402).set({
                'X-FlowPay-Mode': 'one-time',
                'X-FlowPay-Contract': '0xContract'
            }).end();
        });

        try {
            await sdk.makeRequest(`http://localhost:${PORT}/api/badmode`);
            expect.fail("Should have thrown");
        } catch (e: any) {
            expect(e.message).to.include("only supports 'streaming' mode");
        }
    });
});
