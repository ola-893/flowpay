# FlowPaySDK

The main SDK class for AI agent payments.

## Constructor

```typescript
new FlowPaySDK(config: FlowPayConfig)
```

### Config Options

```typescript
interface FlowPayConfig {
  privateKey: string;
  rpcUrl: string;
  contractAddress: string;
  mneeAddress: string;
  agentId?: string;
  defaultStreamDuration?: number;
  autoApproveTokens?: boolean;
}
```

## Methods

### request

Makes an HTTP request with automatic x402 handling.

```typescript
async request(url: string, options?: RequestOptions): Promise<Response>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| url | string | Target URL |
| options | RequestOptions | Fetch options |

**Example:**
```typescript
const response = await sdk.request('https://api.provider.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'test' })
});
```

### createStream

Creates a new payment stream.

```typescript
async createStream(params: CreateStreamParams): Promise<number>
```

**Parameters:**
```typescript
interface CreateStreamParams {
  recipient: string;
  amount: string;
  duration: number;
  metadata?: string;
}
```

**Returns:** Stream ID

**Example:**
```typescript
const streamId = await sdk.createStream({
  recipient: '0x...',
  amount: '10', // 10 MNEE
  duration: 3600, // 1 hour
  metadata: JSON.stringify({ purpose: 'API access' })
});
```

### getStream

Gets stream details.

```typescript
async getStream(streamId: number): Promise<Stream>
```

**Returns:**
```typescript
interface Stream {
  sender: string;
  recipient: string;
  totalAmount: bigint;
  flowRate: bigint;
  startTime: number;
  stopTime: number;
  amountWithdrawn: bigint;
  isActive: boolean;
  metadata: string;
}
```

### getClaimableBalance

Gets withdrawable amount for a stream.

```typescript
async getClaimableBalance(streamId: number): Promise<string>
```

**Returns:** Claimable amount in MNEE

### withdrawFromStream

Withdraws available funds.

```typescript
async withdrawFromStream(streamId: number): Promise<TransactionReceipt>
```

### cancelStream

Cancels an active stream.

```typescript
async cancelStream(streamId: number): Promise<TransactionReceipt>
```

### getActiveStreamForRecipient

Finds an active stream for a recipient.

```typescript
async getActiveStreamForRecipient(recipient: string): Promise<number | null>
```

### getMneeBalance

Gets MNEE token balance.

```typescript
async getMneeBalance(address?: string): Promise<string>
```

### approveMnee

Approves MNEE spending.

```typescript
async approveMnee(amount: string): Promise<TransactionReceipt>
```

## Events

The SDK emits events for monitoring:

```typescript
sdk.on('streamCreated', (streamId: number) => {
  console.log(`Stream #${streamId} created`);
});

sdk.on('paymentRequired', (requirements: PaymentRequirements) => {
  console.log('Payment required:', requirements);
});

sdk.on('requestCompleted', (url: string, streamId: number) => {
  console.log(`Request to ${url} completed using stream #${streamId}`);
});
```

## Error Handling

```typescript
try {
  await sdk.createStream(params);
} catch (error) {
  if (error.code === 'INSUFFICIENT_BALANCE') {
    console.log('Not enough MNEE');
  } else if (error.code === 'APPROVAL_REQUIRED') {
    console.log('Need to approve tokens');
  }
}
```

## Full Example

```typescript
import { FlowPaySDK } from './FlowPaySDK';

async function main() {
  const sdk = new FlowPaySDK({
    privateKey: process.env.PRIVATE_KEY!,
    rpcUrl: 'https://rpc.sepolia.org',
    contractAddress: '0x155A00fBE3D290a8935ca4Bf5244283685Bb0035',
    mneeAddress: '0x96B1FE54Ee89811f46ecE4a347950E0D682D3896'
  });

  // Check balance
  const balance = await sdk.getMneeBalance();
  console.log(`Balance: ${balance} MNEE`);

  // Make requests (SDK handles everything)
  for (let i = 0; i < 10; i++) {
    const response = await sdk.request('https://api.provider.com/data');
    const data = await response.json();
    console.log(`Request ${i + 1}:`, data);
  }
}

main();
```
