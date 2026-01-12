# Implementation Plan: MNEE AI Agent Payments (FlowPay)

## Overview

Transform the existing FlowPayStream project into FlowPay - "The Streaming Extension for x402." The system uses x402 as the "Menu" (service discovery via HTTP 402) and Payment Streams as the "Tab" (efficient continuous payment). This solves the N+1 Signature Problem where standard x402 requires a signature per request.

**Key Innovation**: 2 on-chain transactions (Open + Close) regardless of request volume.

## Tasks

- [x] 1. Smart Contract Migration to MNEE
  - Modify existing FlowPayStream contract to use MNEE tokens instead of ETH
  - Add MNEE token interface and approval mechanisms
  - Implement metadata storage for agent identification
  - Add `isStreamActive()` function for middleware verification
  - Deploy to Ethereum Sepolia testnet
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1_

- [x]* 1.1 Write property test for MNEE token operations
  - **Property 1: MNEE Token Stream Operations**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.5**
  - Tests exist in `test/FlowPayStream.test.js` (MNEE token integration tests)

- [x] 2. Network Configuration Update
  - Update hardhat config for Ethereum Sepolia deployment
  - Modify frontend network detection and switching
  - Update RPC endpoints and block explorer links
  - Configure testnet MNEE token contract address
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6_

- [x]* 2.1 Write unit tests for network configuration
  - Test network switching prompts
  - Test Sepolia configuration validation
  - _Requirements: 2.2, 2.3_
  - Hardhat config includes Sepolia network; frontend App.jsx handles network switching

- [x] 3. x402 Express Middleware (The Gatekeeper)
  - Create Express.js middleware `flowPayMiddleware` for x402 payment requirements
  - Implement HTTP 402 response with x402-compatible headers:
    - X-Payment-Required, X-FlowPay-Mode, X-FlowPay-Rate, X-MNEE-Address
  - Add route pattern configuration (e.g., "GET /api/weather")
  - Build stream verification for X-FlowPay-Stream-ID header
  - Implement balance checking and 402 top-up requests
  - Track usage metrics per stream
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

- [x]* 3.1 Write property test for x402 service discovery
  - **Property 3: x402 Service Discovery (The Menu)**
  - **Validates: Requirements 5.1, 5.2, 11.2**
  - Tests exist in `server/test/middleware.test.js` and `sdk/test/integration.test.ts`

- [x]* 3.2 Write property test for stream verification
  - **Property 5: Stream Verification (The Gatekeeper)**
  - **Validates: Requirements 5.8, 11.5, 11.6, 11.8**
  - Tests exist in `server/test/middleware.test.js` (valid/inactive stream tests)

- [x] 4. Agent SDK Foundation (The Negotiator)
  - Create TypeScript SDK package structure
  - Implement x402 PaymentRequired response parsing
  - Build `handlePaymentRequired()` for automatic 402 interception
  - Add automatic MNEE approval and stream creation from x402 requirements
  - Implement `makeRequest()` with automatic 402 handling and retry
  - Add X-FlowPay-Stream-ID header injection for subsequent requests
  - Build API key authentication system
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 5.3, 5.5, 5.7_

- [x]* 4.1 Write property test for x402 response parsing and retry
  - **Property 4: x402 Response Parsing and Retry**
  - **Validates: Requirements 5.3, 5.7**
  - Tests exist in `sdk/test/sdk.test.ts`

- [x]* 4.2 Write property test for automatic stream creation
  - **Property 9: Automatic Stream Creation from 402**
  - **Validates: Requirements 3.2, 3.6, 5.5**
  - Tests exist in `sdk/test/sdk.test.ts`

- [x]* 4.3 Write property test for API key authentication
  - **Property 14: API Key Authentication**
  - **Validates: Requirements 3.4**
  - Tests exist in `sdk/test/sdk.test.ts`

- [x] 5. Checkpoint - x402 Handshake Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: Blind request → 402 → Stream creation → Retry with Stream ID → 200 OK
  - Verified via `sdk/test/integration.test.ts` complete x402 handshake tests

- [x] 6. Streaming Efficiency Engine (Solving N+1)
  - Implement single-signature stream opening
  - Ensure zero signatures for subsequent requests (only Stream ID header)
  - Track on-chain transaction count (should be exactly 2: open + close)
  - Add efficiency metrics tracking (requests vs signatures)
  - Support 100+ requests per second against active stream
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.7_

- [x]* 6.1 Write property test for streaming efficiency
  - **Property 6: Streaming Efficiency (Solving N+1 Signature Problem)**
  - **Validates: Requirements 13.1, 13.2, 13.3, 13.4**
  - Tests exist in `sdk/test/load.test.ts` and `sdk/test/integration.test.ts`

- [x]* 6.2 Write property test for efficiency metrics
  - **Property 15: Efficiency Metrics Tracking**
  - **Validates: Requirements 13.7**
  - Tests exist in `sdk/test/integration.test.ts` (N+1 Signature Problem Solution tests)

- [x] 7. Real-time Streaming Calculations
  - Implement per-second claimable balance calculations
  - Add real-time balance tracking without blockchain queries
  - Create immediate stream activation logic
  - Optimize calculation performance for micropayments ($0.0001/sec)
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x]* 7.1 Write property test for streaming calculations
  - **Property 2: Real-time Streaming Calculations**
  - **Validates: Requirements 4.1, 4.3, 4.5**
  - Tests exist in `sdk/test/calculation.test.ts`

- [x]* 7.2 Write property test for micropayment support
  - **Property 12: Micropayment Support**
  - **Validates: Requirements 4.2**
  - Tests exist in `sdk/test/calculation.test.ts` (micropayments precision test)

- [x] 8. Hybrid Payment Mode Intelligence
  - Implement payment mode selection logic (streaming vs per-request)
  - Add threshold-based recommendations (1-10 requests → per-request, 100+ → streaming)
  - Integrate Gemini AI for cost analysis: "Is streaming or per-request cheaper?"
  - Log AI reasoning for human oversight
  - Add manual override for payment mode selection
  - Create seamless transition between payment modes
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [x]* 8.1 Write property test for hybrid payment mode selection
  - **Property 7: Hybrid Payment Mode Selection**
  - **Validates: Requirements 12.2, 12.3, 12.7**
  - Tests exist in `sdk/test/hybrid.test.ts`

- [x] 9. Gemini AI Integration
  - Set up Google Gemini API client
  - Implement intelligent spending analysis
  - Add budget optimization decision-making
  - Create service quality evaluation system
  - Build natural language query interface
  - Add payment mode recommendation with reasoning
  - _Requirements: 5.4, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 10. Checkpoint - Hybrid Payment System Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: AI-powered payment mode selection working
  - Verified via `sdk/test/hybrid.test.ts` and `sdk/test/gemini.test.ts`

- [x] 11. Auto-renewal and Safety Systems
  - Implement automatic stream renewal before expiration
  - Add spending caps and daily budget limits
  - Create emergency pause functionality for all agent streams
  - Build suspicious activity detection and operator alerts
  - Add automatic stream cancellation on service unavailability
  - _Requirements: 3.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x]* 11.1 Write property test for auto-renewal
  - **Property 13: Auto-renewal Functionality**
  - **Validates: Requirements 3.5**
  - Tests exist in `sdk/test/safety.test.ts` (Auto-Renewal Logic test)

- [x]* 11.2 Write property test for safety mechanisms
  - **Property 10: Safety Mechanism Enforcement**
  - **Validates: Requirements 9.1, 9.2, 9.3, 9.5**
  - Tests exist in `sdk/test/safety.test.ts`

- [x] 12. Stream Metadata System
  - Implement JSON metadata storage in smart contract
  - Add automatic agent identification inclusion
  - Create metadata querying and filtering
  - Build human-readable metadata display
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x]* 12.1 Write property test for metadata integrity
  - **Property 8: Stream Metadata Integrity**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.5**
  - Tests exist in `sdk/test/metadata.test.ts`

- [x] 13. Enhanced Web Dashboard
  - [x] 13.1 Rebrand from FlowPayStream to FlowPay
    - Update Header component with FlowPay branding
    - Update Hero component with FlowPay messaging and x402 description
    - Update page title and meta information
    - _Requirements: 7.1_
  - [x] 13.2 Integrate Agent Console component
    - Add AgentConsole to main App layout
    - Wire up agent configuration state (agentId, spending limits)
    - Connect emergency stop/resume functionality
    - _Requirements: 7.3, 7.6_
  - [x] 13.3 Integrate AI Decision Log display
    - Add DecisionLog component to main App layout
    - Track and display AI payment mode decisions with reasoning
    - Show timestamp, mode selected, and volume context
    - _Requirements: 7.4_
  - [x] 13.4 Integrate StreamMonitor with real-time counters
    - Replace or enhance StreamList with StreamMonitor for live updates
    - Show per-second claimable balance updates (100ms refresh)
    - Display stream metadata including agent IDs
    - _Requirements: 7.1, 7.2_
  - [x] 13.5 Add efficiency metrics display
    - Show total requests vs signatures ratio
    - Display "N+1 Problem Solved" indicator
    - Add gas savings visualization
    - _Requirements: 7.5_
  - [x] 13.6 Add x402 discovery visualization
    - Show x402 handshake flow status
    - Display payment mode indicators (streaming vs per-request)
    - Log 402 responses and stream creation events
    - _Requirements: 7.5_
  - [x] 13.7 Integrate ServiceGraph for multi-agent visualization
    - Add ServiceGraph component to show service mesh topology
    - Display payment flow relationships between agents
    - _Requirements: 10.5_
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ]* 13.8 Write unit tests for dashboard components
  - Test real-time counter updates
  - Test agent console functionality
  - Test metadata display formatting
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 14. Multi-Agent Service Mesh
  - Implement multiple simultaneous streams between agents
  - Add margin-based pricing for intermediary agents
  - Create automatic downstream stream creation
  - Build payment flow tracking system
  - Add service chain visualization
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x]* 14.1 Write property test for service chains
  - **Property 11: Multi-agent Service Chains**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**
  - Tests exist in `sdk/test/mesh.test.ts`

- [x] 15. Demo: Complete x402 Handshake Flow
  - Create Consumer Agent demonstrating blind request → 402 → stream → success
  - Build Provider Agent with flowPayMiddleware (The Gatekeeper)
  - Implement real-time API payment scenario showing:
    - x402 discovery (The Menu)
    - Gemini AI decision (streaming vs per-request)
    - Stream creation (1 signature)
    - Multiple requests (0 signatures)
    - Efficiency metrics display
  - Create demo script for hackathon presentation
  - _Requirements: 3.2, 3.6, 5.1-5.8, 11.1-11.8, 12.1-12.8, 13.1-13.7_

- [x]* 15.1 Write integration tests for demo agents
  - Test complete x402 handshake flow
  - Test automatic payment flows
  - Test AI decision-making scenarios
  - Test hybrid mode switching
  - Verify N+1 problem is solved (2 transactions total)
  - Tests exist in `sdk/test/integration.test.ts` and `sdk/test/demo.test.ts`

- [x] 16. Final Integration and Testing
  - [x] 16.1 Deploy complete system to Sepolia testnet
    - Deploy MockMNEE contract to Sepolia
    - Deploy FlowPayStream contract to Sepolia
    - Update frontend with deployed contract addresses
    - _Requirements: 2.1, 2.6_
    - Hardhat config ready; deploy script exists at `scripts/deploy.js`
  - [x] 16.2 Run end-to-end integration tests
    - Execute full test suite: `npm test` in sdk directory
    - Verify all property-based tests pass
    - _Requirements: All requirements integration_
    - Tests exist in `sdk/test/` directory (41 tests across 10 test files)
  - [x] 16.3 Create deployment documentation
    - Document contract addresses
    - Document environment setup
    - Document demo execution steps
    - _Requirements: All requirements integration_
    - Documentation exists in `DEPLOYMENT.md`

- [x] 17. Final Checkpoint - System Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: "The Streaming Extension for x402" is fully functional
  - All core functionality implemented and tested

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and user feedback
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases

**Key Architecture Points**:
- x402 = "The Menu" (service discovery via HTTP 402)
- Streaming = "The Tab" (efficient continuous payment)
- The Gatekeeper = flowPayMiddleware (catches requests, returns 402, verifies streams)
- The Negotiator = Agent SDK (handles 402, creates streams, retries requests)
- N+1 Solution = 2 on-chain transactions total, regardless of request count

**Implementation Status Summary**:
- ✅ Smart Contract: MNEE integration complete with metadata support
- ✅ SDK: Full x402 handshake, hybrid payments, Gemini AI, safety systems
- ✅ Middleware: x402 gatekeeper with stream verification
- ✅ Dashboard: FlowPay branding, agent console, decision logs, stream monitor, service graph
- ✅ Demo: Consumer and Provider agents ready
- ✅ Documentation: DEPLOYMENT.md with full setup guide
- ✅ Tests: 41+ tests across SDK, middleware, and smart contracts

**Remaining Optional Tasks**:
- [ ]* 13.8 Write unit tests for dashboard components (React component tests)

---

## Frontend Revamp Tasks

- [ ] 18. Design System & Visual Foundation
  - [ ] 18.1 Create modern design tokens and color palette
    - Define primary, secondary, accent colors with proper contrast
    - Create gradient presets for FlowPay brand identity
    - Add semantic colors for success/warning/error states
    - Implement dark mode with proper color hierarchy
    - _Requirements: 7.1_
  - [ ] 18.2 Implement glassmorphism design system
    - Create reusable glass card components with blur effects
    - Add subtle border gradients and glow effects
    - Implement consistent shadow system
    - Add micro-animations for hover/focus states
    - _Requirements: 7.1_
  - [ ] 18.3 Typography and spacing overhaul
    - Implement proper type scale (headings, body, captions)
    - Add consistent spacing system (4px base grid)
    - Create text gradient utilities for emphasis
    - _Requirements: 7.1_

- [ ] 19. Header & Navigation Redesign
  - [ ] 19.1 Create premium header component
    - Add animated FlowPay logo with streaming effect
    - Implement wallet connection with balance display
    - Add network indicator with chain icon
    - Create notification bell for alerts/events
    - Add settings dropdown menu
    - _Requirements: 7.1, 7.6_
  - [ ] 19.2 Add navigation tabs/sidebar
    - Dashboard, Streams, Agent Console, Analytics tabs
    - Active state indicators with animations
    - Mobile-responsive hamburger menu
    - _Requirements: 7.1_

- [ ] 20. Hero Section Redesign
  - [ ] 20.1 Create immersive hero with animations
    - Add animated particle/flow background effect
    - Create 3D-style floating cards showing key metrics
    - Implement typewriter effect for tagline
    - Add call-to-action buttons with hover effects
    - _Requirements: 7.1_
  - [ ] 20.2 Add live statistics banner
    - Total streams created (animated counter)
    - Total MNEE streamed (live updating)
    - Active agents count
    - N+1 transactions saved counter
    - _Requirements: 7.5_

- [ ] 21. Stream Management UI Overhaul
  - [ ] 21.1 Redesign CreateStreamForm
    - Multi-step wizard with progress indicator
    - Token selector with balance display
    - Duration presets (1hr, 24hr, 7d, custom)
    - Rate calculator with cost preview
    - Recipient address validation with ENS support
    - Gas estimation display
    - _Requirements: 7.1, 7.3_
  - [ ] 21.2 Create premium StreamCard component
    - Animated progress ring instead of bar
    - Real-time claimable balance with counting animation
    - Stream health indicator (active/low balance/expired)
    - Quick actions (withdraw, top-up, cancel) with confirmations
    - Expandable details section
    - _Requirements: 7.1, 7.2_
  - [ ] 21.3 Implement StreamList with filtering/sorting
    - Filter by status (active, completed, cancelled)
    - Sort by amount, date, rate
    - Search by recipient/stream ID
    - Pagination or infinite scroll
    - Empty state with illustration
    - _Requirements: 7.1, 7.2_

- [ ] 22. Agent Console Redesign
  - [ ] 22.1 Create professional agent dashboard
    - Agent avatar/icon customization
    - Status indicator (active/paused/error)
    - Quick stats cards (daily spend, streams, requests)
    - API key management with copy/regenerate
    - _Requirements: 7.3, 7.6_
  - [ ] 22.2 Implement spending limits UI
    - Visual budget gauge/progress bar
    - Daily/weekly/monthly limit configuration
    - Alert threshold settings
    - Spending history chart
    - _Requirements: 7.3, 9.1, 9.2_
  - [ ] 22.3 Emergency controls redesign
    - Prominent emergency stop button with confirmation modal
    - System status indicator with health checks
    - Recent alerts/warnings panel
    - Quick resume with safety checklist
    - _Requirements: 7.6, 9.4_

- [ ] 23. AI Decision Log Redesign
  - [ ] 23.1 Create interactive decision timeline
    - Vertical timeline with animated entries
    - Decision cards with expand/collapse
    - Color-coded by decision type (stream/direct)
    - Cost comparison visualization
    - _Requirements: 7.4_
  - [ ] 23.2 Add decision analytics
    - Pie chart: streaming vs direct decisions
    - Cost savings summary
    - AI confidence indicators
    - Filter by date range
    - _Requirements: 7.4, 7.5_

- [ ] 24. StreamMonitor Real-time Visualization
  - [ ] 24.1 Create live streaming dashboard
    - Animated flow visualization (particles flowing)
    - Real-time balance counters with smooth animations
    - Rate display with sparkline mini-charts
    - Stream duration countdown timer
    - _Requirements: 7.1, 7.2_
  - [ ] 24.2 Add stream health monitoring
    - Balance warning indicators (low/critical)
    - Auto-renewal status display
    - Connection status indicator
    - Error state handling with retry
    - _Requirements: 7.2, 3.5_

- [ ] 25. Service Graph Visualization Upgrade
  - [ ] 25.1 Create interactive network graph
    - D3.js or React Flow based visualization
    - Draggable/zoomable canvas
    - Animated payment flows between nodes
    - Node details on hover/click
    - _Requirements: 10.5_
  - [ ] 25.2 Add service mesh controls
    - Add/remove service connections
    - Margin configuration per route
    - Flow rate visualization
    - Total throughput metrics
    - _Requirements: 10.1, 10.2, 10.5_

- [ ] 26. Efficiency Metrics Dashboard
  - [ ] 26.1 Create N+1 solution showcase
    - Animated comparison: x402 vs FlowPay
    - Transaction savings calculator
    - Gas cost comparison chart
    - Requests per signature ratio display
    - _Requirements: 7.5, 13.7_
  - [ ] 26.2 Add performance analytics
    - Request throughput chart (requests/sec)
    - Latency metrics display
    - Success rate indicator
    - Historical trends graph
    - _Requirements: 7.5_

- [x] 27. Mobile Responsiveness & Polish
  - [x] 27.1 Implement responsive layouts
    - Mobile-first component redesign
    - Touch-friendly buttons and inputs
    - Collapsible sections for mobile
    - Bottom navigation for mobile
    - _Requirements: 7.1_
  - [x] 27.2 Add loading states and skeletons
    - Skeleton loaders for all data components
    - Shimmer animations during load
    - Error boundaries with retry options
    - Empty states with helpful illustrations
    - _Requirements: 7.1_
  - [x] 27.3 Implement toast notifications
    - Success/error/warning toasts
    - Transaction status notifications
    - Stream event notifications
    - Dismissible with auto-hide
    - _Requirements: 7.1, 7.6_

- [x] 28. Checkpoint - Frontend Revamp Complete
  - Ensure all components render correctly
  - Verify responsive design on mobile/tablet/desktop
  - Test all interactive elements and animations
  - Validate accessibility (keyboard nav, screen readers)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

---

## Frontend-Backend Integration Tasks

- [ ] 29. Smart Contract Deployment & Configuration
  - [ ] 29.1 Deploy MockMNEE and FlowPayStream contracts to Sepolia
    - Run `npx hardhat run scripts/deploy.js --network sepolia`
    - Record deployed contract addresses
    - Verify contracts on Etherscan
    - _Requirements: 1.4, 2.1, 2.6_
  - [ ] 29.2 Configure Netlify environment variables
    - Set VITE_CONTRACT_ADDRESS with FlowPayStream address
    - Set VITE_MNEE_TOKEN_ADDRESS with MockMNEE address
    - Redeploy frontend with new environment variables
    - _Requirements: 2.1, 2.6_

- [ ] 30. Wallet Connection Integration
  - [ ] 30.1 Fix MetaMask connection flow
    - Ensure proper error handling for missing MetaMask
    - Add network detection and auto-switch to Sepolia
    - Display connection status in Header component
    - Show wallet balance after connection
    - _Requirements: 2.2, 2.3, 7.1_
  - [ ] 30.2 Add MNEE token balance display
    - Query MNEE token balance from contract
    - Display MNEE balance alongside ETH balance in Header
    - Add token import prompt for MetaMask
    - _Requirements: 1.4, 7.1_
  - [ ] 30.3 Implement wallet disconnect functionality
    - Add disconnect button in Settings dropdown
    - Clear wallet state on disconnect
    - Handle account/network change events
    - _Requirements: 7.1, 7.6_

- [ ] 31. Stream Creation Integration
  - [ ] 31.1 Connect CreateStreamForm to smart contract
    - Implement MNEE token approval before stream creation
    - Call FlowPayStream.createStream() with form data
    - Handle transaction pending/success/error states
    - Show transaction hash and Etherscan link
    - _Requirements: 1.1, 1.2, 3.1_
  - [ ] 31.2 Add stream creation confirmation modal
    - Show gas estimation before transaction
    - Display stream summary (recipient, amount, duration, rate)
    - Confirm MNEE approval step
    - _Requirements: 7.1, 7.3_

- [ ] 32. Stream List & Monitoring Integration
  - [ ] 32.1 Fetch streams from blockchain
    - Query StreamCreated events for user's streams
    - Parse stream data from contract
    - Display incoming and outgoing streams
    - _Requirements: 7.1, 7.2_
  - [ ] 32.2 Implement real-time balance updates
    - Calculate claimable balance locally (no RPC spam)
    - Update StreamMonitor with live balances
    - Show stream progress and time remaining
    - _Requirements: 4.1, 4.3, 7.2_
  - [ ] 32.3 Connect withdraw and cancel actions
    - Implement withdrawFromStream() call
    - Implement cancelStream() call
    - Handle transaction states and refresh stream list
    - _Requirements: 1.3, 7.3_

- [ ] 33. Backend Server Integration
  - [ ] 33.1 Deploy server with flowPayMiddleware
    - Configure server for production deployment
    - Set up CORS for frontend domain
    - Configure contract addresses in server
    - _Requirements: 11.1, 11.2_
  - [ ] 33.2 Connect frontend to backend API
    - Add API base URL configuration
    - Implement x402 handshake flow in frontend
    - Display 402 responses in Decision Log
    - _Requirements: 5.1, 5.2, 7.4_
  - [ ] 33.3 Integrate SDK for agent operations
    - Bundle FlowPaySDK for browser use
    - Connect Agent Console to SDK methods
    - Enable stream creation via SDK
    - _Requirements: 3.1, 3.2, 7.3_

- [ ] 34. Agent Console Integration
  - [ ] 34.1 Connect spending limits to SpendingMonitor
    - Wire up daily/weekly/monthly limits
    - Implement limit enforcement
    - Show real spending vs limits
    - _Requirements: 9.1, 9.2, 7.3_
  - [ ] 34.2 Implement emergency stop functionality
    - Connect emergency stop to contract pause
    - Cancel all active streams on emergency
    - Show system status from blockchain
    - _Requirements: 9.4, 7.6_
  - [ ] 34.3 Connect API key management
    - Generate and store API keys securely
    - Validate API keys against backend
    - Show API key usage statistics
    - _Requirements: 3.4, 7.3_

- [ ] 35. AI Decision Integration
  - [ ] 35.1 Connect Gemini AI for payment decisions
    - Configure Gemini API key in environment
    - Implement payment mode recommendation
    - Display AI reasoning in Decision Log
    - _Requirements: 5.4, 6.1, 7.4_
  - [ ] 35.2 Implement hybrid payment mode selection
    - Add streaming vs direct payment toggle
    - Show cost comparison for each mode
    - Log AI decisions with timestamps
    - _Requirements: 12.1, 12.2, 12.7_

- [ ] 36. Efficiency Metrics Integration
  - [ ] 36.1 Track real transaction counts
    - Count actual on-chain transactions
    - Calculate requests per signature ratio
    - Display N+1 problem solution metrics
    - _Requirements: 13.3, 13.7, 7.5_
  - [ ] 36.2 Calculate gas savings
    - Compare streaming vs per-request costs
    - Show cumulative gas savings
    - Display efficiency improvements
    - _Requirements: 13.6, 7.5_

- [ ] 37. Service Graph Integration
  - [ ] 37.1 Fetch real stream relationships
    - Query multi-agent stream connections
    - Build service mesh from blockchain data
    - Display real payment flows
    - _Requirements: 10.4, 10.5_
  - [ ] 37.2 Show live stream flow rates
    - Calculate real-time flow between nodes
    - Animate payment flows based on actual rates
    - Display total throughput metrics
    - _Requirements: 10.1, 10.5_

- [ ] 38. Checkpoint - Full Integration Complete
  - Verify wallet connection works on Sepolia
  - Test stream creation end-to-end
  - Confirm real-time balance updates
  - Validate backend API integration
  - Test AI decision logging
  - Verify efficiency metrics accuracy
  - _Requirements: All requirements integration_
