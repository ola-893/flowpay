# Requirements Document

## Introduction

FlowPay is a hybrid payment protocol that positions itself as "The Streaming Extension for x402." While standard x402 excels at one-off payments (buying a single article, making one API call), it fails at high-frequency agent workloads due to the "N+1 Signature Problem" - every HTTP request requires a unique cryptographic signature and settlement event.

FlowPay solves this by using x402 as the "Menu" (service discovery and price negotiation) and Payment Streams as the "Tab" (efficient continuous payment). This hybrid approach enables:
- **x402 Discovery**: Standard HTTP 402 responses tell agents "Here is what I cost"
- **Streaming Payment**: Agents open a stream once and make thousands of requests against it
- **Zero Per-Request Overhead**: Only 2 on-chain transactions (Open and Close) regardless of request volume
- **AI-Powered Decisions**: Gemini analyzes usage patterns to recommend optimal payment modes

The system uses MNEE stablecoin for payments, deployed on Ethereum Sepolia testnet for development.

## Glossary

- **FlowPay_System**: The complete payment streaming infrastructure including smart contracts, web interface, and agent SDK
- **MNEE_Token**: USD-backed stablecoin contract at 0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF on Ethereum mainnet (testnet version or mock contract for development)
- **Payment_Stream**: A continuous flow of MNEE tokens from sender to recipient at a specified rate per second, acting as an open "tab" for service consumption
- **Agent_SDK**: JavaScript library enabling AI agents to discover services via x402 and create payment streams autonomously
- **Web_Dashboard**: React-based interface for humans to monitor and manage payment streams
- **Stream_Metadata**: JSON data attached to streams containing agent identification and service details
- **Claimable_Balance**: Amount of MNEE tokens a recipient can withdraw from active streams at any given time
- **x402_Protocol**: Coinbase's open standard for HTTP-native payments using HTTP 402 responses - used by FlowPay for service discovery
- **Payment_Required_Response**: HTTP 402 response containing payment requirements per x402 specification, extended with FlowPay streaming headers
- **Facilitator**: Server that verifies and settles x402 payments (optional - FlowPay uses on-chain stream verification instead)
- **x402_Handshake**: The discovery workflow where an agent makes a blind request, receives 402 with pricing, and decides how to pay
- **Stream_ID**: Unique identifier for an active payment stream, passed in X-FlowPay-Stream-ID header for request verification
- **N+1_Signature_Problem**: The inefficiency of standard x402 where every HTTP request requires a separate cryptographic signature

## Requirements

### Requirement 1: MNEE Token Integration

**User Story:** As a system architect, I want to migrate from ETH to MNEE token payments, so that AI agents can make cost-effective micropayments with instant settlement.

#### Acceptance Criteria

1. WHEN creating a payment stream, THE FlowPay_System SHALL use MNEE tokens instead of ETH as the payment currency
2. WHEN a user deposits funds for streaming, THE FlowPay_System SHALL require MNEE token approval before stream creation
3. WHEN withdrawing from a stream, THE FlowPay_System SHALL transfer MNEE tokens to the recipient's wallet
4. THE FlowPay_System SHALL integrate with MNEE token contract (mainnet: 0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF, testnet: mock contract for development)
5. WHEN calculating stream rates, THE FlowPay_System SHALL use MNEE token decimals (18) for precision

### Requirement 2: Ethereum Testnet Migration

**User Story:** As a developer, I want to deploy on Ethereum Sepolia testnet, so that I can test MNEE integration safely before any mainnet deployment.

#### Acceptance Criteria

1. THE FlowPay_System SHALL deploy smart contracts to Ethereum Sepolia testnet for development and testing
2. WHEN users connect wallets, THE FlowPay_System SHALL prompt network switching to Sepolia if on wrong network
3. THE Web_Dashboard SHALL display Sepolia testnet information and block explorer links
4. THE FlowPay_System SHALL use Sepolia-compatible RPC endpoints for blockchain interactions
5. WHEN estimating gas costs, THE FlowPay_System SHALL calculate fees using Sepolia gas prices
6. THE FlowPay_System SHALL use testnet MNEE tokens or mock MNEE contract for testing purposes

### Requirement 3: AI Agent SDK Development

**User Story:** As an AI agent developer, I want a simple SDK for autonomous payments, so that my agents can make streaming payments without human intervention.

#### Acceptance Criteria

1. THE Agent_SDK SHALL provide methods for creating payment streams programmatically
2. WHEN an agent needs to pay for services, THE Agent_SDK SHALL automatically approve MNEE spending and create streams
3. THE Agent_SDK SHALL include methods for checking claimable balances and withdrawing funds
4. WHEN integrating with AI systems, THE Agent_SDK SHALL support API key authentication for secure access
5. THE Agent_SDK SHALL provide auto-renewal functionality to prevent stream interruptions
6. WHEN agents make API calls, THE Agent_SDK SHALL detect payment requirements and create streams automatically

### Requirement 4: Real-Time Payment Streaming

**User Story:** As an AI agent, I want to make continuous per-second payments, so that I can pay for services as I consume them without upfront deposits or batching delays.

#### Acceptance Criteria

1. WHEN a payment stream is active, THE FlowPay_System SHALL calculate claimable amounts based on elapsed time and rate per second
2. THE FlowPay_System SHALL support payment rates as low as $0.0001 per second for micropayment use cases
3. WHEN recipients check balances, THE FlowPay_System SHALL return real-time claimable amounts without blockchain queries
4. THE Web_Dashboard SHALL display live counters showing streaming balances incrementing per second
5. WHEN streams are created, THE FlowPay_System SHALL begin payment flow immediately without delays

### Requirement 5: x402 Handshake Workflow (Service Discovery)

**User Story:** As an AI agent, I want to discover service pricing through the x402 handshake workflow, so that I can automatically understand payment requirements without prior knowledge of costs.

#### Acceptance Criteria

1. WHEN an agent makes a blind HTTP request to a protected endpoint, THE FlowPay_System SHALL respond with HTTP 402 Payment Required
2. THE Payment_Required_Response SHALL include x402-compatible headers: X-Payment-Required, X-FlowPay-Mode, X-FlowPay-Rate, X-MNEE-Address
3. WHEN the Agent_SDK receives a 402 response, THE Agent_SDK SHALL intercept and parse the payment requirements automatically
4. THE Agent_SDK SHALL pass payment requirements to Gemini AI for intelligent payment mode decision
5. WHEN Gemini recommends streaming mode, THE Agent_SDK SHALL approve MNEE and create a payment stream
6. WHEN Gemini recommends per-request mode, THE Agent_SDK SHALL use standard x402 per-request payment
7. WHEN a stream is created, THE Agent_SDK SHALL retry the original request with X-FlowPay-Stream-ID header
8. WHEN the server receives X-FlowPay-Stream-ID, THE FlowPay_System SHALL verify the stream is active on-chain before returning 200 OK

### Requirement 6: Intelligent Payment Management

**User Story:** As an AI agent powered by Gemini, I want to make intelligent decisions about payment streams, so that I can optimize spending and manage resources autonomously.

#### Acceptance Criteria

1. WHEN managing multiple streams, THE Agent_SDK SHALL integrate with Gemini API for intelligent decision-making
2. THE Agent_SDK SHALL analyze spending patterns and recommend stream optimizations using AI reasoning
3. WHEN budget limits are approached, THE Agent_SDK SHALL use Gemini to decide which streams to cancel or adjust
4. THE Agent_SDK SHALL provide natural language interfaces for agents to query payment status and make decisions
5. WHEN service quality changes, THE Agent_SDK SHALL use AI to evaluate whether to continue or switch providers

### Requirement 7: Web Dashboard for Human Oversight

**User Story:** As a human operator, I want a comprehensive dashboard to monitor AI agent payments, so that I can oversee autonomous transactions and intervene when necessary.

#### Acceptance Criteria

1. THE Web_Dashboard SHALL display all active payment streams with real-time balance updates
2. WHEN viewing streams, THE Web_Dashboard SHALL show stream metadata including agent IDs and service purposes
3. THE Web_Dashboard SHALL provide controls for manually canceling streams and withdrawing funds
4. WHEN agents make decisions, THE Web_Dashboard SHALL display AI reasoning and decision logs
5. THE Web_Dashboard SHALL show network statistics including total active streams and volume
6. WHEN configuring agents, THE Web_Dashboard SHALL provide an agent console for API key management and testing

### Requirement 8: Stream Metadata and Traceability

**User Story:** As a system administrator, I want detailed metadata for all payment streams, so that I can track agent behavior and debug payment issues.

#### Acceptance Criteria

1. WHEN creating streams, THE FlowPay_System SHALL store metadata including agent IDs, service types, and purposes
2. THE FlowPay_System SHALL support JSON metadata with fields for agent identification and service contracts
3. WHEN querying streams, THE FlowPay_System SHALL return metadata for filtering and analysis
4. THE Web_Dashboard SHALL display stream metadata in human-readable format
5. THE Agent_SDK SHALL automatically include agent identification in stream metadata

### Requirement 9: Emergency Controls and Safety

**User Story:** As an agent operator, I want emergency controls for payment streams, so that I can prevent runaway spending and handle service failures.

#### Acceptance Criteria

1. WHEN streams exceed spending limits, THE FlowPay_System SHALL provide automatic cancellation mechanisms
2. THE Agent_SDK SHALL support spending caps and daily budget limits for autonomous agents
3. WHEN services become unavailable, THE Agent_SDK SHALL automatically cancel associated payment streams
4. THE FlowPay_System SHALL provide emergency pause functionality for all agent streams
5. WHEN suspicious activity is detected, THE FlowPay_System SHALL alert operators and suggest protective actions

### Requirement 10: Multi-Agent Service Mesh

**User Story:** As a system architect, I want to support complex agent interactions, so that agents can create service chains where Agent A pays Agent B who pays Agent C.

#### Acceptance Criteria

1. THE FlowPay_System SHALL support multiple simultaneous streams between the same agent pairs
2. WHEN agents act as intermediaries, THE FlowPay_System SHALL enable margin-based pricing where agents keep portions of payments
3. THE Agent_SDK SHALL support service chaining where agents automatically create downstream payment streams
4. THE FlowPay_System SHALL track payment flows through multi-agent service chains
5. WHEN service chains are established, THE Web_Dashboard SHALL visualize payment flow relationships


### Requirement 11: x402 Server Middleware (The Gatekeeper)

**User Story:** As a service provider, I want to easily add x402 payment requirements to my API endpoints, so that AI agents can discover pricing and pay via FlowPay streams.

#### Acceptance Criteria

1. THE FlowPay_System SHALL provide Express.js middleware (flowPayMiddleware) for wrapping API endpoints with x402 payment requirements
2. WHEN a request arrives without payment headers, THE middleware SHALL respond with HTTP 402 and x402-compatible PaymentRequired headers
3. THE middleware configuration SHALL support specifying: price (MNEE per request or per second), mode (streaming/per-request), minDeposit, and description
4. WHEN configuring endpoints, THE middleware SHALL accept route patterns like "GET /api/weather" with associated pricing
5. WHEN a request includes X-FlowPay-Stream-ID header, THE middleware SHALL verify the stream is active on-chain
6. WHEN stream verification succeeds, THE middleware SHALL grant access to the protected resource and return 200 OK
7. THE middleware SHALL track usage metrics and update stream consumption data
8. WHEN stream balance is insufficient, THE middleware SHALL respond with 402 requesting stream top-up

### Requirement 12: Hybrid Payment Mode Intelligence

**User Story:** As an AI agent, I want intelligent payment mode selection, so that I can choose streaming for high-volume usage (cheaper) or per-request for occasional calls (simpler).

#### Acceptance Criteria

1. THE Agent_SDK SHALL support both x402 per-request payments AND continuous streaming payments
2. WHEN an agent expects few requests (e.g., 1-10), THE Agent_SDK SHALL recommend x402 per-request mode to avoid stream setup overhead
3. WHEN an agent expects many requests (e.g., 100+), THE Agent_SDK SHALL recommend streaming mode to avoid N+1 signature overhead
4. THE FlowPay_System SHALL allow service providers to specify which payment modes they accept (streaming-only, per-request-only, or both)
5. WHEN switching between modes mid-session, THE Agent_SDK SHALL handle the transition seamlessly without service interruption
6. THE Agent_SDK SHALL use Gemini AI to analyze: "The server wants $X/sec. I need data for Y minutes. Is streaming or per-request cheaper?"
7. WHEN Gemini makes a payment mode decision, THE Agent_SDK SHALL log the reasoning for human oversight
8. THE Agent_SDK SHALL provide manual override for payment mode selection when needed

### Requirement 13: Streaming Efficiency (Solving N+1 Signature Problem)

**User Story:** As an AI agent making high-frequency API calls, I want to avoid signing every request, so that I can make thousands of calls efficiently without computational overhead.

#### Acceptance Criteria

1. WHEN using streaming mode, THE Agent_SDK SHALL require exactly one signature to open the stream, regardless of subsequent request count
2. WHEN a stream is active, THE Agent_SDK SHALL make unlimited requests against that stream with zero additional signatures
3. THE FlowPay_System SHALL require exactly two on-chain transactions per session: stream open and stream close
4. WHEN making requests against an active stream, THE Agent_SDK SHALL only include the X-FlowPay-Stream-ID header (no per-request signatures)
5. THE FlowPay_System SHALL support request rates of 100+ requests per second against a single active stream
6. WHEN comparing to pure x402, THE streaming mode SHALL reduce gas costs by eliminating per-request settlement transactions
7. THE Agent_SDK SHALL track and report efficiency metrics: requests made vs signatures required