import { FlowPaySDK } from '../sdk/src/FlowPaySDK';
import { Wallet, ethers } from 'ethers';

// Demo Consumer: "The Application"
// Automatically negotiates payments.

async function runDemo() {
    console.log("🚀 Starting FlowPay Demo Consumer...");

    // 1. Initialize SDK
    const sdk = new FlowPaySDK({
        privateKey: Wallet.createRandom().privateKey,
        rpcUrl: 'http://localhost:8545',
        agentId: 'Demo-Consumer-Agent',
        spendingLimits: {
            dailyLimit: ethers.parseEther("100"),
            totalLimit: ethers.parseEther("1000")
        }
    });

    // Mock SDK internals for pure demo (no blockchain required)
    (sdk as any).createStream = async (contract: string, token: string, amount: bigint, duration: number) => {
        console.log(`[SDK Mock] 📝 Signing Transaction: CreateStream(${ethers.formatEther(amount)} MNEE)`);
        await new Promise(r => setTimeout(r, 500)); // Simulate delay
        return {
            streamId: "1337",
            startTime: BigInt(Math.floor(Date.now() / 1000))
        };
    };

    const TARGET_URL = 'http://localhost:3005/api/premium';

    // 2. Scenario: Multi-Step Interaction
    console.log(`\n--- [Step 1] Blind Request to ${TARGET_URL} ---`);
    try {
        await sdk.makeRequest(TARGET_URL);
        // This handles the 402 -> Negotiate -> Pay -> Retry loop internally!
        console.log("✅ REQUEST SUCCESS (Handled automatically)");
    } catch (e: any) {
        console.error("❌ Request Failed:", e.message);
    }

    // 3. Scenario: Continued Usage (Efficiency)
    console.log(`\n--- [Step 2] Subsequent Requests (Stream Reuse) ---`);
    console.log("Sending 5 rapid requests...");

    // reset metrics counter to track just this batch if we wanted, but let's just see total
    const startMetrics = { ...sdk.getMetrics() };

    for (let i = 0; i < 5; i++) {
        await sdk.makeRequest(TARGET_URL);
        process.stdout.write("."); // Progress dot
    }
    console.log("\n✅ All 5 requests succeeded.");

    // 4. Report
    const endMetrics = sdk.getMetrics();
    console.log(`\n📊 Efficiency Report:`);
    console.log(`   Total Requests: ${endMetrics.requestsSent}`);
    console.log(`   Signatures:     ${endMetrics.signersTriggered}`);

    const reuse = endMetrics.requestsSent - endMetrics.signersTriggered;
    console.log(`   ⚡ Transactions Saved: ${reuse} (Optimization!)`);
}

// Run
if (require.main === module) {
    runDemo().catch(console.error);
}

export default runDemo;
