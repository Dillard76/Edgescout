const { ethers } = require("ethers");
require("dotenv").config();

const ABI = [
  "function triggerCircuitBreaker(string calldata reason) external",
  "function circuitBreakerActive() external view returns (bool)"
];

const THRESHOLD_USD = 25000;

async function runSCANNodeRelayer() {
  const provider = new ethers.JsonRpcProvider(process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io");
  const wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3", ABI, wallet);

  console.log("[SCAN Node] Monitoring Nansen v1 Netflow & Whale Cluster alerts...");

  const currentNetflowUSD = -142500;
  const whaleClusterCount = 3;

  if (Math.abs(currentNetflowUSD) > THRESHOLD_USD || whaleClusterCount >= 3) {
    const reason = `Smart Money Netflow (${currentNetflowUSD} USD) > $${THRESHOLD_USD} or 3+ Whale Cluster Alert`;
    console.log(`[ALERT] Tripping Circuit Breaker: ${reason}`);

    const tx = await contract.triggerCircuitBreaker(reason);
    await tx.wait();
    console.log(`[SUCCESS] Circuit Breaker Active. Tx: ${tx.hash}`);
  }
}

if (require.main === module) {
  runSCANNodeRelayer().catch(console.error);
}

module.exports = { runSCANNodeRelayer, THRESHOLD_USD };
