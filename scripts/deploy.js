import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying EdgeScoutAcquisitionV2 with account:", deployer.address);

  const oracleAddress = process.env.VISION_PRICER_ORACLE_ADDRESS || deployer.address;
  const relayerAddress = process.env.SCAN_NODE_RELAYER_ADDRESS || deployer.address;

  const ContractFactory = await ethers.getContractFactory("EdgeScoutAcquisitionV2");
  const contract = await ContractFactory.deploy(oracleAddress, relayerAddress);
  await contract.waitForDeployment();

  console.log("EdgeScoutAcquisitionV2 deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
