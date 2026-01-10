# Sepolia Testnet Deployment

Guide for deploying FlowPay to Ethereum Sepolia testnet.

## Current Deployment

| Contract | Address |
|----------|---------|
| MockMNEE | `0x96B1FE54Ee89811f46ecE4a347950E0D682D3896` |
| MorphStream | `0x155A00fBE3D290a8935ca4Bf5244283685Bb0035` |

**Network:** Ethereum Sepolia (Chain ID: 11155111)

## Prerequisites

1. **Node.js** v18+
2. **Sepolia ETH** for gas fees
3. **Private Key** with Sepolia ETH

### Getting Sepolia ETH

Free testnet ETH from faucets:
- https://sepoliafaucet.com
- https://faucet.sepolia.dev
- https://www.alchemy.com/faucets/ethereum-sepolia

## Deployment Steps

### 1. Configure Environment

Create `.env` in project root:

```bash
PRIVATE_KEY=0x...your_private_key
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ETHERSCAN_API_KEY=...optional_for_verification
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Compile Contracts

```bash
npx hardhat compile
```

### 4. Deploy

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**Expected Output:**
```
Deploying contracts with the account: 0x...
Deploying MockMNEE...
MockMNEE deployed to: 0x96B1FE54Ee89811f46ecE4a347950E0D682D3896
Deploying MorphStream with MNEE address: 0x96B1FE54Ee89811f46ecE4a347950E0D682D3896
MorphStream deployed to: 0x155A00fBE3D290a8935ca4Bf5244283685Bb0035
```

### 5. Verify Contracts (Optional)

```bash
# Verify MockMNEE
npx hardhat verify --network sepolia 0x96B1FE54Ee89811f46ecE4a347950E0D682D3896

# Verify MorphStream
npx hardhat verify --network sepolia 0x155A00fBE3D290a8935ca4Bf5244283685Bb0035 "0x96B1FE54Ee89811f46ecE4a347950E0D682D3896"
```

### 6. Update Frontend

Update `vite-project/src/contactInfo.js`:

```javascript
export const contractAddress = "0x155A00fBE3D290a8935ca4Bf5244283685Bb0035";
export const mneeTokenAddress = "0x96B1FE54Ee89811f46ecE4a347950E0D682D3896";
```

## Network Configuration

### Hardhat Config

```javascript
// hardhat.config.js
module.exports = {
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111
    }
  }
};
```

### MetaMask Setup

Add Sepolia to MetaMask:
- Network Name: Sepolia
- RPC URL: https://rpc.sepolia.org
- Chain ID: 11155111
- Currency Symbol: ETH
- Explorer: https://sepolia.etherscan.io

## Testing Deployment

### Run Contract Tests

```bash
npx hardhat test --network sepolia
```

### Verify via Dashboard

1. Open FlowPay dashboard
2. Connect wallet (Sepolia network)
3. Mint test MNEE tokens
4. Create a test stream
5. Verify on Etherscan

## Troubleshooting

### "Insufficient funds"

Get more Sepolia ETH from faucets.

### "Nonce too low"

Reset MetaMask account or wait for pending transactions.

### "Contract not verified"

Ensure Etherscan API key is set and try again.

### "Network mismatch"

Switch MetaMask to Sepolia network.

## RPC Endpoints

| Provider | URL |
|----------|-----|
| Public | https://rpc.sepolia.org |
| Infura | https://sepolia.infura.io/v3/YOUR_KEY |
| Alchemy | https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY |

## Block Explorer

View transactions and contracts:
https://sepolia.etherscan.io
