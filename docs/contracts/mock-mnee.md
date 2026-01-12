# MockMNEE Token

MockMNEE is a test ERC-20 token for FlowPay development.

## Contract Address

**Sepolia**: `0x96B1FE54Ee89811f46ecE4a347950E0D682D3896`

## Overview

MockMNEE is a standard ERC-20 token with an open mint function for testing purposes.

## Token Details

| Property | Value |
|----------|-------|
| Name | Mock MNEE |
| Symbol | MNEE |
| Decimals | 18 |
| Initial Supply | 1,000,000 MNEE |

## Functions

### Standard ERC-20

```solidity
function name() external view returns (string memory)
function symbol() external view returns (string memory)
function decimals() external view returns (uint8)
function totalSupply() external view returns (uint256)
function balanceOf(address account) external view returns (uint256)
function transfer(address recipient, uint256 amount) external returns (bool)
function allowance(address owner, address spender) external view returns (uint256)
function approve(address spender, uint256 amount) external returns (bool)
function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)
```

### mint

Mints new tokens to any address (for testing only).

```solidity
function mint(address to, uint256 amount) external
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| to | address | Recipient address |
| amount | uint256 | Amount in wei |

**Example:**
```javascript
// Mint 1000 MNEE
await mnee.mint(
  myAddress,
  ethers.parseEther('1000')
);
```

## Usage Examples

### Check Balance

```javascript
const balance = await mnee.balanceOf(myAddress);
console.log('Balance:', ethers.formatEther(balance), 'MNEE');
```

### Approve Spending

```javascript
// Approve FlowPayStream to spend 100 MNEE
await mnee.approve(
  flowPayStreamAddress,
  ethers.parseEther('100')
);
```

### Transfer Tokens

```javascript
await mnee.transfer(
  recipientAddress,
  ethers.parseEther('10')
);
```

## Events

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 value)
```

Emitted on:
- `transfer()`
- `transferFrom()`
- `mint()`

### Approval

```solidity
event Approval(address indexed owner, address indexed spender, uint256 value)
```

Emitted on:
- `approve()`

## Getting Test Tokens

### Via Dashboard

1. Connect wallet to FlowPay dashboard
2. Go to "Streams" tab
3. Click "Mint 1000 MNEE"
4. Confirm transaction

### Via Code

```javascript
const mnee = new ethers.Contract(mneeAddress, mneeABI, signer);
await mnee.mint(myAddress, ethers.parseEther('1000'));
```

### Via Etherscan

1. Go to [MockMNEE on Etherscan](https://sepolia.etherscan.io/address/0x96B1FE54Ee89811f46ecE4a347950E0D682D3896#writeContract)
2. Connect wallet
3. Call `mint` with your address and amount

## Production Note

⚠️ **MockMNEE is for testing only.** In production, FlowPay will use the real MNEE token which does not have a public mint function.
