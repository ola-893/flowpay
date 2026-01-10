# SDK Reference

The FlowPay SDK enables AI agents to make streaming payments.

## Installation

```bash
cd sdk
npm install
```

## Quick Start

```typescript
import { FlowPaySDK } from './FlowPaySDK';

const sdk = new FlowPaySDK({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: 'https://rpc.sepolia.org',
  contractAddress: '0x155A00fBE3D290a8935ca4Bf5244283685Bb0035',
  mneeAddress: '0x96B1FE54Ee89811f46ecE4a347950E0D682D3896'
});

// Make a request - SDK handles x402 automatically
const response = await sdk.request('https://api.provider.com/premium');
```

## Components

| Component | Description |
|-----------|-------------|
| [FlowPaySDK](flowpay-sdk.md) | Main SDK class |
| [GeminiPaymentBrain](gemini-payment-brain.md) | AI decision engine |
| [SpendingMonitor](spending-monitor.md) | Safety controls |
| [FlowPayProxy](flowpay-proxy.md) | Multi-agent support |

## Architecture

```
┌─────────────────────────────────────────┐
│              FlowPaySDK                  │
├─────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────┐   │
│  │   Request   │  │  Stream Manager │   │
│  │   Handler   │  │                 │   │
│  └─────────────┘  └─────────────────┘   │
│         │                 │             │
│         ▼                 ▼             │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │   x402      │  │   Contract      │   │
│  │   Parser    │  │   Interface     │   │
│  └─────────────┘  └─────────────────┘   │
│         │                 │             │
│         ▼                 ▼             │
│  ┌─────────────────────────────────┐    │
│  │      GeminiPaymentBrain         │    │
│  │      (Decision Engine)          │    │
│  └─────────────────────────────────┘    │
│                   │                     │
│                   ▼                     │
│  ┌─────────────────────────────────┐    │
│  │       SpendingMonitor           │    │
│  │       (Safety Controls)         │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## Features

- ✅ Automatic x402 negotiation
- ✅ Stream creation and management
- ✅ AI-powered payment decisions
- ✅ Spending limits and safety controls
- ✅ Multi-agent mesh support
- ✅ TypeScript support

## Next Steps

- [FlowPaySDK Reference](flowpay-sdk.md)
- [Building AI Agents](../guides/building-ai-agents.md)
