# Installation

This guide covers installing FlowPay components for different use cases.

## For AI Agent Developers (SDK)

Install the FlowPay SDK to enable your AI agents to make streaming payments:

```bash
cd sdk
npm install
```

### Dependencies

The SDK requires:
- `ethers` ^6.0.0 - Ethereum interactions
- `@google/generative-ai` - Gemini AI integration (optional)

## For API Providers (Middleware)

Install the server middleware to accept x402 payments:

```bash
cd server
npm install
```

### Express.js Integration

```javascript
const express = require('express');
const { flowPayMiddleware } = require('./middleware/flowPayMiddleware');

const app = express();

// Apply middleware to protected routes
app.use('/api/premium', flowPayMiddleware({
  pricePerRequest: '0.001', // MNEE per request
  recipientAddress: '0x...',
  contractAddress: '0x155A00fBE3D290a8935ca4Bf5244283685Bb0035'
}));
```

## For Frontend Development

Install the React dashboard:

```bash
cd vite-project
npm install
```

### Start Development Server

```bash
npm run dev
```

## Smart Contract Deployment

If you need to deploy your own contracts:

```bash
# Install Hardhat dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

## Environment Variables

Create a `.env` file in the project root:

```bash
# Required for deployment
PRIVATE_KEY=0x...
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Optional
ETHERSCAN_API_KEY=...
GEMINI_API_KEY=...
```

## Verify Installation

Run the test suite to verify everything is working:

```bash
# SDK tests
cd sdk && npx mocha -r ts-node/register test/*.test.ts

# Contract tests
npx hardhat test
```

Expected output:
- SDK Tests: 41 passing
- Contract Tests: 6 passing

## Next Steps

- [Quick Start Guide](quick-start.md)
- [Configuration Options](configuration.md)
