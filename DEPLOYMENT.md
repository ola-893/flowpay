# FlowPay Deployment Guide

## Overview

FlowPay is "The Streaming Extension for x402" - a hybrid payment protocol that solves the N+1 Signature Problem for AI agent payments. This guide covers deployment to Ethereum Sepolia testnet.

**Key Innovation**: 2 on-chain transactions (Open + Close) regardless of request volume.

## Prerequisites

- Node.js v18+
- npm or yarn
- MetaMask or compatible wallet
- Sepolia testnet ETH (for gas fees)
- Environment variables configured

## Environment Setup

Create a `.env` file in the project root:

```bash
# Required
PRIVATE_KEY=0x...                    # Deployer wallet private key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Optional
ETHERSCAN_API_KEY=...                # For contract verification
GEMINI_API_KEY=...                   # For AI features

# Frontend (vite-project/.env)
VITE_CONTRACT_ADDRESS=0x...          # FlowPayStream contract address (after deployment)
VITE_MNEE_TOKEN_ADDRESS=0x...        # MockMNEE address (after deployment)
VITE_MNEE_TOKEN_ADDRESS=0x...        # MockMNEE address (after deployment)
```

## Quick Start

### 1. Install Dependencies

```bash
# Root project
npm install

# SDK
cd sdk && npm install && cd ..

# Server
cd server && npm install && cd ..

# Frontend
cd vite-project && npm install && cd ..
```

### 2. Deploy Contracts to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**Expected Output:**
```
Deploying contracts with the account: 0x...
Deploying MockMNEE...
MockMNEE deployed to: 0x96B1FE54Ee89811f46ecE4a347950E0D682D3896
Deploying FlowPayStream with MNEE address: 0x96B1FE54Ee89811f46ecE4a347950E0D682D3896
FlowPayStream deployed to: 0x155A00fBE3D290a8935ca4Bf5244283685Bb0035
```

**Current Sepolia Deployment (January 2026):**
| Contract | Address |
|----------|---------|
| MockMNEE | `0x96B1FE54Ee89811f46ecE4a347950E0D682D3896` |
| FlowPayStream | `0x155A00fBE3D290a8935ca4Bf5244283685Bb0035` |

**Save these addresses!** You'll need them for configuration.

### 3. Update Configuration

After deployment, update these files:

**`vite-project/.env`:**
```bash
VITE_CONTRACT_ADDRESS=0x5678...      # FlowPayStream address
VITE_MNEE_TOKEN_ADDRESS=0x1234...    # MockMNEE address
```

**`server/index.js`** (if running standalone):
```javascript
const MNEE_ADDRESS = "0x1234...";
const CONTRACT_ADDRESS = "0x5678...";
```

### 4. Verify Contracts (Optional)

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <MNEE_ADDRESS>
```

## Running the System

### Development Mode

**Terminal 1 - Provider Server (The Gatekeeper):**
```bash
cd server
npm start
```

**Terminal 2 - Frontend Dashboard:**
```bash
cd vite-project
npm run dev
```

**Terminal 3 - Demo Consumer Agent:**
```bash
npx ts-node demo/consumer.ts
```

### Production Mode

**Build Frontend:**
```bash
cd vite-project
npm run build
```

**Start Server:**
```bash
cd server
NODE_ENV=production npm start
```

## Running Tests

### All SDK Tests (41 tests)
```bash
cd sdk
npx mocha -r ts-node/register test/*.test.ts
```

### Smart Contract Tests (6 tests)
```bash
npx hardhat test test/FlowPayStream.test.js
```

### Integration Tests Only
```bash
cd sdk
npx mocha -r ts-node/register test/integration.test.ts
```

**Expected Results:**
- SDK Tests: 41 passing
- Contract Tests: 6 passing
- Integration Tests: 12 passing

## Demo Scenarios

### Scenario 1: Complete x402 Handshake

```bash
# Terminal 1: Start Provider
npx ts-node demo/provider.ts

# Terminal 2: Run Consumer
npx ts-node demo/consumer.ts
```

**Expected Flow:**
1. Consumer makes blind request to `/api/premium`
2. Provider returns HTTP 402 with x402 headers
3. SDK parses payment requirements
4. Gemini AI decides: streaming vs direct payment
5. SDK creates stream (1 signature)
6. SDK retries request with `X-FlowPay-Stream-ID`
7. Provider verifies stream, returns 200 OK
8. Subsequent requests use same stream (0 signatures)

### Scenario 2: Efficiency Demonstration

```bash
cd sdk
npx mocha -r ts-node/register test/load.test.ts
```

**Validates:**
- 10+ requests with only 1 signature
- Stream reuse for concurrent requests
- N+1 problem is solved

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FlowPay System                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Consumer  │───▶│  Provider   │───▶│  Ethereum   │     │
│  │   Agent     │    │  (x402 MW)  │    │  Sepolia    │     │
│  │   + SDK     │◀───│             │◀───│             │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│        │                  │                  │              │
│        │                  │                  │              │
│        ▼                  ▼                  ▼              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Gemini    │    │  Dashboard  │    │  MockMNEE   │     │
│  │   AI        │    │  (React)    │    │  Token      │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

| Component | Description | Location |
|-----------|-------------|----------|
| FlowPayStream | Smart contract for payment streams | `contracts/FlowPayStream.sol` |
| MockMNEE | Test ERC-20 token | `contracts/MockMNEE.sol` |
| FlowPaySDK | Agent SDK for x402 negotiation | `sdk/src/FlowPaySDK.ts` |
| flowPayMiddleware | Express.js x402 middleware | `server/middleware/flowPayMiddleware.js` |
| GeminiPaymentBrain | AI decision engine | `sdk/src/GeminiPaymentBrain.ts` |
| SpendingMonitor | Safety & limits | `sdk/src/SpendingMonitor.ts` |
| FlowPayProxy | Multi-agent mesh support | `sdk/src/FlowPayProxy.ts` |

## Network Configuration

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Sepolia | 11155111 | https://rpc.sepolia.org |

## Troubleshooting

### "Insufficient funds for gas"
- Get Sepolia ETH from faucet: https://sepoliafaucet.com

### "MNEE transfer failed"
- Ensure MockMNEE is deployed
- Check token approval: `mnee.approve(flowPayStreamAddress, amount)`

### "Stream is not active"
- Verify stream ID exists on-chain
- Check stream hasn't expired or been cancelled

### Tests failing
```bash
# Clean and rebuild
rm -rf sdk/dist
cd sdk && npm run build
```

## Production Checklist

- [ ] Replace MockMNEE with real MNEE token on mainnet
- [ ] Configure production RPC URLs (Alchemy/Infura)
- [ ] Set up monitoring for Emergency Stop triggers
- [ ] Review spending limits for production agents
- [ ] Enable contract verification on Etherscan
- [ ] Configure HTTPS for server endpoints
- [ ] Set up logging and alerting
- [ ] Review gas price strategies

## Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **API Keys**: Use environment variables for all secrets
3. **Spending Limits**: Configure appropriate limits for agents
4. **Emergency Stop**: Test emergency stop functionality
5. **Stream Verification**: Always verify streams on-chain before granting access

## Support

For issues or questions:
- Check existing tests for usage examples
- Review demo scripts in `demo/` directory
- Examine SDK source code for implementation details

## License

MIT License - See LICENSE file for details
