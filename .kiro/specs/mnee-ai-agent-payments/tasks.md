# Implementation Plan: MNEE AI Agent Payments (FlowPay)

## Overview

Transform the existing MorphStream project into FlowPay - "The Streaming Extension for x402." The system uses x402 as the "Menu" (service discovery via HTTP 402) and Payment Streams as the "Tab" (efficient continuous payment). This solves the N+1 Signature Problem where standard x402 requires a signature per request.

**Key Innovation**: 2 on-chain transactions (Open + Close) regardless of request volume.

## Tasks

- [ ] 1. Smart Contract Migration to MNEE
  - Modify existing MorphStream contract to use MNEE tokens instead of ETH
  - Add MNEE token interface and approval mechanisms
  - Implement metadata storage for agent identification
  - Add `isStreamActive()` function for middleware verification
  - Deploy to Ethereum Sepolia testnet
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1_

- [ ]* 1.1 Write property test for MNEE token operations
  - **Property 1: MNEE Token Stream Operations**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.5**

- [ ] 2. Network Configuration Update
  - Update hardhat config for Ethereum Sepolia deployment
  - Modify frontend network detection and switching
  - Update RPC endpoints and block explorer links
  - Configure testnet MNEE token contract address
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6_

- [ ]* 2.1 Write unit tests for network configuration
  - Test network switching prompts
  - Test Sepolia configuration validation
  - _Requirements: 2.2, 2.3_

- [ ] 3. x402 Express Middleware (The Gatekeeper)
  - Create Express.js middleware `flowPayMiddleware` for x402 payment requirements
  - Implement HTTP 402 response with x402-compatible headers:
    - X-Payment-Required, X-FlowPay-Mode, X-FlowPay-Rate, X-MNEE-Address
  - Add route pattern configuration (e.g., "GET /api/weather")
  - Build stream verification for X-FlowPay-Stream-ID header
  - Implement balance checking and 402 top-up requests
  - Track usage metrics per stream
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

- [ ]* 3.1 Write property test for x402 service discovery
  - **Property 3: x402 Service Discovery (The Menu)**
  - **Validates: Requirements 5.1, 5.2, 11.2**

- [ ]* 3.2 Write property test for stream verification
  - **Property 5: Stream Verification (The Gatekeeper)**
  - **Validates: Requirements 5.8, 11.5, 11.6, 11.8**

- [ ] 4. Agent SDK Foundation (The Negotiator)
  - Create TypeScript SDK package structure
  - Implement x402 PaymentRequired response parsing
  - Build `handlePaymentRequired()` for automatic 402 interception
  - Add automatic MNEE approval and stream creation from x402 requirements
  - Implement `makeRequest()` with automatic 402 handling and retry
  - Add X-FlowPay-Stream-ID header injection for subsequent requests
  - Build API key authentication system
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 5.3, 5.5, 5.7_

- [ ] 4.1 Write property test for x402 response parsing and retry
  - **Property 4: x402 Response Parsing and Retry**
  - **Validates: Requirements 5.3, 5.7**

- [ ] 4.2 Write property test for automatic stream creation
  - **Property 9: Automatic Stream Creation from 402**
  - **Validates: Requirements 3.2, 3.6, 5.5**

- [ ] 4.3 Write property test for API key authentication
  - **Property 14: API Key Authentication**
  - **Validates: Requirements 3.4**

- [ ] 5. Checkpoint - x402 Handshake Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: Blind request → 402 → Stream creation → Retry with Stream ID → 200 OK

- [ ] 6. Streaming Efficiency Engine (Solving N+1)
  - Implement single-signature stream opening
  - Ensure zero signatures for subsequent requests (only Stream ID header)
  - Track on-chain transaction count (should be exactly 2: open + close)
  - Add efficiency metrics tracking (requests vs signatures)
  - Support 100+ requests per second against active stream
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.7_

- [ ]* 6.1 Write property test for streaming efficiency
  - **Property 6: Streaming Efficiency (Solving N+1 Signature Problem)**
  - **Validates: Requirements 13.1, 13.2, 13.3, 13.4**

- [ ]* 6.2 Write property test for efficiency metrics
  - **Property 15: Efficiency Metrics Tracking**
  - **Validates: Requirements 13.7**

- [ ] 7. Real-time Streaming Calculations
  - Implement per-second claimable balance calculations
  - Add real-time balance tracking without blockchain queries
  - Create immediate stream activation logic
  - Optimize calculation performance for micropayments ($0.0001/sec)
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [ ]* 7.1 Write property test for streaming calculations
  - **Property 2: Real-time Streaming Calculations**
  - **Validates: Requirements 4.1, 4.3, 4.5**

- [ ]* 7.2 Write property test for micropayment support
  - **Property 12: Micropayment Support**
  - **Validates: Requirements 4.2**

- [ ] 8. Hybrid Payment Mode Intelligence
  - Implement payment mode selection logic (streaming vs per-request)
  - Add threshold-based recommendations (1-10 requests → per-request, 100+ → streaming)
  - Integrate Gemini AI for cost analysis: "Is streaming or per-request cheaper?"
  - Log AI reasoning for human oversight
  - Add manual override for payment mode selection
  - Create seamless transition between payment modes
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [ ]* 8.1 Write property test for hybrid payment mode selection
  - **Property 7: Hybrid Payment Mode Selection**
  - **Validates: Requirements 12.2, 12.3, 12.7**

- [ ] 9. Gemini AI Integration
  - Set up Google Gemini API client
  - Implement intelligent spending analysis
  - Add budget optimization decision-making
  - Create service quality evaluation system
  - Build natural language query interface
  - Add payment mode recommendation with reasoning
  - _Requirements: 5.4, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 10. Checkpoint - Hybrid Payment System Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: AI-powered payment mode selection working

- [ ] 11. Auto-renewal and Safety Systems
  - Implement automatic stream renewal before expiration
  - Add spending caps and daily budget limits
  - Create emergency pause functionality for all agent streams
  - Build suspicious activity detection and operator alerts
  - Add automatic stream cancellation on service unavailability
  - _Requirements: 3.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 11.1 Write property test for auto-renewal
  - **Property 13: Auto-renewal Functionality**
  - **Validates: Requirements 3.5**

- [ ]* 11.2 Write property test for safety mechanisms
  - **Property 10: Safety Mechanism Enforcement**
  - **Validates: Requirements 9.1, 9.2, 9.3, 9.5**

- [ ] 12. Stream Metadata System
  - Implement JSON metadata storage in smart contract
  - Add automatic agent identification inclusion
  - Create metadata querying and filtering
  - Build human-readable metadata display
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 12.1 Write property test for metadata integrity
  - **Property 8: Stream Metadata Integrity**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.5**

- [ ] 13. Enhanced Web Dashboard
  - Update existing React components for MNEE integration
  - Add real-time balance counters with per-second updates
  - Create agent console for configuration and monitoring
  - Implement AI decision log display with reasoning
  - Add network statistics and explorer features
  - Show x402 discovery logs and payment mode indicators
  - Display efficiency metrics (requests vs signatures)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ]* 13.1 Write unit tests for dashboard components
  - Test real-time counter updates
  - Test agent console functionality
  - Test metadata display formatting
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 14. Multi-Agent Service Mesh
  - Implement multiple simultaneous streams between agents
  - Add margin-based pricing for intermediary agents
  - Create automatic downstream stream creation
  - Build payment flow tracking system
  - Add service chain visualization
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 14.1 Write property test for service chains
  - **Property 11: Multi-agent Service Chains**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**

- [ ] 15. Demo: Complete x402 Handshake Flow
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

- [ ]* 15.1 Write integration tests for demo agents
  - Test complete x402 handshake flow
  - Test automatic payment flows
  - Test AI decision-making scenarios
  - Test hybrid mode switching
  - Verify N+1 problem is solved (2 transactions total)

- [ ] 16. Final Integration and Testing
  - Deploy complete system to Sepolia testnet
  - Run end-to-end integration tests
  - Verify all property-based tests pass
  - Test demo scenarios with real agents using x402 flow
  - Create deployment documentation
  - _Requirements: All requirements integration_

- [ ] 17. Final Checkpoint - System Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: "The Streaming Extension for x402" is fully functional

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