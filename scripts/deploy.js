const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Check if we need to deploy Mock MNEE (for testnets or local)
  // For mainnet, we would use the real MNEE address
  let mneeAddress;

  // You might want to hardcode the address if you already have one on the network
  // const EXISTING_MNEE_ADDRESS = "0x..."; 

  if (hre.network.name === "sepolia" || hre.network.name === "hardhat" || hre.network.name === "localhost") {
    console.log("Deploying MockMNEE...");
    const MockMNEE = await hre.ethers.getContractFactory("MockMNEE");
    const mockMNEE = await MockMNEE.deploy();
    await mockMNEE.waitForDeployment();
    mneeAddress = await mockMNEE.getAddress();
    console.log("MockMNEE deployed to:", mneeAddress);
  } else {
    // Setup for other networks or throw error if address not provided
    throw new Error("MNEE token address required for this network");
  }

  console.log("Deploying FlowPayStream with MNEE address:", mneeAddress);
  const FlowPayStream = await hre.ethers.getContractFactory("FlowPayStream");
  const flowPayStream = await FlowPayStream.deploy(mneeAddress);

  await flowPayStream.waitForDeployment();

  console.log("FlowPayStream deployed to:", await flowPayStream.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });