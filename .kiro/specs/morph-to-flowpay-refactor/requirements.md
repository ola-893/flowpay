# Requirements Document

## Introduction

This feature involves removing all references to "Morph" from the FlowPay project since the smart contracts are deployed to Ethereum Sepolia, not Morph network. The goal is to eliminate confusion by renaming the contract from "MorphStream" to "FlowPayStream" and updating all related documentation, code references, and file names while maintaining full project functionality.

## Glossary

- **FlowPayStream**: The renamed smart contract (formerly MorphStream) that handles MNEE token payment streaming
- **MNEE**: The stablecoin token used for payment streams
- **Sepolia**: The Ethereum testnet where the contracts are deployed
- **ABI**: Application Binary Interface - the JSON specification for interacting with smart contracts
- **Refactoring_System**: The system responsible for renaming and updating all project references

## Requirements

### Requirement 1: Smart Contract Renaming

**User Story:** As a developer, I want the smart contract renamed from MorphStream to FlowPayStream, so that the naming reflects the actual deployment network and product branding.

#### Acceptance Criteria

1. WHEN the contract file is renamed, THE Refactoring_System SHALL rename `contracts/MorphStream.sol` to `contracts/FlowPayStream.sol`
2. WHEN the contract code is updated, THE Refactoring_System SHALL rename the contract from `MorphStream` to `FlowPayStream`
3. WHEN error messages are updated, THE Refactoring_System SHALL replace all "MorphStream:" prefixes with "FlowPayStream:" in require statements
4. WHEN the contract NatSpec is updated, THE Refactoring_System SHALL update the @title and @dev comments to reference FlowPayStream and Sepolia

### Requirement 2: Test File Updates

**User Story:** As a developer, I want the test files updated to reference the new contract name, so that tests continue to work correctly.

#### Acceptance Criteria

1. WHEN the test file is renamed, THE Refactoring_System SHALL rename `test/MorphStream.test.js` to `test/FlowPayStream.test.js`
2. WHEN test code is updated, THE Refactoring_System SHALL update all references from MorphStream to FlowPayStream within test files
3. WHEN package.json is updated, THE Refactoring_System SHALL update the test script to reference the new test file name

### Requirement 3: Documentation Updates

**User Story:** As a user reading documentation, I want all docs to reference FlowPayStream instead of MorphStream, so that the documentation is consistent with the codebase.

#### Acceptance Criteria

1. WHEN doc files are renamed, THE Refactoring_System SHALL rename `docs/contracts/morphstream.md` to `docs/contracts/flowpaystream.md`
2. WHEN SUMMARY.md is updated, THE Refactoring_System SHALL update the navigation link from MorphStream to FlowPayStream
3. WHEN documentation content is updated, THE Refactoring_System SHALL replace all MorphStream references with FlowPayStream in markdown files
4. WHEN code examples in docs are updated, THE Refactoring_System SHALL update variable names like `morphStream` to `flowPayStream`
5. WHEN network references are updated, THE Refactoring_System SHALL remove any references to "Morph Holesky" or "Morph network"

### Requirement 4: SDK and Demo Code Updates

**User Story:** As a developer using the SDK, I want all code references updated to FlowPayStream, so that the SDK is consistent with the contract naming.

#### Acceptance Criteria

1. WHEN demo files are updated, THE Refactoring_System SHALL replace `MORPHSTREAM_ADDRESS` with `FLOWPAYSTREAM_ADDRESS` in demo code
2. WHEN middleware comments are updated, THE Refactoring_System SHALL update JSDoc comments referencing MorphStream
3. WHEN SDK code is updated, THE Refactoring_System SHALL update any MorphStream references in SDK source files

### Requirement 5: Build Artifact Updates

**User Story:** As a developer, I want the build artifacts to reflect the new contract name, so that the compiled output is consistent.

#### Acceptance Criteria

1. WHEN contracts are recompiled, THE Refactoring_System SHALL generate new artifacts under `artifacts/contracts/FlowPayStream.sol/`
2. WHEN old artifacts are cleaned, THE Refactoring_System SHALL remove the old `artifacts/contracts/MorphStream.sol/` directory
3. WHEN the deploy script is updated, THE Refactoring_System SHALL update references from MorphStream to FlowPayStream

### Requirement 6: Frontend Updates

**User Story:** As a user of the web dashboard, I want all UI text and code to reference FlowPayStream instead of MorphStream, so that the branding is consistent.

#### Acceptance Criteria

1. WHEN the Docs page is updated, THE Refactoring_System SHALL replace all MorphStream references with FlowPayStream in `vite-project/src/pages/Docs.jsx`
2. WHEN the App component is updated, THE Refactoring_System SHALL update the error message in `vite-project/src/App.jsx` to reference Sepolia instead of "Morph Holesky"
3. WHEN contactInfo is updated, THE Refactoring_System SHALL update the comment in `vite-project/src/contactInfo.js` to reference FlowPayStream
4. WHEN the frontend README is updated, THE Refactoring_System SHALL rename "MorphStream Frontend" to "FlowPay Frontend" in `vite-project/README.md`
5. WHEN the navigation is updated, THE Refactoring_System SHALL update the sidebar item from "MorphStream" to "FlowPayStream" in the docs navigation

### Requirement 7: Existing Spec Updates

**User Story:** As a developer, I want the existing spec files updated to reference FlowPayStream, so that the project documentation is internally consistent.

#### Acceptance Criteria

1. WHEN spec files are updated, THE Refactoring_System SHALL replace MorphStream references with FlowPayStream in `.kiro/specs/` files
2. WHEN task lists are updated, THE Refactoring_System SHALL update task descriptions that mention MorphStream

### Requirement 8: Project Integrity Verification

**User Story:** As a developer, I want the project to remain fully functional after refactoring, so that no functionality is broken.

#### Acceptance Criteria

1. WHEN refactoring is complete, THE Refactoring_System SHALL ensure all tests pass
2. WHEN refactoring is complete, THE Refactoring_System SHALL ensure the contract compiles without errors
3. IF any import paths reference old file names, THEN THE Refactoring_System SHALL update them to the new paths
