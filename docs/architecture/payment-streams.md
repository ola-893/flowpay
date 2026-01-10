# Payment Streams

Payment streams are the core innovation of FlowPay.

## What is a Payment Stream?

A payment stream is a continuous flow of MNEE tokens from sender to recipient over time. Instead of discrete payments, funds "stream" at a constant rate.

## How Streams Work

```
Time ─────────────────────────────────────────▶

     Start                                  Stop
       │                                      │
       ▼                                      ▼
       ┌──────────────────────────────────────┐
       │████████████████████░░░░░░░░░░░░░░░░░░│
       │◀── Streamed ──▶│◀── Remaining ──▶│
       └──────────────────────────────────────┘
                        ▲
                      Now
```

## Stream Lifecycle

### 1. Creation

```javascript
await contract.createStream(
  recipient,    // Who receives funds
  duration,     // How long (seconds)
  amount,       // Total MNEE
  metadata      // JSON metadata
);
```

At creation:
- Tokens transferred from sender to contract
- Stream starts immediately
- Flow rate calculated: `amount / duration`

### 2. Active Streaming

While active:
- Funds accumulate for recipient
- Claimable balance increases per second
- Recipient can withdraw anytime
- Sender can cancel anytime

### 3. Withdrawal

```javascript
await contract.withdrawFromStream(streamId);
```

- Recipient claims accumulated funds
- Tokens transferred from contract to recipient
- Stream continues (if not expired)

### 4. Completion or Cancellation

**Natural Completion:**
- Stream reaches stop time
- All funds claimable by recipient
- Stream marked inactive

**Cancellation:**
- Either party can cancel
- Recipient gets streamed amount
- Sender gets remaining amount

## Flow Rate Calculation

```
flowRate = totalAmount / duration
```

**Example:**
- Amount: 3600 MNEE
- Duration: 3600 seconds (1 hour)
- Flow Rate: 1 MNEE/second

**Claimable at any time:**
```
elapsed = min(now, stopTime) - startTime
streamed = elapsed × flowRate
claimable = streamed - alreadyWithdrawn
```

## Stream States

| State | isActive | Description |
|-------|----------|-------------|
| Active | true | Funds streaming |
| Completed | false | Reached stop time |
| Cancelled | false | Manually cancelled |

## Benefits Over Direct Payments

| Aspect | Direct Payment | Stream Payment |
|--------|---------------|----------------|
| Signatures | 1 per request | 2 total |
| Gas cost | High (N × gas) | Low (2 × gas) |
| Latency | Wait for tx | Instant (after open) |
| Flexibility | None | Cancel anytime |
| Overpayment | Possible | Refundable |

## Use Cases

### API Access

```javascript
// Create stream for 24 hours of API access
await sdk.createStream({
  recipient: apiProvider,
  amount: '100', // 100 MNEE
  duration: 86400 // 24 hours
});

// Make unlimited requests
for (let i = 0; i < 1000; i++) {
  await sdk.request(apiUrl);
}
```

### Subscription Services

```javascript
// Monthly subscription stream
await sdk.createStream({
  recipient: serviceProvider,
  amount: '30', // 30 MNEE
  duration: 2592000 // 30 days
});
```

### Pay-per-Use

```javascript
// Short stream for specific task
await sdk.createStream({
  recipient: computeProvider,
  amount: '5',
  duration: 300 // 5 minutes
});
```

## Best Practices

### For Consumers

1. **Buffer Time**: Create streams slightly longer than needed
2. **Monitor Balance**: Watch for low balance warnings
3. **Reuse Streams**: Check for existing streams before creating new ones
4. **Cancel Unused**: Reclaim funds from unused streams

### For Providers

1. **Verify On-Chain**: Always verify stream validity
2. **Check Balance**: Ensure sufficient claimable balance
3. **Withdraw Regularly**: Don't let funds accumulate too long
4. **Handle Expiry**: Gracefully handle expired streams

## Security Considerations

1. **Locked Funds**: Tokens are locked in contract, not held by either party
2. **No Rug Pull**: Sender can't withdraw recipient's earned funds
3. **Guaranteed Payment**: Recipient always gets streamed amount
4. **Refund Guarantee**: Sender always gets unstreamed amount back
