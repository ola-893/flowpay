# Configuration

FlowPay offers extensive configuration options for different use cases.

## SDK Configuration

```typescript
import { FlowPaySDK } from './sdk/src/FlowPaySDK';

const sdk = new FlowPaySDK({
  // Required
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: 'https://rpc.sepolia.org',
  contractAddress: '0x155A00fBE3D290a8935ca4Bf5244283685Bb0035',
  mneeAddress: '0x96B1FE54Ee89811f46ecE4a347950E0D682D3896',
  
  // Optional
  agentId: 'my-agent-001',
  defaultStreamDuration: 3600, // 1 hour
  autoApproveTokens: true,
  maxRetries: 3,
  retryDelay: 1000
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `privateKey` | string | required | Wallet private key |
| `rpcUrl` | string | required | Ethereum RPC endpoint |
| `contractAddress` | string | required | FlowPayStream contract address |
| `mneeAddress` | string | required | MNEE token address |
| `agentId` | string | auto | Unique agent identifier |
| `defaultStreamDuration` | number | 3600 | Default stream duration (seconds) |
| `autoApproveTokens` | boolean | true | Auto-approve token allowance |
| `maxRetries` | number | 3 | Max retry attempts for failed requests |
| `retryDelay` | number | 1000 | Delay between retries (ms) |

## Spending Monitor Configuration

```typescript
import { SpendingMonitor } from './sdk/src/SpendingMonitor';

const monitor = new SpendingMonitor({
  dailyLimit: '100',      // 100 MNEE per day
  perRequestLimit: '1',   // 1 MNEE max per request
  emergencyStopThreshold: '500', // Stop if total exceeds 500 MNEE
  alertCallback: (alert) => {
    console.log('Spending alert:', alert);
  }
});
```

## Gemini AI Configuration

```typescript
import { GeminiPaymentBrain } from './sdk/src/GeminiPaymentBrain';

const brain = new GeminiPaymentBrain({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-pro',
  decisionThreshold: 0.7,
  preferStreaming: true,
  costOptimization: 'aggressive' // 'conservative' | 'balanced' | 'aggressive'
});
```

## Middleware Configuration

```javascript
const { flowPayMiddleware } = require('./middleware/flowPayMiddleware');

app.use('/api/premium', flowPayMiddleware({
  // Pricing
  pricePerRequest: '0.001',
  pricingModel: 'per-request', // 'per-request' | 'per-byte' | 'per-second'
  
  // Contract
  contractAddress: '0x155A00fBE3D290a8935ca4Bf5244283685Bb0035',
  mneeAddress: '0x96B1FE54Ee89811f46ecE4a347950E0D682D3896',
  recipientAddress: '0x...',
  
  // Verification
  minStreamBalance: '0.01',
  verifyOnChain: true,
  cacheVerification: true,
  cacheTTL: 60000, // 1 minute
  
  // Headers
  customHeaders: {
    'X-Provider-Name': 'MyAPI'
  }
}));
```

## Frontend Configuration

Create `vite-project/.env`:

```bash
# Contract addresses
VITE_CONTRACT_ADDRESS=0x155A00fBE3D290a8935ca4Bf5244283685Bb0035
VITE_MNEE_TOKEN_ADDRESS=0x96B1FE54Ee89811f46ecE4a347950E0D682D3896

# Network
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://rpc.sepolia.org

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_AI_CONSOLE=true
```

## Network Configuration

### Supported Networks

| Network | Chain ID | Status |
|---------|----------|--------|
| Sepolia | 11155111 | ✅ Active |
| Mainnet | 1 | 🔜 Coming Soon |

### Custom RPC Endpoints

```javascript
const RPC_URLS = {
  sepolia: {
    primary: 'https://rpc.sepolia.org',
    fallback: [
      'https://sepolia.infura.io/v3/YOUR_KEY',
      'https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY'
    ]
  }
};
```

## Security Configuration

### Private Key Management

Never hardcode private keys. Use environment variables or secure vaults:

```bash
# .env (never commit this file!)
PRIVATE_KEY=0x...
```

### Rate Limiting

```javascript
const rateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 100,
  skipSuccessfulRequests: false
};
```

## Next Steps

- [Architecture Overview](../architecture/README.md)
- [SDK Reference](../sdk/README.md)
