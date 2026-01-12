# FlowPay Demo Script

**Title**: FlowPay - Real-Time MNEE Payment Streaming for AI Agents
**Network**: Sepolia Testnet (Real Blockchain Transactions)

---

## Prerequisites

1. **Environment Setup**: Ensure `.env` has:
   ```
   PRIVATE_KEY_1=your_private_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   cd sdk && npm install && cd ..
   ```

3. **Get Test MNEE Tokens**: The demo will auto-mint if balance is low, or use the frontend at `http://localhost:5173` to mint tokens.

---

## Running the Demo

### Step 1: Start the Provider (Terminal 1)

```bash
npx ts-node demo/provider.ts
```

**Expected Output**:
```
🔧 Provider Configuration:
   FlowPayStream Contract: 0x155A00fBE3D290a8935ca4Bf5244283685Bb0035
   MNEE Token: 0x96B1FE54Ee89811f46ecE4a347950E0D682D3896
   RPC URL: https://rpc.sepolia.org

🚀 FlowPay Demo Provider running on http://localhost:3005

📋 Available Endpoints:
   GET /health          - Health check (free)
   GET /api/info        - API info (free)
   GET /api/premium     - Premium content (0.0001 MNEE/sec)
   GET /api/ai-insight  - AI insights (0.001 MNEE/sec)
```

The provider is now a "gatekeeper" that requires MNEE payment streams for premium content.

---

### Step 2: Run the Consumer Agent (Terminal 2)

```bash
npx ts-node demo/consumer.ts
```

**What Happens (Real Blockchain)**:

1. **Wallet Connection**: Agent connects to Sepolia with `PRIVATE_KEY_1`
2. **Balance Check**: Verifies MNEE balance, mints if needed
3. **x402 Flow**:
   - Agent requests `/api/premium`
   - Provider returns `402 Payment Required` with requirements
   - SDK reads payment headers (rate, contract address, token)
   - Gemini AI decides: stream vs direct payment
   - SDK approves MNEE tokens on-chain
   - SDK creates payment stream on-chain
   - SDK retries request with stream ID
   - Provider validates stream and returns content
4. **Stream Reuse**: Subsequent requests reuse the same stream (no new transactions!)

**Expected Output**:
```
🚀 Starting FlowPay Demo Consumer (Real Blockchain Mode)...

📡 Connecting to Sepolia testnet...
✅ Agent Wallet: 0x...

--- Checking MNEE Balance ---
💰 Current MNEE Balance: 100.0 MNEE

--- [Step 1] Making Request to http://localhost:3005/api/premium ---
[FlowPaySDK] 402 Payment Required intercepted. Negotiating...
[FlowPaySDK] 🤖 Gemini Analysis: High request volume expected, streaming is more efficient
[FlowPaySDK] Initiating Stream: 0.36 MNEE for 3600s
[FlowPaySDK] Approving MNEE...
[FlowPaySDK] Approved.
[FlowPaySDK] Creating stream to 0x96B1FE54Ee89811f46ecE4a347950E0D682D3896...
[FlowPaySDK] Stream #X created. Retrying request...
✅ REQUEST SUCCESS!
📦 Response: { "success": true, "data": "🌟 This is PREMIUM content..." }

--- [Step 2] Subsequent Requests (Stream Reuse) ---
✅ Request 1: Success (Stream reused - no new transaction!)
✅ Request 2: Success (Stream reused - no new transaction!)
✅ Request 3: Success (Stream reused - no new transaction!)

📊 Efficiency Report:
   Total Requests Made: 4
   Blockchain Transactions: 1
   ⚡ Transactions Saved: 3

💰 Final MNEE Balance: 99.64 MNEE
   Spent: 0.36 MNEE

🎉 Demo Complete!
```

---

## Key Concepts Demonstrated

### 1. x402 Protocol
The provider returns HTTP 402 with payment requirements in headers:
- `X-FlowPay-Mode: streaming`
- `X-FlowPay-Rate: 0.0001` (MNEE per second)
- `X-FlowPay-Contract: 0x155A00fBE3D290a8935ca4Bf5244283685Bb0035`
- `X-MNEE-Address: 0x96B1FE54Ee89811f46ecE4a347950E0D682D3896`

### 2. AI-Powered Payment Decisions
The Gemini AI brain analyzes:
- Expected request volume
- Gas costs vs streaming costs
- Decides optimal payment mode (stream vs direct)

### 3. Stream Efficiency
- **Problem**: Per-request payments = N transactions for N requests
- **Solution**: One stream transaction serves unlimited requests
- **Result**: Massive gas savings for high-frequency API access

### 4. Real Blockchain Transactions
All transactions are real and verifiable on Sepolia:
- View on Etherscan: `https://sepolia.etherscan.io/address/YOUR_WALLET`
- Contract: `https://sepolia.etherscan.io/address/0x155A00fBE3D290a8935ca4Bf5244283685Bb0035`

---

## Contract Addresses (Sepolia)

| Contract | Address |
|----------|---------|
| FlowPayStream | `0x155A00fBE3D290a8935ca4Bf5244283685Bb0035` |
| MockMNEE | `0x96B1FE54Ee89811f46ecE4a347950E0D682D3896` |

---

## Troubleshooting

**"PRIVATE_KEY_1 not found"**: Add your private key to `.env`

**"Connection refused"**: Make sure provider is running first

**"Insufficient MNEE balance"**: The demo auto-mints, or use the frontend to mint

**"Transaction failed"**: Check you have Sepolia ETH for gas (get from faucet)

---

## Frontend Dashboard

For a visual experience, run the frontend:
```bash
cd vite-project && npm run dev
```

Then open `http://localhost:5173` to:
- View live stream balances
- Create/cancel streams manually
- Monitor AI agent activity
