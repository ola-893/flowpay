// 1. Uses the Vercel Environment Variable if it exists, otherwise falls back to the hardcoded address for local development.
export const contractAddress = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CONTRACT_ADDRESS)
  ? import.meta.env.VITE_CONTRACT_ADDRESS
  : "0x0000000000000000000000000000000000000000"; // Placeholder for Sepolia Deployment

// Placeholder for MNEE Token
export const mneeTokenAddress = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_MNEE_TOKEN_ADDRESS)
  ? import.meta.env.VITE_MNEE_TOKEN_ADDRESS
  : "0x0000000000000000000000000000000000000000";

// 2. Uses the Vercel Environment Variable for the ABI if it exists, otherwise falls back to the hardcoded ABI.
const hardcodedABI = [
  {
    "inputs": [{ "internalType": "address", "name": "_mneeToken", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "streamId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "sender", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "totalAmount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "startTime", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "stopTime", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "metadata", "type": "string" }
    ],
    "name": "StreamCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "streamId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "Withdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "streamId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "sender", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "recipient", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "senderBalance", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "recipientBalance", "type": "uint256" }
    ],
    "name": "StreamCancelled",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "duration", "type": "uint256" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "string", "name": "metadata", "type": "string" }
    ],
    "name": "createStream",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "streamId", "type": "uint256" }],
    "name": "withdrawFromStream",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "streamId", "type": "uint256" }],
    "name": "cancelStream",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "streamId", "type": "uint256" }],
    "name": "getClaimableBalance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "streamId", "type": "uint256" }],
    "name": "isStreamActive",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mneeToken",
    "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "streams",
    "outputs": [
      { "internalType": "address", "name": "sender", "type": "address" },
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "totalAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "flowRate", "type": "uint256" },
      { "internalType": "uint256", "name": "startTime", "type": "uint256" },
      { "internalType": "uint256", "name": "stopTime", "type": "uint256" },
      { "internalType": "uint256", "name": "amountWithdrawn", "type": "uint256" },
      { "internalType": "bool", "name": "isActive", "type": "bool" },
      { "internalType": "string", "name": "metadata", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const contractABI = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CONTRACT_ABI)
  ? JSON.parse(import.meta.env.VITE_CONTRACT_ABI)
  : hardcodedABI;