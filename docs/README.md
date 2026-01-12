# FlowPay Documentation

Welcome to FlowPay - **The Streaming Extension for x402**.

FlowPay is a hybrid payment protocol that solves the N+1 Signature Problem for AI agent payments using MNEE token streams on Ethereum.

## What is FlowPay?

FlowPay enables AI agents to pay for API services using continuous payment streams instead of individual transactions. This dramatically reduces gas costs and improves efficiency.

### Key Innovation

**2 on-chain transactions** (Open + Close) regardless of request volume.

| Traditional Approach | FlowPay Approach |
|---------------------|------------------|
| 100 requests = 100 signatures | 100 requests = 2 signatures |
| High gas costs | 95% gas savings |
| Slow, blocking | Fast, non-blocking |

## Quick Links

- [Getting Started](getting-started/README.md)
- [Architecture](architecture/README.md)
- [Smart Contracts](contracts/README.md)
- [SDK Reference](sdk/README.md)
- [API Reference](api/README.md)
- [Deployment Guide](deployment/README.md)

## Current Deployment (Sepolia Testnet)

| Contract | Address |
|----------|---------|
| MockMNEE | `0x96B1FE54Ee89811f46ecE4a347950E0D682D3896` |
| FlowPayStream | `0x155A00fBE3D290a8935ca4Bf5244283685Bb0035` |

## Features

- ✅ **x402 Protocol Support** - Standard HTTP payment negotiation
- ✅ **MNEE Token Streams** - Continuous payment flows
- ✅ **AI-Powered Decisions** - Gemini AI chooses optimal payment mode
- ✅ **Multi-Agent Support** - Mesh network for agent collaboration
- ✅ **Safety Controls** - Spending limits and emergency stops
- ✅ **Real-time Dashboard** - Monitor streams and analytics

## Community

- [GitHub Repository](https://github.com/your-org/flowpay)
- [Discord Community](https://discord.gg/flowpay)
- [Twitter](https://twitter.com/flowpay)
