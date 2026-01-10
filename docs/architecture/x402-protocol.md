# x402 Protocol

FlowPay implements the x402 protocol for HTTP-based payment negotiation.

## Overview

The x402 protocol uses HTTP 402 (Payment Required) status code to negotiate payments between consumers and providers.

## Protocol Flow

```
┌──────────┐                    ┌──────────┐
│ Consumer │                    │ Provider │
└────┬─────┘                    └────┬─────┘
     │                               │
     │  1. GET /api/resource         │
     │──────────────────────────────▶│
     │                               │
     │  2. 402 Payment Required      │
     │     + x402 Headers            │
     │◀──────────────────────────────│
     │                               │
     │  3. Process Payment           │
     │  (Create Stream)              │
     │                               │
     │  4. GET /api/resource         │
     │     + Payment Proof           │
     │──────────────────────────────▶│
     │                               │
     │  5. 200 OK + Data             │
     │◀──────────────────────────────│
     │                               │
```

## x402 Headers

### Response Headers (402)

When a provider requires payment, it returns:

```http
HTTP/1.1 402 Payment Required
X-Payment-Required: true
X-Payment-Types: stream,direct
X-Payment-Amount: 0.001
X-Payment-Currency: MNEE
X-Payment-Recipient: 0x1234...
X-Payment-Contract: 0x155A00fBE3D290a8935ca4Bf5244283685Bb0035
X-Payment-Network: sepolia
X-Payment-Description: Premium API access
```

### Request Headers (With Payment)

When consumer has payment proof:

```http
GET /api/resource HTTP/1.1
X-FlowPay-Stream-ID: 42
X-FlowPay-Signature: 0xabc...
X-FlowPay-Timestamp: 1704067200
```

## Header Reference

### Payment Requirement Headers

| Header | Required | Description |
|--------|----------|-------------|
| `X-Payment-Required` | Yes | Indicates payment is needed |
| `X-Payment-Types` | Yes | Accepted payment types |
| `X-Payment-Amount` | Yes | Price per request |
| `X-Payment-Currency` | Yes | Token symbol (MNEE) |
| `X-Payment-Recipient` | Yes | Provider's address |
| `X-Payment-Contract` | Yes | MorphStream contract |
| `X-Payment-Network` | Yes | Network name |
| `X-Payment-Description` | No | Human-readable description |
| `X-Payment-Min-Duration` | No | Minimum stream duration |
| `X-Payment-Expires` | No | Offer expiration time |

### Payment Proof Headers

| Header | Required | Description |
|--------|----------|-------------|
| `X-FlowPay-Stream-ID` | Yes* | Active stream ID |
| `X-FlowPay-Payment-Hash` | Yes* | Direct payment tx hash |
| `X-FlowPay-Signature` | No | Request signature |
| `X-FlowPay-Timestamp` | No | Request timestamp |

*One of Stream-ID or Payment-Hash required

## Payment Types

### Stream Payment

Continuous payment flow:

```javascript
// Consumer creates stream
const streamId = await contract.createStream(
  recipient,
  duration,
  amount,
  metadata
);

// Consumer includes stream ID in requests
headers['X-FlowPay-Stream-ID'] = streamId;
```

### Direct Payment (Future)

One-time payment:

```javascript
// Consumer sends direct payment
const tx = await mnee.transfer(recipient, amount);

// Consumer includes tx hash
headers['X-FlowPay-Payment-Hash'] = tx.hash;
```

## Verification

### Provider Verification Flow

```javascript
async function verifyPayment(req) {
  const streamId = req.headers['x-flowpay-stream-id'];
  
  if (streamId) {
    // Verify stream on-chain
    const stream = await contract.streams(streamId);
    
    // Check stream is active
    if (!stream.isActive) {
      return { valid: false, reason: 'Stream inactive' };
    }
    
    // Check recipient matches
    if (stream.recipient !== myAddress) {
      return { valid: false, reason: 'Wrong recipient' };
    }
    
    // Check sufficient balance
    const claimable = await contract.getClaimableBalance(streamId);
    if (claimable < pricePerRequest) {
      return { valid: false, reason: 'Insufficient balance' };
    }
    
    return { valid: true, streamId };
  }
  
  return { valid: false, reason: 'No payment proof' };
}
```

## Error Responses

### 402 Payment Required

```json
{
  "error": "Payment Required",
  "code": "PAYMENT_REQUIRED",
  "payment": {
    "types": ["stream", "direct"],
    "amount": "0.001",
    "currency": "MNEE",
    "recipient": "0x...",
    "contract": "0x..."
  }
}
```

### 403 Payment Invalid

```json
{
  "error": "Payment Invalid",
  "code": "INVALID_STREAM",
  "reason": "Stream has expired"
}
```

## Best Practices

### For Consumers

1. Cache stream IDs for reuse
2. Monitor stream balance
3. Create streams with buffer time
4. Handle 402 gracefully

### For Providers

1. Cache verification results
2. Set reasonable prices
3. Provide clear error messages
4. Support multiple payment types

## Next Steps

- [Payment Streams](payment-streams.md)
- [Middleware Reference](../api/middleware.md)
