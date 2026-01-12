# Architecture Overview

FlowPay is designed as a modular, extensible payment protocol for AI agents.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FlowPay System                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Consumer   │───▶│   Provider   │───▶│  Blockchain  │          │
│  │   Agent      │    │   (x402)     │    │  (Sepolia)   │          │
│  │   + SDK      │◀───│              │◀───│              │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│         │                   │                   │                   │
│         │                   │                   │                   │
│         ▼                   ▼                   ▼                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Gemini     │    │  Dashboard   │    │ FlowPayStream│          │
│  │   AI Brain   │    │   (React)    │    │  + MockMNEE  │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Consumer Agent (SDK)

The FlowPaySDK enables AI agents to:
- Detect x402 payment requirements
- Create and manage payment streams
- Make authenticated requests
- Handle payment negotiation automatically

### 2. Provider (Middleware)

The x402 middleware enables API providers to:
- Return 402 Payment Required responses
- Verify stream validity on-chain
- Grant access to paid resources
- Track usage and revenue

### 3. Smart Contracts

On-chain components:
- **FlowPayStream**: Payment streaming contract
- **MockMNEE**: Test ERC-20 token

### 4. AI Decision Engine

GeminiPaymentBrain provides:
- Intelligent payment mode selection
- Cost optimization
- Risk assessment

## Data Flow

### Request Flow (First Request)

```
1. Agent → Provider: GET /api/premium
2. Provider → Agent: 402 Payment Required + x402 headers
3. Agent → AI Brain: Should I stream or pay directly?
4. AI Brain → Agent: Stream (high volume predicted)
5. Agent → Blockchain: Create stream
6. Agent → Provider: GET /api/premium + X-FlowPay-Stream-ID
7. Provider → Blockchain: Verify stream
8. Provider → Agent: 200 OK + data
```

### Request Flow (Subsequent Requests)

```
1. Agent → Provider: GET /api/premium + X-FlowPay-Stream-ID
2. Provider → Cache: Check stream validity
3. Provider → Agent: 200 OK + data
```

## Key Design Decisions

### Why Streaming?

| Problem | Traditional | FlowPay |
|---------|-------------|---------|
| 100 API calls | 100 signatures | 2 signatures |
| Gas cost | ~$50 | ~$1 |
| Latency | High (wait for tx) | Low (stream exists) |
| UX | Blocking | Non-blocking |

### Why x402?

The HTTP 402 status code was reserved for "Payment Required" but never standardized. FlowPay implements a practical x402 protocol:

- Standard HTTP semantics
- Machine-readable payment requirements
- Backward compatible
- Extensible

### Why MNEE?

MNEE (Mock Native Electronic Economy) is used as the payment token:
- Stable value representation
- ERC-20 compatible
- Easy to integrate
- Testnet version available

## Security Model

### Trust Assumptions

1. **Blockchain**: Trustless verification
2. **Provider**: Trusted to deliver service
3. **Consumer**: Trusted with own funds
4. **AI Brain**: Advisory only, human override available

### Safety Controls

- Spending limits (daily, per-request)
- Emergency stop mechanism
- Stream cancellation
- On-chain verification

## Scalability

### Current Limits

| Metric | Limit |
|--------|-------|
| Streams per agent | Unlimited |
| Requests per stream | Unlimited |
| Concurrent streams | Limited by gas |

### Future Improvements

- L2 deployment (lower gas)
- Batch stream creation
- Off-chain verification with ZK proofs

## Next Steps

- [x402 Protocol Details](x402-protocol.md)
- [Payment Streams](payment-streams.md)
- [AI Decision Engine](ai-decision-engine.md)
