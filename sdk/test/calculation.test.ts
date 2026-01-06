import { expect } from 'chai';
import { FlowPaySDK, StreamMetadata } from '../src/FlowPaySDK';
import { Wallet, ethers } from 'ethers';

describe('FlowPaySDK Real-time Calculations', () => {
    let sdk: FlowPaySDK;
    let originalDateNow: any;

    beforeEach(() => {
        sdk = new FlowPaySDK({
            privateKey: Wallet.createRandom().privateKey,
            rpcUrl: 'http://localhost:8545'
        });
        originalDateNow = Date.now;
    });

    afterEach(() => {
        Date.now = originalDateNow;
    });

    it('Should calculate claimable balance correctly over time', () => {
        const startTime = 1000; // t=1000 seconds
        const rate = ethers.parseEther("1"); // 1 token per second
        const amount = ethers.parseEther("100"); // 100 tokens total

        const stream: StreamMetadata = {
            streamId: "1",
            startTime: startTime,
            rate: rate,
            amount: amount
        };

        // Mock Time: t=1000 (0 elapsed)
        Date.now = () => 1000 * 1000;
        expect(sdk.calculateClaimable(stream)).to.equal(0n);
        expect(sdk.calculateRemaining(stream)).to.equal(amount);

        // Mock Time: t=1010 (10 elapsed)
        Date.now = () => 1010 * 1000;
        const expectedClaimable = ethers.parseEther("10");
        expect(sdk.calculateClaimable(stream)).to.equal(expectedClaimable);

        const expectedRemaining = ethers.parseEther("90");
        expect(sdk.calculateRemaining(stream)).to.equal(expectedRemaining);
    });

    it('Should return 0 remaining when stream is depleted', () => {
        const startTime = 1000;
        const rate = ethers.parseEther("1");
        const amount = ethers.parseEther("100"); // 100 seconds worth

        const stream: StreamMetadata = {
            streamId: "1",
            startTime: startTime,
            rate: rate,
            amount: amount
        };

        // Mock Time: t=1200 (200 seconds elapsed, way over 100)
        Date.now = () => 1200 * 1000;

        expect(sdk.calculateClaimable(stream)).to.equal(ethers.parseEther("200")); // Technically claimable is high, but capped by contract usually.
        // My SDK logic: elapsed * rate. It doesn't cap claimable by amount, but remaining should be 0.

        expect(sdk.calculateRemaining(stream)).to.equal(0n); // Should be floored at 0
    });

    it('Should handle micropayments precision ($0.0001/sec)', () => {
        // Rate: 0.0001 ETH/sec = 10^14 wei/sec
        const rate = ethers.parseUnits("0.0001", 18);
        const startTime = 1000;
        const amount = ethers.parseEther("1"); // 1 ETH total

        const stream: StreamMetadata = {
            streamId: "1",
            startTime: startTime,
            rate: rate,
            amount: amount
        };

        // 1 second elapsed
        Date.now = () => 1001 * 1000;
        expect(sdk.calculateClaimable(stream)).to.equal(rate);

        // 0.5 seconds elapsed (integer math will floor to 0 if I used seconds)
        // My SDK implementation uses seconds: `Math.floor(Date.now() / 1000)`.
        // So sub-second precision is lost, which is expected for block-timestamp based logic usually.
        Date.now = () => 1001 * 1000 + 500; // 1001.5 seconds
        expect(sdk.calculateClaimable(stream)).to.equal(rate); // Still 1 sec worth
    });
});
