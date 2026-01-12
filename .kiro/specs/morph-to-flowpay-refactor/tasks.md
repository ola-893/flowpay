# Implementation Plan: Morph to FlowPay Refactor

## Overview

Systematically remove all "Morph" references from the FlowPay project by renaming files and updating content. Changes are ordered to minimize breakage: contracts first, then tests, docs, frontend, and finally verification.

## Tasks

- [x] 1. Smart Contract Refactoring
  - [x] 1.1 Rename and update MorphStream.sol to FlowPayStream.sol
    - Rename file from `contracts/MorphStream.sol` to `contracts/FlowPayStream.sol`
    - Update contract name from `MorphStream` to `FlowPayStream`
    - Update @title and @dev NatSpec comments
    - Replace all "MorphStream:" error prefixes with "FlowPayStream:"
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Clean and recompile contracts
    - Run `npx hardhat clean` to remove old artifacts
    - Run `npx hardhat compile` to generate new artifacts
    - Verify `artifacts/contracts/FlowPayStream.sol/` exists
    - _Requirements: 5.1, 5.2_

- [x] 2. Test File Refactoring
  - [x] 2.1 Rename and update test file
    - Rename `test/MorphStream.test.js` to `test/FlowPayStream.test.js`
    - Update all `MorphStream` references to `FlowPayStream` in test code
    - Update variable names from `morphStream` to `flowPayStream`
    - _Requirements: 2.1, 2.2_

  - [x] 2.2 Update package.json test script
    - Change test script from `MorphStream.test.js` to `FlowPayStream.test.js`
    - _Requirements: 2.3_

  - [x] 2.3 Checkpoint - Verify contract tests pass
    - Run `npm run test:contracts`
    - Ensure all tests pass with new naming
    - _Requirements: 8.1, 8.2_

- [x] 3. Documentation Refactoring
  - [x] 3.1 Rename morphstream.md to flowpaystream.md
    - Rename `docs/contracts/morphstream.md` to `docs/contracts/flowpaystream.md`
    - Update all content within the file to reference FlowPayStream
    - Update variable names in code examples from `morphStream` to `flowPayStream`
    - _Requirements: 3.1, 3.3, 3.4_

  - [x] 3.2 Update docs/SUMMARY.md navigation
    - Change link from `[MorphStream](contracts/morphstream.md)` to `[FlowPayStream](contracts/flowpaystream.md)`
    - _Requirements: 3.2_

  - [x] 3.3 Update remaining docs files
    - Update `docs/README.md` - replace MorphStream references
    - Update `docs/contracts/README.md` - replace MorphStream references
    - Update `docs/contracts/mock-mnee.md` - update code examples
    - Update `docs/contracts/events-errors.md` - if any MorphStream references
    - Update `docs/deployment/README.md` - replace MorphStream references
    - Update `docs/deployment/sepolia.md` - replace MorphStream references
    - Update `docs/getting-started/README.md` - replace MorphStream references
    - Update `docs/getting-started/configuration.md` - replace MorphStream references
    - Update `docs/reference/faq.md` - replace MorphStream references
    - _Requirements: 3.3, 3.4_

  - [x] 3.4 Update root documentation files
    - Update `README.md` - replace all MorphStream references with FlowPayStream
    - Update `DEPLOYMENT.md` - replace all MorphStream references with FlowPayStream
    - Remove any "Morph Holesky" or "Morph network" references
    - _Requirements: 3.3, 3.5_

- [x] 4. Frontend Refactoring
  - [x] 4.1 Update Docs.jsx page
    - Replace all `MorphStream` with `FlowPayStream` in content
    - Update `morphstream-contract` key to `flowpaystream-contract`
    - Update navigation sidebar item from "MorphStream" to "FlowPayStream"
    - Update variable names in code examples
    - _Requirements: 6.1, 6.5_

  - [x] 4.2 Update App.jsx error message
    - Change "Switch to Morph Holesky" to "Switch to Sepolia"
    - _Requirements: 6.2_

  - [x] 4.3 Update contactInfo.js comment
    - Change comment from "MorphStream on Sepolia" to "FlowPayStream on Sepolia"
    - _Requirements: 6.3_

  - [x] 4.4 Update vite-project/README.md
    - Change "MorphStream Frontend" to "FlowPay Frontend"
    - _Requirements: 6.4_

- [x] 5. Demo and Server Refactoring
  - [x] 5.1 Update demo files
    - Update `demo/consumer.ts` - change `MORPHSTREAM_ADDRESS` to `FLOWPAYSTREAM_ADDRESS`
    - Update `demo/demo_script.md` - replace MorphStream references
    - Update `demo/provider.ts` if it contains MorphStream references
    - _Requirements: 4.1_

  - [x] 5.2 Update server middleware
    - Update JSDoc comment in `server/middleware/flowPayMiddleware.js`
    - Change "MorphStream Contract Address" to "FlowPayStream Contract Address"
    - _Requirements: 4.2_

- [x] 6. Configuration and Deploy Script Updates
  - [x] 6.1 Update deploy script
    - Update `scripts/deploy.js` to reference FlowPayStream
    - Update console.log messages
    - Update variable names
    - _Requirements: 5.3_

- [x] 7. Spec Files Update
  - [x] 7.1 Update existing spec files
    - Update `.kiro/specs/mnee-ai-agent-payments/design.md` - replace MorphStream references
    - Update `.kiro/specs/mnee-ai-agent-payments/tasks.md` - replace MorphStream references
    - _Requirements: 7.1, 7.2_

- [x] 8. Final Verification
  - [x] 8.1 Run full test suite
    - Run `npm test` to verify all tests pass
    - _Requirements: 8.1_

  - [x] 8.2 Verify no Morph references remain
    - **Property 1: No Morph References Remain**
    - Run grep to find any remaining MorphStream, morphStream, MORPHSTREAM references
    - Exclude "glassmorphism" (CSS design term)
    - Exclude node_modules and .git directories
    - **Validates: Requirements 3.3, 3.4, 3.5, 8.3**

  - [x] 8.3 Rebuild frontend
    - Navigate to vite-project and run build
    - Verify no build errors
    - _Requirements: 8.2_

## Notes

- Tasks marked with `*` are optional verification steps
- The "glassmorphism" CSS term should NOT be changed - it's a design pattern name unrelated to Morph network
- File renames should use `git mv` when possible to preserve history
- Always run tests after each major phase to catch issues early
