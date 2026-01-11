import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Documentation content organized by sections
const docsContent = {
  'introduction': {
    title: 'Introduction',
    icon: '📖',
    content: `
# Welcome to FlowPay

**FlowPay** is a payment streaming platform built on Ethereum that enables continuous MNEE token transfers over time.

## What is FlowPay?

FlowPay allows you to create payment streams - continuous flows of tokens from sender to recipient. Instead of sending a lump sum, funds are gradually released based on elapsed time.

### Key Benefits

- **Flexible Payments** - Cancel anytime and get remaining funds back
- **Real-time Streaming** - Funds accumulate every second
- **No Intermediaries** - Direct blockchain transactions
- **Full Control** - Withdraw accumulated funds whenever you want

## How It Works

| Step | Action |
|------|--------|
| 1 | Connect your MetaMask wallet |
| 2 | Mint test MNEE tokens (testnet) |
| 3 | Create a stream to any recipient |
| 4 | Recipient withdraws funds as they accumulate |

## Current Deployment (Sepolia Testnet)

| Contract | Address |
|----------|---------|
| MockMNEE | \`0x96B1FE54Ee89811f46ecE4a347950E0D682D3896\` |
| MorphStream | \`0x155A00fBE3D290a8935ca4Bf5244283685Bb0035\` |

## Features

- ✅ **Web Dashboard** - Easy-to-use interface for all operations
- ✅ **MNEE Token Streams** - Continuous payment flows  
- ✅ **Real-time Monitoring** - Watch your streams progress live
- ✅ **Withdraw Anytime** - Recipients can claim funds whenever
- ✅ **Cancel Anytime** - Senders can stop streams and reclaim remaining funds

## Getting Started

1. **Connect Wallet** - Use MetaMask on Sepolia testnet
2. **Get Test Tokens** - Mint free MNEE from the Streams tab
3. **Create a Stream** - Send tokens to any address over time
4. **Monitor Progress** - Watch real-time updates on the Dashboard
`
  },
  'quick-start': {
    title: 'Quick Start',
    icon: '🚀',
    content: `
# Quick Start

Get FlowPay running in under 5 minutes using the dashboard.

## Step 1: Connect Your Wallet

1. Open the FlowPay dashboard at the home page
2. Click **Connect Wallet** in the header
3. Select MetaMask and approve the connection
4. Ensure you're on **Sepolia testnet** (the app will prompt you to switch if needed)

## Step 2: Get Test Tokens

You need MNEE tokens to create streams:

1. Navigate to the **Streams** tab
2. Click **Mint 1000 MNEE** button
3. Approve the transaction in MetaMask
4. Wait for confirmation - your balance will update automatically

## Step 3: Create Your First Stream

All stream creation is done through the dashboard:

1. Go to the **Streams** tab
2. In the "Create New Stream" section, enter:
   - **Recipient Address**: The wallet address to receive payments
   - **Amount**: How much MNEE to stream (e.g., 10 MNEE)
   - **Duration**: Select a preset (1 hour, 24 hours, 7 days) or enter custom seconds
3. Review the flow rate calculation
4. Click **Start Stream**
5. Approve the MNEE token allowance (first time only)
6. Confirm the stream creation transaction

## Step 4: Monitor Your Streams

Once your stream is active:

- View real-time progress on the **Dashboard**
- See all streams in the **Streams** tab
- Track claimable balances for incoming streams
- Cancel or withdraw from streams as needed

## Step 5: Withdraw Funds (Recipients)

If you're receiving a stream:

1. Go to **Streams** tab
2. Find your incoming stream
3. Click **Withdraw** to claim accumulated funds
4. Confirm the transaction
`
  },
  'installation': {
    title: 'Installation',
    icon: '📦',
    content: `
# Installation

FlowPay is a web-based application - no installation required for end users!

## Using FlowPay (End Users)

Simply visit the FlowPay dashboard and connect your wallet. No downloads or installations needed.

### Requirements

- **MetaMask** browser extension (or compatible Web3 wallet)
- **Sepolia ETH** for gas fees
- **MNEE tokens** for creating streams (can be minted from the dashboard)

## For Developers (Local Development)

If you want to run FlowPay locally or contribute to development:

### Clone and Setup

\`\`\`bash
git clone https://github.com/your-org/flowpay
cd flowpay
\`\`\`

### Install Dependencies

\`\`\`bash
# Root dependencies (smart contracts)
npm install

# Frontend dependencies
cd vite-project
npm install
\`\`\`

### Run Development Server

\`\`\`bash
cd vite-project
npm run dev
\`\`\`

The app will be available at \`http://localhost:5173\`

## Environment Variables (Development Only)

For local development, create a \`.env\` file in the root:

\`\`\`bash
PRIVATE_KEY=0x...  # For contract deployment only
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
\`\`\`

> ⚠️ **Note:** End users don't need any environment variables. All interactions happen through the web dashboard with MetaMask.
`
  },
  'architecture': {
    title: 'Architecture',
    icon: '🏗️',
    content: `
# Architecture Overview

FlowPay is designed as a simple, user-friendly payment streaming platform.

## System Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                      FlowPay System                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐                       ┌──────────────┐    │
│  │    User      │                       │  Blockchain  │    │
│  │   Browser    │◀─────────────────────▶│  (Sepolia)   │    │
│  │  + MetaMask  │                       │              │    │
│  └──────────────┘                       └──────────────┘    │
│         │                                      │            │
│         ▼                                      ▼            │
│  ┌──────────────┐                       ┌──────────────┐    │
│  │   FlowPay    │                       │  MorphStream │    │
│  │  Dashboard   │                       │  + MockMNEE  │    │
│  │   (React)    │                       │  Contracts   │    │
│  └──────────────┘                       └──────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## Core Components

| Component | Description |
|-----------|-------------|
| **Dashboard** | React web app for managing streams |
| **MorphStream** | Smart contract for payment streams |
| **MockMNEE** | Test ERC-20 token for payments |
| **MetaMask** | User's wallet for signing transactions |

## User Flow

1. User connects MetaMask wallet to dashboard
2. User mints test MNEE tokens (testnet only)
3. User creates a stream by specifying recipient, amount, duration
4. Smart contract locks MNEE tokens and starts streaming
5. Recipient can withdraw accumulated funds anytime
6. Stream completes or either party cancels

## Key Features

- **No Backend Required** - All interactions are directly with the blockchain
- **Real-time Updates** - Dashboard shows live stream progress
- **Self-Custody** - Users maintain full control of their funds
- **Transparent** - All transactions visible on block explorer
`
  },
  'x402-protocol': {
    title: 'x402 Protocol',
    icon: '🔄',
    content: `
# x402 Protocol (Advanced)

FlowPay is built with x402 protocol compatibility in mind for future integrations.

> ℹ️ **Note:** This section describes the underlying protocol design. As an end user, you don't need to understand this - just use the dashboard!

## What is x402?

x402 is a proposed standard for HTTP-based payment negotiation, using the HTTP 402 "Payment Required" status code.

## Protocol Flow

\`\`\`
┌──────────┐                    ┌──────────┐
│ Consumer │                    │ Provider │
└────┬─────┘                    └────┬─────┘
     │  1. GET /api/resource         │
     │──────────────────────────────▶│
     │  2. 402 Payment Required      │
     │◀──────────────────────────────│
     │  3. Process Payment           │
     │  4. GET + Payment Proof       │
     │──────────────────────────────▶│
     │  5. 200 OK + Data             │
     │◀──────────────────────────────│
\`\`\`

## Response Headers (402)

When a server requires payment, it responds with:

\`\`\`http
HTTP/1.1 402 Payment Required
X-Payment-Required: true
X-Payment-Types: stream,direct
X-Payment-Amount: 0.001
X-Payment-Currency: MNEE
X-Payment-Recipient: 0x1234...
X-Payment-Contract: 0x155A00fBE3D290a8935ca4Bf5244283685Bb0035
X-Payment-Network: sepolia
\`\`\`

## Request Headers (With Payment)

After creating a stream, requests include:

\`\`\`http
GET /api/resource HTTP/1.1
X-FlowPay-Stream-ID: 42
X-FlowPay-Timestamp: 1704067200
\`\`\`

## Header Reference

| Header | Description |
|--------|-------------|
| \`X-Payment-Required\` | Indicates payment is needed |
| \`X-Payment-Amount\` | Price per request |
| \`X-Payment-Currency\` | Token symbol (MNEE) |
| \`X-Payment-Recipient\` | Provider's address |
| \`X-FlowPay-Stream-ID\` | Active stream ID |

## Future Integration

The x402 protocol enables future features like:
- Automated API payments
- Pay-per-request services
- Streaming subscriptions

Currently, FlowPay focuses on the dashboard experience for manual stream management.
`
  },
  'payment-streams': {
    title: 'Payment Streams',
    icon: '💸',
    content: `
# Payment Streams

Payment streams are the core feature of FlowPay.

## What is a Payment Stream?

A payment stream is a continuous flow of MNEE tokens from sender to recipient over time. Instead of sending a lump sum, funds are gradually released based on elapsed time.

\`\`\`
Time ─────────────────────────────────────────▶

     Start                                  Stop
       │                                      │
       ▼                                      ▼
       ┌──────────────────────────────────────┐
       │████████████████████░░░░░░░░░░░░░░░░░░│
       │◀── Streamed ──▶│◀── Remaining ──▶│
       └──────────────────────────────────────┘
\`\`\`

## Stream Lifecycle

### 1. Creation (via Dashboard)
- Go to **Streams** tab
- Enter recipient address, amount, and duration
- Approve MNEE token allowance
- Confirm stream creation transaction

### 2. Active Streaming
- Funds accumulate for recipient in real-time
- Claimable balance increases every second
- Either party can cancel anytime
- Progress visible on dashboard

### 3. Withdrawal (via Dashboard)
- Recipient clicks **Withdraw** on their incoming stream
- All accumulated funds are transferred
- Can withdraw multiple times during stream

### 4. Completion
- Stream reaches stop time automatically
- All remaining funds become claimable
- Recipient can withdraw final balance

## Flow Rate Calculation

\`\`\`
flowRate = totalAmount / duration
\`\`\`

**Example:** 3600 MNEE over 1 hour = 1 MNEE/second

## Stream Actions

| Action | Who Can Do It | Effect |
|--------|---------------|--------|
| **Create** | Anyone with MNEE | Locks tokens, starts stream |
| **Withdraw** | Recipient only | Claims accumulated funds |
| **Cancel** | Sender or Recipient | Stops stream, returns remaining to sender |

## Benefits

| Aspect | Direct Payment | Stream Payment |
|--------|---------------|----------------|
| Flexibility | None | Cancel anytime |
| Partial payment | No | Yes, withdraw anytime |
| Refunds | Manual | Automatic on cancel |
`
  },
  'morphstream-contract': {
    title: 'MorphStream Contract',
    icon: '📜',
    content: `
# MorphStream Contract

The smart contract that powers FlowPay payment streams.

**Address:** \`0x155A00fBE3D290a8935ca4Bf5244283685Bb0035\`

**Network:** Sepolia Testnet

## What Does It Do?

MorphStream handles all the on-chain logic for payment streams:

- **Creates streams** - Locks MNEE tokens and starts the payment flow
- **Tracks balances** - Calculates how much has been streamed in real-time
- **Processes withdrawals** - Transfers accumulated funds to recipients
- **Handles cancellations** - Returns remaining funds to senders

## Stream Data

Each stream stores:

| Field | Description |
|-------|-------------|
| sender | Address that created the stream |
| recipient | Address receiving the payments |
| totalAmount | Total MNEE locked in the stream |
| flowRate | MNEE per second being streamed |
| startTime | When the stream started |
| stopTime | When the stream will end |
| amountWithdrawn | How much recipient has claimed |
| isActive | Whether stream is still running |

## Events

The contract emits events that the dashboard listens to:

| Event | When It Fires |
|-------|---------------|
| \`StreamCreated\` | New stream is created |
| \`Withdrawn\` | Recipient withdraws funds |
| \`StreamCancelled\` | Stream is cancelled |

## Gas Costs (Approximate)

| Action | Gas Cost | ~USD at 20 gwei |
|--------|----------|-----------------|
| Create Stream | ~150,000 | ~$0.50 |
| Withdraw | ~80,000 | ~$0.25 |
| Cancel Stream | ~100,000 | ~$0.35 |

> 💡 **Tip:** On Sepolia testnet, gas is free! Just get test ETH from a faucet.

## View on Block Explorer

[View MorphStream on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x155A00fBE3D290a8935ca4Bf5244283685Bb0035)
`
  },
  'mnee-token': {
    title: 'MockMNEE Token',
    icon: '🪙',
    content: `
# MockMNEE Token

Test ERC-20 token for FlowPay on Sepolia testnet.

**Address:** \`0x96B1FE54Ee89811f46ecE4a347950E0D682D3896\`

## Token Details

| Property | Value |
|----------|-------|
| Name | Mock MNEE |
| Symbol | MNEE |
| Decimals | 18 |
| Network | Sepolia Testnet |

## Getting Test Tokens

### Via Dashboard (Recommended)

1. Connect your wallet to the FlowPay dashboard
2. Go to the **Streams** tab
3. Click **Mint 1000 MNEE** button
4. Confirm the transaction in MetaMask
5. Your balance will update automatically

### Check Your Balance

Your MNEE balance is displayed in the header after connecting your wallet.

## Token Usage

MNEE tokens are used for:

- **Creating streams** - Lock tokens to start a payment stream
- **Receiving payments** - Withdraw accumulated tokens from incoming streams
- **Testing** - Safe to experiment on testnet without real value

## Important Notes

> ⚠️ **Testnet Only:** MockMNEE is for testing on Sepolia. It has no real value.

> ℹ️ **Free Minting:** Anyone can mint unlimited test tokens for development.

> 🔄 **Production:** Real MNEE tokens will be used on mainnet deployment.

## View on Block Explorer

[View MockMNEE on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x96B1FE54Ee89811f46ecE4a347950E0D682D3896)

---

## Graduating to Mainnet

When you're ready to move from testnet to mainnet, you'll need to replace MockMNEE with the real MNEE token.

### Mainnet MNEE Token

| Property | Value |
|----------|-------|
| Contract Address | \`0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF\` |
| Network | Ethereum Mainnet |
| Symbol | MNEE |
| Decimals | 18 |

### Migration Steps (For Developers)

1. **Update the token address** in \`vite-project/src/contactInfo.js\`:

\`\`\`javascript
// Change from testnet MockMNEE
export const mneeTokenAddress = '0x96B1FE54Ee89811f46ecE4a347950E0D682D3896';

// To mainnet MNEE
export const mneeTokenAddress = '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF';
\`\`\`

2. **Update the network configuration** to target Ethereum Mainnet (Chain ID: 1) instead of Sepolia (Chain ID: 11155111)

3. **Deploy MorphStream to mainnet** - The streaming contract needs to be deployed to mainnet and its address updated

4. **Remove the Mint button** - Real MNEE cannot be freely minted like the test token

### Key Differences

| Feature | MockMNEE (Testnet) | MNEE (Mainnet) |
|---------|-------------------|----------------|
| Free minting | ✅ Yes | ❌ No |
| Real value | ❌ No | ✅ Yes |
| Gas costs | Free (testnet ETH) | Real ETH required |
| Network | Sepolia | Ethereum Mainnet |

> ⚠️ **Important:** Always test thoroughly on Sepolia before deploying to mainnet. Mainnet transactions use real funds and cannot be reversed.

### Acquiring Real MNEE

On mainnet, you'll need to acquire MNEE tokens through:
- Supported exchanges
- Token swaps (Uniswap, etc.)
- Direct purchase

Check the official MNEE documentation for current acquisition methods.
`
  },
  'sdk-reference': {
    title: 'Dashboard Guide',
    icon: '🛠️',
    content: `
# Dashboard Guide

Complete guide to using the FlowPay web dashboard.

## Navigation

The dashboard has four main sections accessible from the top navigation:

| Tab | Purpose |
|-----|---------|
| **Dashboard** | Overview of your streams and activity |
| **Streams** | Create and manage payment streams |
| **Agent Console** | AI agent testing interface |
| **Docs** | This documentation |

## Connecting Your Wallet

1. Click **Connect Wallet** in the header
2. MetaMask will prompt you to connect
3. Approve the connection request
4. If not on Sepolia, you'll be prompted to switch networks

## Dashboard Tab

The main dashboard shows:

- **Active Streams** - Count of your ongoing streams
- **Stream Monitor** - Real-time visualization of stream progress
- **Efficiency Metrics** - Usage statistics

## Streams Tab

### Creating a Stream

1. Fill in the **Create New Stream** form:
   - **Recipient**: Wallet address to receive payments
   - **Token**: MNEE (currently the only supported token)
   - **Amount**: Total MNEE to stream
   - **Duration**: How long the stream should last

2. Click **Start Stream**
3. Approve token allowance (first time only)
4. Confirm the transaction

### Managing Streams

**Outgoing Streams** (you're sending):
- View progress and remaining time
- Cancel to stop and reclaim remaining funds

**Incoming Streams** (you're receiving):
- View claimable balance in real-time
- Click **Withdraw** to claim accumulated funds

### Minting Test Tokens

Click **Mint 1000 MNEE** to get free test tokens on Sepolia.

## Agent Console Tab

The Agent Console provides an AI-powered interface for testing x402 payment flows. This is primarily for demonstration and testing purposes.

## Status Bar

The bottom status bar shows:
- Current operation status
- Transaction confirmations
- Error messages
`
  },
  'deployment': {
    title: 'Deployment',
    icon: '🚢',
    content: `
# Deployment Guide

Deploy FlowPay to Ethereum networks.

## Current Deployment (Sepolia)

| Contract | Address |
|----------|---------|
| MockMNEE | \`0x96B1FE54Ee89811f46ecE4a347950E0D682D3896\` |
| MorphStream | \`0x155A00fBE3D290a8935ca4Bf5244283685Bb0035\` |

## Deploy Your Own

### 1. Configure Environment

\`\`\`bash
# .env
PRIVATE_KEY=0x...
SEPOLIA_RPC_URL=https://rpc.sepolia.org
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Deploy

\`\`\`bash
npx hardhat run scripts/deploy.js --network sepolia
\`\`\`

### 4. Verify (Optional)

\`\`\`bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
\`\`\`

## Network Configuration

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Sepolia | 11155111 | https://rpc.sepolia.org |

## Getting Sepolia ETH

Free testnet ETH:
- https://sepoliafaucet.com
- https://faucet.sepolia.dev

## Post-Deployment

1. Update frontend with new addresses
2. Verify contracts on Etherscan
3. Test all functionality
4. Update documentation
`
  },
  'faq': {
    title: 'FAQ',
    icon: '❓',
    content: `
# Frequently Asked Questions

## General

### What is FlowPay?
FlowPay is a payment streaming platform that enables continuous MNEE token transfers over time, rather than one-time payments.

### What problem does FlowPay solve?
FlowPay enables flexible, time-based payments where funds are released gradually. This is useful for subscriptions, salaries, or any scenario where you want to pay over time with the ability to cancel.

### Which networks are supported?
Currently Ethereum Sepolia testnet only. Mainnet deployment is planned for the future.

### Is there an SDK or API?
No, FlowPay is currently a frontend-only application. All interactions are done through the web dashboard using MetaMask.

## Technical

### How is the flow rate calculated?
\`flowRate = totalAmount / duration\`

For example, streaming 3600 MNEE over 1 hour = 1 MNEE per second.

### Can I cancel a stream?
Yes, both sender and recipient can cancel anytime. The recipient receives all streamed funds up to that point, and the sender gets the remaining balance back.

### What happens when a stream expires?
The stream stops automatically. No more funds flow after the stop time. The recipient can still withdraw any unclaimed balance.

### Do I need to keep the browser open?
No! Streams run on the blockchain, not in your browser. Once created, the stream continues regardless of whether you're online.

## Usage

### How do I get test MNEE tokens?
1. Connect your wallet to the dashboard
2. Go to the Streams tab
3. Click "Mint 1000 MNEE"
4. Confirm the transaction

### How do I create a stream?
1. Go to the Streams tab
2. Enter recipient address, amount, and duration
3. Click "Start Stream"
4. Approve the token allowance (first time only)
5. Confirm the transaction

### How do I withdraw from a stream?
1. Go to the Streams tab
2. Find your incoming stream
3. Click "Withdraw"
4. Confirm the transaction

## Troubleshooting

### "Insufficient funds for gas"
You need Sepolia ETH for gas fees. Get free testnet ETH from:
- https://sepoliafaucet.com
- https://faucet.sepolia.dev

### "MNEE transfer failed"
Check that you have enough MNEE balance and have approved the token allowance.

### "Stream is not active"
The stream may have expired (reached stop time) or been cancelled by either party.

### "Wrong network"
Make sure MetaMask is connected to Sepolia testnet. The app will prompt you to switch if needed.

### Transactions are slow
Sepolia testnet can sometimes be congested. Wait a few minutes and try again, or check the transaction status on Sepolia Etherscan.
`
  }
};

// Sidebar navigation structure
const sidebarNav = [
  {
    title: 'Getting Started',
    items: [
      { id: 'introduction', title: 'Introduction' },
      { id: 'quick-start', title: 'Quick Start' },
      { id: 'installation', title: 'Installation' },
    ]
  },
  {
    title: 'Architecture',
    items: [
      { id: 'architecture', title: 'Overview' },
      { id: 'x402-protocol', title: 'x402 Protocol' },
      { id: 'payment-streams', title: 'Payment Streams' },
    ]
  },
  {
    title: 'Smart Contracts',
    items: [
      { id: 'morphstream-contract', title: 'MorphStream' },
      { id: 'mnee-token', title: 'MockMNEE Token' },
    ]
  },
  {
    title: 'Reference',
    items: [
      { id: 'sdk-reference', title: 'Dashboard Guide' },
      { id: 'deployment', title: 'Deployment' },
      { id: 'faq', title: 'FAQ' },
    ]
  }
];

// Simple markdown renderer
const renderMarkdown = (content) => {
  const lines = content.trim().split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeContent = [];
  let codeLanguage = '';
  let inTable = false;
  let tableRows = [];

  const processInlineCode = (text) => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-surface-700 px-1.5 py-0.5 rounded text-cyan-300 text-sm font-mono">{part.slice(1, -1)}</code>;
      }
      // Bold
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bp, j) => {
        if (bp.startsWith('**') && bp.endsWith('**')) {
          return <strong key={`${i}-${j}`} className="font-semibold text-white">{bp.slice(2, -2)}</strong>;
        }
        return bp;
      });
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={i} className="bg-surface-900 border border-white/10 rounded-lg p-4 overflow-x-auto my-4">
            <code className="text-sm font-mono text-gray-300">{codeContent.join('\n')}</code>
          </pre>
        );
        codeContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLanguage = line.slice(3);
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // Tables
    if (line.startsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      if (!line.includes('---')) {
        tableRows.push(line.split('|').filter(c => c.trim()).map(c => c.trim()));
      }
      continue;
    } else if (inTable) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1);
      elements.push(
        <div key={i} className="overflow-x-auto my-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                {headerRow.map((cell, ci) => (
                  <th key={ci} className="text-left py-2 px-3 text-white/70 font-medium">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri} className="border-b border-white/10">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-2 px-3 text-white/80">{processInlineCode(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableRows = [];
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-3xl font-bold text-white mt-8 mb-4">{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-2xl font-semibold text-white mt-6 mb-3">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-xl font-medium text-white mt-4 mb-2">{line.slice(4)}</h3>);
    }
    // Lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(<li key={i} className="text-white/80 ml-4 my-1 list-disc">{processInlineCode(line.slice(2))}</li>);
    } else if (/^\d+\. /.test(line)) {
      elements.push(<li key={i} className="text-white/80 ml-4 my-1 list-decimal">{processInlineCode(line.replace(/^\d+\. /, ''))}</li>);
    }
    // Blockquotes
    else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-flowpay-500 pl-4 my-4 text-white/70 italic">
          {processInlineCode(line.slice(2))}
        </blockquote>
      );
    }
    // Checkboxes
    else if (line.startsWith('- ✅') || line.startsWith('- ☐')) {
      elements.push(<li key={i} className="text-white/80 ml-4 my-1 list-none">{processInlineCode(line.slice(2))}</li>);
    }
    // Empty lines
    else if (line.trim() === '') {
      continue;
    }
    // Paragraphs
    else {
      elements.push(<p key={i} className="text-white/80 my-3 leading-relaxed">{processInlineCode(line)}</p>);
    }
  }

  return elements;
};

// Sidebar Component
const Sidebar = ({ activeSection, onSectionChange, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 lg:z-0
        w-72 h-screen lg:h-[calc(100vh-4rem)]
        bg-surface-900 lg:bg-transparent
        border-r border-white/10
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-flowpay-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
            <span className="text-lg font-bold text-white">FlowPay Docs</span>
          </a>
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {sidebarNav.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-3">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onSectionChange(item.id);
                        onClose();
                      }}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                        flex items-center gap-2
                        ${activeSection === item.id
                          ? 'bg-flowpay-500/20 text-flowpay-300 border-l-2 border-flowpay-500'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      <span>{docsContent[item.id]?.icon}</span>
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 mt-auto">
          <a 
            href="https://github.com/your-org/flowpay" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>
      </aside>
    </>
  );
};

// Main Docs Component
export default function Docs() {
  const navigate = useNavigate();
  const { section } = useParams();
  const [activeSection, setActiveSection] = useState(section || 'introduction');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (section && docsContent[section]) {
      setActiveSection(section);
    }
  }, [section]);

  const handleSectionChange = (newSection) => {
    setActiveSection(newSection);
    navigate(`/docs/${newSection}`, { replace: true });
    window.scrollTo(0, 0);
  };

  const currentContent = docsContent[activeSection] || docsContent['introduction'];

  // Find prev/next navigation
  const allSections = sidebarNav.flatMap(s => s.items.map(i => i.id));
  const currentIndex = allSections.indexOf(activeSection);
  const prevSection = currentIndex > 0 ? allSections[currentIndex - 1] : null;
  const nextSection = currentIndex < allSections.length - 1 ? allSections[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-surface-900/95 backdrop-blur border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-white/60 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-white">{currentContent.title}</span>
          <a href="/" className="p-2 text-white/60 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </a>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Desktop Header */}
          <header className="hidden lg:flex sticky top-0 z-20 bg-surface-900/95 backdrop-blur border-b border-white/10 h-16 items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <a href="/" className="text-white/60 hover:text-white transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to App
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/your-org/flowpay" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </header>

          {/* Content */}
          <article className="max-w-4xl mx-auto px-6 py-8 lg:px-8 lg:py-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
              <a href="/" className="hover:text-white">Home</a>
              <span>/</span>
              <span className="text-white/70">{currentContent.title}</span>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none">
              {renderMarkdown(currentContent.content)}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
              {prevSection ? (
                <button
                  onClick={() => handleSectionChange(prevSection)}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>{docsContent[prevSection]?.title}</span>
                </button>
              ) : <div />}
              {nextSection && (
                <button
                  onClick={() => handleSectionChange(nextSection)}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  <span>{docsContent[nextSection]?.title}</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}
