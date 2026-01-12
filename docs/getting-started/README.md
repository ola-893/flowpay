# Getting Started

Welcome to FlowPay! This section will help you get up and running quickly.

## What You'll Learn

1. **Installation** - Set up FlowPay in your project
2. **Quick Start** - Create your first payment stream
3. **Configuration** - Customize FlowPay for your needs

## Prerequisites

Before you begin, ensure you have:

- Node.js v18 or higher
- npm or yarn package manager
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH (for gas fees)
- Basic understanding of Ethereum and smart contracts

## System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | v18.0.0 | v20.0.0+ |
| RAM | 4GB | 8GB+ |
| Storage | 500MB | 1GB+ |

## Architecture Overview

FlowPay consists of three main components:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Consumer      │────▶│    Provider     │────▶│   Blockchain    │
│   (AI Agent)    │◀────│   (x402 API)    │◀────│   (Sepolia)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
   FlowPaySDK            Middleware              FlowPayStream
   GeminiAI              Verification            MockMNEE
```

## Next Steps

- [Installation Guide](installation.md)
- [Quick Start Tutorial](quick-start.md)
- [Configuration Options](configuration.md)
