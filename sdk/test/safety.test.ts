import { expect } from 'chai';
import { FlowPaySDK } from '../src/FlowPaySDK';
import { Wallet, ethers } from 'ethers';
import axios from 'axios';

describe('Safety & Auto-renewal Systems', () => {
    let sdk: FlowPaySDK;
    let createStreamSpy: any;

    beforeEach(() => {
        // Init SDK with strict limits
        sdk = new FlowPaySDK({
            privateKey: Wallet.createRandom().privateKey,
            rpcUrl: 'http://localhost:8545',
            spendingLimits: {
                dailyLimit: ethers.parseEther("1.0"), // 1 MNEE Limit
                totalLimit: ethers.parseEther("10.0")
            }
        });

        // Mock createStream
        createStreamSpy = { called: 0 };
        (sdk as any).createStream = async () => {
            createStreamSpy.called++;
            return { streamId: `STREAM_${Date.now()}`, startTime: BigInt(Date.now()) };
        };

        // Mock Direct Payment
        (sdk as any).performDirectPayment = async () => {
            // Pass through safety check manually mocked here? 
            // No, we rely on the public method internal calls.
            // But performDirectPayment is private. 
            // We can trigger it via handlePaymentRequired.
        };

        // IMPORTANT: We need to spy on performDirectPayment internals OR mock the network call if we test e2e.
        // For unit testing SAFETY, we can just call checkSpend directly on monitor OR
        // we can spy on the monitor attached to SDK.
    });

    it('Should enforce Daily Spending Limit', () => {
        // limit is 1.0. 
        // Spending 0.6 is fine.
        sdk.monitor.checkAndRecordSpend(ethers.parseEther("0.6"));

        // Spending another 0.5 should fail (Total 1.1 > 1.0)
        expect(() => sdk.monitor.checkAndRecordSpend(ethers.parseEther("0.5")))
            .to.throw("Daily spending limit exceeded");
    });

    it('Emergency Stop should block requests', async () => {
        sdk.emergencyStop();

        try {
            await sdk.makeRequest("http://example.com");
            expect.fail("Should have thrown");
        } catch (e: any) {
            expect(e.message).to.include("Emergency Stop");
        }
    });

    it('Suspicious Activity (Rapid Renewals) should trigger Emergency Stop', () => {
        // renewalTimestamps is private. We can test via public checkSuspiciousActivity

        // Simulate 6 rapid checks (renewals)
        for (let i = 0; i < 6; i++) {
            sdk.monitor.checkSuspiciousActivity();
        }

        // The 6th one might not trigger? MAX is 5.
        // Let's check the return value.
        const isSuspicious = sdk.monitor.checkSuspiciousActivity(); // 7th check
        expect(isSuspicious).to.be.true;
    });

    it('Auto-Renewal Logic (Low Balance)', async () => {
        // Manually inject a "low balance" stream into cache
        const host = "low-balance.com";
        const lowAmount = ethers.parseEther("0.36"); // Total amount

        // We set startTime way back so claimable is high, remaining is low.
        // rate = 0.0001
        // amount = 0.36 (3600 seconds worth)
        // If we want < 10% remaining (< 0.036), we need > 3240 seconds elapsed.

        const startTime = BigInt(Math.floor(Date.now() / 1000) - 3500); // 3500s elapsed

        (sdk as any).activeStreams.set(host, {
            streamId: 'OLD_STREAM',
            startTime: Number(startTime),
            rate: ethers.parseEther("0.0001"),
            amount: lowAmount
        });

        // Mock axios to return success if we DON'T send stream ID (implying we cleared cache)
        // But wait, makeRequest calls axios. 
        // If we cleared cache, SDK makes request WITHOUT header.

        let headersSent: any = {};

        // Mock Axios simple interception
        // We can't easily mock axios import here without deeper tools.
        // Instead, we verify the SIDE EFFECT: The stream was removed from cache.

        try {
            await sdk.makeRequest(`http://${host}/api`);
        } catch (e) {
            // Expected to fail network call
        }

        // Check if cache is cleared
        const cached = (sdk as any).activeStreams.get(host);
        expect(cached).to.be.undefined;
        // Because remaining was < 10%, we deleted it to force renewal.
    });
});
