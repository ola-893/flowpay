# Frequently Asked Questions

## General

### What is FlowPay?

FlowPay is a payment streaming protocol that enables AI agents to pay for API services using continuous MNEE token streams instead of individual transactions.

### What problem does FlowPay solve?

FlowPay solves the **N+1 Signature Problem**: traditionally, N API requests require N payment signatures. FlowPay reduces this to just 2 signatures (open stream + close stream) regardless of request volume.

### What is the x402 protocol?

x402 is a protocol for HTTP-based payment negotiation using the 402 (Payment Required) status code. It allows servers to request payment and clients to provide payment proof in a standardized way.

## Technical

### Which networks are supported?

Currently, FlowPay is deployed on Ethereum Sepolia testnet. Mainnet deployment is planned.

### What token does FlowPay use?

FlowPay uses MNEE (Mock Native Electronic Economy) tokens. On testnet, you can mint free test tokens.

### How is the flow rate calculated?

```
flowRate = totalAmount / duration
```

For example, 3600 MNEE over 1 hour = 1 MNEE per second.

### Can I cancel a stream?

Yes, both the sender and recipient can cancel a stream at any time. The recipient receives the streamed amount, and the sender receives the remaining balance.

### What happens when a stream expires?

When a stream reaches its stop time, no more funds flow. The recipient can still withdraw any unclaimed balance.

## Usage

### How do I get test MNEE tokens?

1. Connect your wallet to the FlowPay dashboard
2. Go to the "Streams" tab
3. Click "Mint 1000 MNEE"
4. Confirm the transaction

### How do I create a stream?

**Via Dashboard:**
1. Go to "Streams" tab
2. Enter recipient address, amount, and duration
3. Click "Create Stream"
4. Approve token allowance (first time)
5. Confirm stream creation

**Via SDK:**
```typescript
const streamId = await sdk.createStream({
  recipient: '0x...',
  amount: '10',
  duration: 3600
});
```

### How do I withdraw from a stream?

Only the recipient can withdraw:

```typescript
await sdk.withdrawFromStream(streamId);
```

Or use the dashboard's "Withdraw" button.

### How do I integrate FlowPay as a provider?

Use the x402 middleware:

```javascript
const { flowPayMiddleware } = require('./middleware/flowPayMiddleware');

app.use('/api/premium', flowPayMiddleware({
  pricePerRequest: '0.001',
  recipientAddress: '0x...'
}));
```

## Troubleshooting

### "Insufficient funds for gas"

You need Sepolia ETH for gas fees. Get free testnet ETH from:
- https://sepoliafaucet.com
- https://faucet.sepolia.dev

### "MNEE transfer failed"

1. Check you have enough MNEE balance
2. Ensure you've approved the FlowPayStream contract to spend your tokens
3. Verify the contract addresses are correct

### "Stream is not active"

The stream may have:
- Expired (reached stop time)
- Been cancelled
- Never existed

Check the stream status on the dashboard or via `sdk.getStream(streamId)`.

### "Caller is not the recipient"

Only the stream recipient can withdraw funds. Make sure you're using the correct wallet.

## Security

### Is FlowPay audited?

FlowPay is currently in testnet phase. A security audit is planned before mainnet deployment.

### What are the spending limits?

The SDK includes a SpendingMonitor with configurable limits:
- Daily spending limit
- Per-request limit
- Emergency stop threshold

### Can I lose funds?

Funds in a stream are locked in the smart contract. You can always:
- Withdraw streamed funds (as recipient)
- Cancel and reclaim remaining funds (as sender)

## Integration

### Does FlowPay work with any AI framework?

Yes, FlowPay is framework-agnostic. It works with:
- LangChain
- AutoGPT
- Custom agents
- Any HTTP client

### Can multiple agents share a stream?

Not directly. Each agent should create its own streams. However, the FlowPayProxy component enables multi-agent coordination.

### What's the minimum stream amount?

The minimum depends on duration. The flow rate must be at least 1 wei per second:
```
minAmount = duration (in seconds)
```

For a 1-hour stream, minimum is 3600 wei (very small).
