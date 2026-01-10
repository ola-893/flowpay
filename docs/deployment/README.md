# Deployment Overview

FlowPay can be deployed to various Ethereum networks.

## Supported Networks

| Network | Status | Chain ID |
|---------|--------|----------|
| Sepolia Testnet | ✅ Active | 11155111 |
| Ethereum Mainnet | 🔜 Coming | 1 |

## Current Deployment

**Sepolia Testnet:**

| Contract | Address |
|----------|---------|
| MockMNEE | `0x96B1FE54Ee89811f46ecE4a347950E0D682D3896` |
| MorphStream | `0x155A00fBE3D290a8935ca4Bf5244283685Bb0035` |

## Deployment Guides

- [Sepolia Testnet](sepolia.md) - Development and testing
- [Production Checklist](production.md) - Mainnet preparation

## Quick Deploy

```bash
# Deploy to Sepolia
npm run deploy:sepolia

# Or manually
npx hardhat run scripts/deploy.js --network sepolia
```

## Architecture

```
┌─────────────────────────────────────────┐
│           Deployment Stack              │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │  MockMNEE   │  │  MorphStream    │   │
│  │  (ERC-20)   │──│  (Streaming)    │   │
│  └─────────────┘  └─────────────────┘   │
│         │                 │             │
│         └────────┬────────┘             │
│                  │                      │
│                  ▼                      │
│         ┌───────────────┐               │
│         │   Ethereum    │               │
│         │   Network     │               │
│         └───────────────┘               │
│                                         │
└─────────────────────────────────────────┘
```

## Environment Variables

Required for deployment:

```bash
PRIVATE_KEY=0x...          # Deployer wallet
SEPOLIA_RPC_URL=https://...  # RPC endpoint
ETHERSCAN_API_KEY=...      # For verification (optional)
```

## Post-Deployment

After deploying:

1. **Verify contracts** on Etherscan
2. **Update frontend** with new addresses
3. **Update SDK** configuration
4. **Test** all functionality
5. **Document** deployment details
