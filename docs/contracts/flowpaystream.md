# FlowPayStream Contract

The FlowPayStream contract is the core payment streaming infrastructure.

## Contract Address

**Sepolia**: `0x155A00fBE3D290a8935ca4Bf5244283685Bb0035`

## Overview

FlowPayStream enables continuous payment streams using MNEE tokens. Funds flow from sender to recipient over time, calculated per-second.

## Functions

### createStream

Creates a new payment stream.

```solidity
function createStream(
    address recipient,
    uint256 duration,
    uint256 amount,
    string memory metadata
) external
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| recipient | address | Address receiving the stream |
| duration | uint256 | Stream duration in seconds |
| amount | uint256 | Total MNEE amount (in wei) |
| metadata | string | JSON metadata string |

**Requirements:**
- `amount > 0`
- `duration > 0`
- `recipient != address(0)`
- Sender must have approved MNEE tokens

**Example:**
```javascript
// Approve tokens first
await mnee.approve(flowPayStreamAddress, amount);

// Create stream
await flowPayStream.createStream(
  recipientAddress,
  3600, // 1 hour
  ethers.parseEther('10'), // 10 MNEE
  '{"purpose": "API access"}'
);
```

### withdrawFromStream

Withdraws available funds from a stream.

```solidity
function withdrawFromStream(uint256 streamId) external
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| streamId | uint256 | ID of the stream |

**Requirements:**
- Caller must be the recipient
- Stream must be active
- Claimable balance > 0

**Example:**
```javascript
await flowPayStream.withdrawFromStream(42);
```

### cancelStream

Cancels an active stream.

```solidity
function cancelStream(uint256 streamId) external
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| streamId | uint256 | ID of the stream |

**Requirements:**
- Caller must be sender or recipient
- Stream must be active

**Behavior:**
- Recipient receives streamed amount
- Sender receives remaining amount
- Stream marked as inactive

### getClaimableBalance

Returns the amount available for withdrawal.

```solidity
function getClaimableBalance(uint256 streamId) external view returns (uint256)
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| streamId | uint256 | ID of the stream |

**Returns:** Amount in wei that can be withdrawn

**Calculation:**
```
elapsed = min(now, stopTime) - startTime
streamed = elapsed * flowRate
claimable = streamed - amountWithdrawn
```

### isStreamActive

Checks if a stream is currently active.

```solidity
function isStreamActive(uint256 streamId) external view returns (bool)
```

### streams

Returns stream details.

```solidity
function streams(uint256 streamId) external view returns (
    address sender,
    address recipient,
    uint256 totalAmount,
    uint256 flowRate,
    uint256 startTime,
    uint256 stopTime,
    uint256 amountWithdrawn,
    bool isActive,
    string memory metadata
)
```

## Stream Structure

```solidity
struct Stream {
    address sender;        // Stream creator
    address recipient;     // Payment receiver
    uint256 totalAmount;   // Total MNEE locked
    uint256 flowRate;      // MNEE per second
    uint256 startTime;     // Unix timestamp
    uint256 stopTime;      // Unix timestamp
    uint256 amountWithdrawn; // Already claimed
    bool isActive;         // Stream status
    string metadata;       // JSON metadata
}
```

## Flow Rate Calculation

```
flowRate = totalAmount / duration
```

Example:
- Amount: 3600 MNEE
- Duration: 3600 seconds (1 hour)
- Flow Rate: 1 MNEE/second

## Events

See [Events & Errors](events-errors.md) for full event documentation.

## Security Considerations

1. **Approval Required**: Users must approve MNEE before creating streams
2. **Recipient Only Withdraw**: Only recipients can withdraw
3. **Both Can Cancel**: Either party can cancel
4. **No Reentrancy**: Uses checks-effects-interactions pattern

## Gas Costs (Approximate)

| Function | Gas |
|----------|-----|
| createStream | ~150,000 |
| withdrawFromStream | ~80,000 |
| cancelStream | ~100,000 |
| getClaimableBalance | ~30,000 (view) |
