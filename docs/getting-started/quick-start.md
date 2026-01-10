# Quick Start

Get FlowPay running in under 5 minutes.

## Step 1: Connect Your Wallet

1. Open the FlowPay dashboard
2. Click "Connect Wallet"
3. Select MetaMask and approve the connection
4. Ensure you're on Sepolia testnet

## Step 2: Get Test Tokens

You need MNEE tokens to create streams:

1. Navigate to the "Streams" tab
2. Click "Mint 1000 MNEE" button
3. Approve the transaction in MetaMask
4. Wait for confirmation

## Step 3: Create Your First Stream

```javascript
// Using the SDK
import { FlowPaySDK } from './sdk/src/FlowPaySDK';

const sdk = new FlowPaySDK({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: 'https://rpc.sepolia.org',
  contractAddress: '0x155A00fBE3D290a8935ca4Bf5244283685Bb0035',
  mneeAddress: '0x96B1FE54Ee89811f46ecE4a347950E0D682D3896'
});

// Create a stream
const streamId = await sdk.createStream({
  recipient: '0x...provider_address',
  amount: '10', // 10 MNEE
  duration: 3600, // 1 hour
  metadata: JSON.stringify({ purpose: 'API access' })
});

console.log(`Stream created: #${streamId}`);
```

## Step 4: Make API Requests

Once your stream is active, make requests to x402-enabled APIs:

```javascript
// The SDK handles x402 negotiation automatically
const response = await sdk.request('https://api.provider.com/premium', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
});

// First request: SDK detects 402, creates stream, retries
// Subsequent requests: Use existing stream (no new signatures!)
```

## Step 5: Monitor Your Stream

View your active streams in the dashboard:

1. Go to "Streams" tab
2. See "Outgoing Streams" section
3. Monitor flow rate and remaining balance
4. Cancel anytime to reclaim unused funds

## Using the Dashboard

### Create Stream via UI

1. Enter recipient address
2. Set amount (in MNEE)
3. Set duration (in seconds)
4. Click "Create Stream"
5. Approve token allowance (first time only)
6. Confirm stream creation

### Withdraw Funds

If you're receiving a stream:

1. Go to "Incoming Streams"
2. Click "Withdraw" on any active stream
3. Confirm the transaction
4. Funds are transferred to your wallet

## Example: Complete Flow

```javascript
// 1. Initialize SDK
const sdk = new FlowPaySDK(config);

// 2. Check if stream exists for provider
const existingStream = await sdk.getActiveStream(providerAddress);

if (!existingStream) {
  // 3. Create new stream
  await sdk.createStream({
    recipient: providerAddress,
    amount: '100',
    duration: 86400 // 24 hours
  });
}

// 4. Make requests (stream ID attached automatically)
for (let i = 0; i < 100; i++) {
  const data = await sdk.request(`${providerUrl}/api/data`);
  console.log(`Request ${i + 1}:`, data);
}

// 5. Close stream when done (optional - reclaim unused funds)
await sdk.cancelStream(streamId);
```

## What's Next?

- [Configuration Options](configuration.md)
- [Architecture Deep Dive](../architecture/README.md)
- [Building AI Agents](../guides/building-ai-agents.md)
