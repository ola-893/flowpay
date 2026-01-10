import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Documentation content organized by sections
const docsContent = {
  'introduction': {
    title: 'Introduction',
    icon: '📖',
    content: `
# Welcome to FlowPay

**FlowPay** is the Streaming Extension for x402 - a hybrid payment protocol that solves the N+1 Signature Problem for AI agent payments.

## What is FlowPay?

FlowPay enables AI agents to pay for API services using continuous MNEE token streams instead of individual transactions. This dramatically reduces gas costs and improves efficiency.

### Key Innovation

**2 on-chain transactions** (Open + Close) regardless of request volume.

| Traditional Approach | FlowPay Approach |
|---------------------|------------------|
| 100 requests = 100 signatures | 100 requests = 2 signatures |
| High gas costs | 95% gas savings |
| Slow, blocking | Fast, non-blocking |

## Current Deployment (Sepolia)

| Contract | Address |
|----------|---------|
| MockMNEE | \`0x96B1FE54Ee89811f46ecE4a347950E0D682D3896\` |
| MorphStream | \`0x155A00fBE3D290a8935ca4Bf5244283685Bb0035\` |

## Features

- ✅ **x402 Protocol Support** - Standard HTTP payment negotiation
- ✅ **MNEE Token Streams** - Continuous payment flows  
- ✅ **AI-Powered Decisions** - Gemini AI chooses optimal payment mode
- ✅ **Multi-Agent Support** - Mesh network for agent collaboration
- ✅ **Safety Controls** - Spending limits and emergency stops
`
  },
  'quick-start': {
    title: 'Quick Start',
    icon: '🚀',
    content: `
# Quick Start

Get FlowPay running in under 5 minutes.

## Step 1: Connect Your Wallet

1. Open the FlowPay dashboard
2. Click **Connect Wallet**
3. Select MetaMask and approve the connection
4. Ensure you're on **Sepolia testnet**

## Step 2: Get Test Tokens

You need MNEE tokens to create streams:

1. Navigate to the **Streams** tab
2. Click **Mint 1000 MNEE** button
3. Approve the transaction in MetaMask
4. Wait for confirmation

## Step 3: Create Your First Stream

\`\`\`javascript
// Using the SDK
import { FlowPaySDK } from './sdk/src/FlowPaySDK';

const sdk = new FlowPaySDK({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: 'https://rpc.sepolia.org',
  contractAddress: '0x155A00fBE3D290a8935ca4Bf5244283685Bb0035',
  mneeAddress: '0x96B1FE54Ee89811f46ecE4a347950E0D682D3896'
});

// Create a stream
const streamId = await sdk.createStream({
  recipient: '0x...provider_address',
  amount: '10', // 10 MNEE
  duration: 3600, // 1 hour
});
\`\`\`

## Step 4: Make API Requests

Once your stream is active, make requests to x402-enabled APIs:

\`\`\`javascript
// The SDK handles x402 negotiation automatically
const response = await sdk.request('https://api.provider.com/premium');

// First request: SDK detects 402, creates stream, retries
// Subsequent requests: Use existing stream (no new signatures!)
\`\`\`
`
  },
  'installation': {
    title: 'Installation',
    icon: '📦',
    content: `
# Installation

Install FlowPay components for different use cases.

## For AI Agent Developers (SDK)

\`\`\`bash
cd sdk
npm install
\`\`\`

## For API Providers (Middleware)

\`\`\`bash
cd server
npm install
\`\`\`

### Express.js Integration

\`\`\`javascript
const express = require('express');
const { flowPayMiddleware } = require('./middleware/flowPayMiddleware');

const app = express();

app.use('/api/premium', flowPayMiddleware({
  pricePerRequest: '0.001',
  recipientAddress: '0x...',
  contractAddress: '0x155A00fBE3D290a8935ca4Bf5244283685Bb0035'
}));
\`\`\`

## For Frontend Development

\`\`\`bash
cd vite-project
npm install
npm run dev
\`\`\`

## Environment Variables

Create a \`.env\` file:

\`\`\`bash
PRIVATE_KEY=0x...
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ETHERSCAN_API_KEY=...
GEMINI_API_KEY=...
\`\`\`
`
  },
  'architecture': {
    title: 'Architecture',
    icon: '🏗️',
    content: `
# Architecture Overview

FlowPay is designed as a modular, extensible payment protocol.

## System Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                      FlowPay System                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   Consumer   │───▶│   Provider   │───▶│  Blockchain  │   │
│  │   Agent      │    │   (x402)     │    │  (Sepolia)   │   │
│  │   + SDK      │◀───│              │◀───│              │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│         │                   │                   │            │
│         ▼                   ▼                   ▼            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   Gemini     │    │  Dashboard   │    │  MorphStream │   │
│  │   AI Brain   │    │   (React)    │    │  + MockMNEE  │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## Core Components

| Component | Description |
|-----------|-------------|
| **MorphStream** | Smart contract for payment streams |
| **MockMNEE** | Test ERC-20 token |
| **FlowPaySDK** | Agent SDK for x402 negotiation |
| **flowPayMiddleware** | Express.js x402 middleware |
| **GeminiPaymentBrain** | AI decision engine |
| **SpendingMonitor** | Safety & limits |

## Data Flow

1. Agent → Provider: \`GET /api/premium\`
2. Provider → Agent: \`402 Payment Required + x402 headers\`
3. Agent → AI Brain: Should I stream or pay directly?
4. Agent → Blockchain: Create stream
5. Agent → Provider: Retry with \`X-FlowPay-Stream-ID\`
6. Provider → Agent: \`200 OK + data\`
`
  },
  'x402-protocol': {
    title: 'x402 Protocol',
    icon: '🔄',
    content: `
# x402 Protocol

FlowPay implements the x402 protocol for HTTP-based payment negotiation.

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
`
  },
  'payment-streams': {
    title: 'Payment Streams',
    icon: '💸',
    content: `
# Payment Streams

Payment streams are the core innovation of FlowPay.

## What is a Payment Stream?

A payment stream is a continuous flow of MNEE tokens from sender to recipient over time.

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

### 1. Creation
\`\`\`javascript
await contract.createStream(recipient, duration, amount, metadata);
\`\`\`

### 2. Active Streaming
- Funds accumulate for recipient
- Claimable balance increases per second
- Either party can cancel anytime

### 3. Withdrawal
\`\`\`javascript
await contract.withdrawFromStream(streamId);
\`\`\`

### 4. Completion
- Stream reaches stop time
- All funds claimable by recipient

## Flow Rate Calculation

\`\`\`
flowRate = totalAmount / duration
\`\`\`

**Example:** 3600 MNEE over 1 hour = 1 MNEE/second

## Benefits

| Aspect | Direct Payment | Stream Payment |
|--------|---------------|----------------|
| Signatures | 1 per request | 2 total |
| Gas cost | High | Low |
| Flexibility | None | Cancel anytime |
`
  },
  'morphstream-contract': {
    title: 'MorphStream Contract',
    icon: '📜',
    content: `
# MorphStream Contract

The core payment streaming smart contract.

**Address:** \`0x155A00fBE3D290a8935ca4Bf5244283685Bb0035\`

## Functions

### createStream

Creates a new payment stream.

\`\`\`solidity
function createStream(
    address recipient,
    uint256 duration,
    uint256 amount,
    string memory metadata
) external
\`\`\`

| Parameter | Type | Description |
|-----------|------|-------------|
| recipient | address | Payment receiver |
| duration | uint256 | Stream duration (seconds) |
| amount | uint256 | Total MNEE (wei) |
| metadata | string | JSON metadata |

### withdrawFromStream

Withdraws available funds.

\`\`\`solidity
function withdrawFromStream(uint256 streamId) external
\`\`\`

### cancelStream

Cancels an active stream.

\`\`\`solidity
function cancelStream(uint256 streamId) external
\`\`\`

### getClaimableBalance

Returns withdrawable amount.

\`\`\`solidity
function getClaimableBalance(uint256 streamId) external view returns (uint256)
\`\`\`

## Events

| Event | Description |
|-------|-------------|
| \`StreamCreated\` | New stream created |
| \`Withdrawn\` | Funds withdrawn |
| \`StreamCancelled\` | Stream cancelled |

## Gas Costs

| Function | Gas |
|----------|-----|
| createStream | ~150,000 |
| withdrawFromStream | ~80,000 |
| cancelStream | ~100,000 |
`
  },
  'mnee-token': {
    title: 'MockMNEE Token',
    icon: '🪙',
    content: `
# MockMNEE Token

Test ERC-20 token for FlowPay development.

**Address:** \`0x96B1FE54Ee89811f46ecE4a347950E0D682D3896\`

## Token Details

| Property | Value |
|----------|-------|
| Name | Mock MNEE |
| Symbol | MNEE |
| Decimals | 18 |

## Functions

### Standard ERC-20

\`\`\`solidity
function balanceOf(address account) external view returns (uint256)
function transfer(address recipient, uint256 amount) external returns (bool)
function approve(address spender, uint256 amount) external returns (bool)
function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)
\`\`\`

### mint (Test Only)

Mints new tokens to any address.

\`\`\`solidity
function mint(address to, uint256 amount) external
\`\`\`

## Getting Test Tokens

### Via Dashboard

1. Connect wallet to FlowPay dashboard
2. Go to **Streams** tab
3. Click **Mint 1000 MNEE**
4. Confirm transaction

### Via Code

\`\`\`javascript
const mnee = new ethers.Contract(mneeAddress, mneeABI, signer);
await mnee.mint(myAddress, ethers.parseEther('1000'));
\`\`\`

> ⚠️ **Note:** MockMNEE is for testing only. Production will use real MNEE.
`
  },
  'sdk-reference': {
    title: 'SDK Reference',
    icon: '🛠️',
    content: `
# FlowPaySDK Reference

The main SDK class for AI agent payments.

## Installation

\`\`\`bash
cd sdk && npm install
\`\`\`

## Quick Start

\`\`\`typescript
import { FlowPaySDK } from './FlowPaySDK';

const sdk = new FlowPaySDK({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: 'https://rpc.sepolia.org',
  contractAddress: '0x155A00fBE3D290a8935ca4Bf5244283685Bb0035',
  mneeAddress: '0x96B1FE54Ee89811f46ecE4a347950E0D682D3896'
});

// Make requests - SDK handles x402 automatically
const response = await sdk.request('https://api.provider.com/premium');
\`\`\`

## Configuration

| Option | Type | Description |
|--------|------|-------------|
| privateKey | string | Wallet private key |
| rpcUrl | string | Ethereum RPC endpoint |
| contractAddress | string | MorphStream address |
| mneeAddress | string | MNEE token address |
| agentId | string | Unique agent ID |
| defaultStreamDuration | number | Default duration (seconds) |

## Methods

### request(url, options)
Makes HTTP request with automatic x402 handling.

### createStream(params)
Creates a new payment stream.

### getStream(streamId)
Gets stream details.

### withdrawFromStream(streamId)
Withdraws available funds.

### cancelStream(streamId)
Cancels an active stream.

### getMneeBalance(address?)
Gets MNEE token balance.
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
FlowPay is a payment streaming protocol that enables AI agents to pay for API services using continuous MNEE token streams.

### What problem does FlowPay solve?
FlowPay solves the **N+1 Signature Problem**: traditionally, N API requests require N payment signatures. FlowPay reduces this to just 2 signatures.

### Which networks are supported?
Currently Ethereum Sepolia testnet. Mainnet deployment is planned.

## Technical

### How is the flow rate calculated?
\`flowRate = totalAmount / duration\`

### Can I cancel a stream?
Yes, both sender and recipient can cancel anytime. Recipient gets streamed amount, sender gets remaining.

### What happens when a stream expires?
No more funds flow. Recipient can still withdraw unclaimed balance.

## Usage

### How do I get test MNEE tokens?
1. Connect wallet to dashboard
2. Go to Streams tab
3. Click "Mint 1000 MNEE"

### How do I create a stream?
Via Dashboard or SDK - enter recipient, amount, duration.

## Troubleshooting

### "Insufficient funds for gas"
Get Sepolia ETH from faucets.

### "MNEE transfer failed"
Check balance and token approval.

### "Stream is not active"
Stream may have expired or been cancelled.
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
      { id: 'sdk-reference', title: 'SDK Reference' },
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
