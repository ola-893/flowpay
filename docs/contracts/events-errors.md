# Events & Errors

Reference for MorphStream contract events and error messages.

## Events

### StreamCreated

Emitted when a new stream is created.

```solidity
event StreamCreated(
    uint256 indexed streamId,
    address indexed sender,
    address indexed recipient,
    uint256 totalAmount,
    uint256 startTime,
    uint256 stopTime,
    string metadata
)
```

**Parameters:**
| Name | Indexed | Description |
|------|---------|-------------|
| streamId | Yes | Unique stream identifier |
| sender | Yes | Stream creator address |
| recipient | Yes | Payment receiver address |
| totalAmount | No | Total MNEE locked |
| startTime | No | Stream start timestamp |
| stopTime | No | Stream end timestamp |
| metadata | No | JSON metadata string |

**Example Log:**
```javascript
{
  event: 'StreamCreated',
  args: {
    streamId: 42n,
    sender: '0x1234...',
    recipient: '0x5678...',
    totalAmount: 10000000000000000000n, // 10 MNEE
    startTime: 1704067200n,
    stopTime: 1704070800n,
    metadata: '{"purpose":"API access"}'
  }
}
```

### Withdrawn

Emitted when funds are withdrawn from a stream.

```solidity
event Withdrawn(
    uint256 indexed streamId,
    address indexed recipient,
    uint256 amount
)
```

**Parameters:**
| Name | Indexed | Description |
|------|---------|-------------|
| streamId | Yes | Stream identifier |
| recipient | Yes | Withdrawal recipient |
| amount | No | Amount withdrawn |

### StreamCancelled

Emitted when a stream is cancelled.

```solidity
event StreamCancelled(
    uint256 indexed streamId,
    address sender,
    address recipient,
    uint256 senderBalance,
    uint256 recipientBalance
)
```

**Parameters:**
| Name | Indexed | Description |
|------|---------|-------------|
| streamId | Yes | Stream identifier |
| sender | No | Original sender |
| recipient | No | Original recipient |
| senderBalance | No | Amount returned to sender |
| recipientBalance | No | Amount sent to recipient |

## Error Messages

### Stream Creation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `MorphStream: Total amount must be greater than 0.` | Amount is zero | Provide positive amount |
| `MorphStream: Recipient cannot be the zero address.` | Invalid recipient | Use valid address |
| `MorphStream: Duration must be greater than 0.` | Duration is zero | Provide positive duration |
| `MorphStream: flowRate would be zero.` | Amount too small for duration | Increase amount or decrease duration |
| `MorphStream: Transfer failed. check allowance` | Insufficient approval | Approve tokens first |

### Withdrawal Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `MorphStream: Stream is not active.` | Stream ended or cancelled | Check stream status |
| `MorphStream: Caller is not the recipient.` | Wrong caller | Use recipient wallet |
| `MorphStream: No funds to withdraw.` | Nothing claimable yet | Wait for funds to stream |
| `MorphStream: Transfer failed.` | Token transfer issue | Check contract balance |

### Cancellation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `MorphStream: Stream already cancelled.` | Already inactive | No action needed |
| `MorphStream: Caller cannot cancel this stream.` | Not sender or recipient | Use authorized wallet |
| `MorphStream: Recipient transfer failed on cancel.` | Transfer issue | Check token state |
| `MorphStream: Sender refund failed on cancel.` | Transfer issue | Check token state |

## Listening to Events

### Using ethers.js

```javascript
// Listen for new streams
contract.on('StreamCreated', (streamId, sender, recipient, amount, start, stop, metadata) => {
  console.log(`New stream #${streamId} created`);
  console.log(`From: ${sender} To: ${recipient}`);
  console.log(`Amount: ${ethers.formatEther(amount)} MNEE`);
});

// Listen for withdrawals
contract.on('Withdrawn', (streamId, recipient, amount) => {
  console.log(`Withdrawal from stream #${streamId}`);
  console.log(`${ethers.formatEther(amount)} MNEE to ${recipient}`);
});

// Listen for cancellations
contract.on('StreamCancelled', (streamId, sender, recipient, senderBal, recipientBal) => {
  console.log(`Stream #${streamId} cancelled`);
});
```

### Querying Past Events

```javascript
// Get all streams created by an address
const filter = contract.filters.StreamCreated(null, myAddress);
const events = await contract.queryFilter(filter, 0, 'latest');

events.forEach(event => {
  console.log(`Stream #${event.args.streamId}`);
});
```

## Error Handling

```javascript
try {
  await contract.createStream(recipient, duration, amount, metadata);
} catch (error) {
  if (error.message.includes('flowRate would be zero')) {
    console.log('Amount too small for duration');
  } else if (error.message.includes('check allowance')) {
    console.log('Need to approve tokens first');
  } else {
    console.log('Unknown error:', error.message);
  }
}
```
