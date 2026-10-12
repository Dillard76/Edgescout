import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("EdgeScoutAcquisition Smart Contract Unit Tests", function () {
  let acquisitionContract, mockNFT, owner, oracle, scanNode, seller, unauthorizedUser;

  const INITIAL_FLOOR_WEI = ethers.parseEther("10.0");
  const EXPECTED_MAX_BID_WEI = ethers.parseEther("8.0");
  const TOKEN_ID = 1;
  const DUMMY_PAYLOAD_HASH = ethers.keccak256(ethers.toUtf8Bytes("Option_A_Redacted_Payload"));

  beforeEach(async function () {
    [owner, oracle, scanNode, seller, unauthorizedUser] = await ethers.getSigners();

    const MockERC721Factory = await ethers.getContractFactory("MockERC721");
    mockNFT = await MockERC721Factory.deploy("Ry Hawthorne 404", "LOST");
    await mockNFT.waitForDeployment();

    const AcquisitionFactory = await ethers.getContractFactory("EdgeScoutAcquisitionV2");
    acquisitionContract = await AcquisitionFactory.deploy(oracle.address, scanNode.address);
    await acquisitionContract.waitForDeployment();

    await mockNFT.mint(seller.address, TOKEN_ID);
    await mockNFT.connect(seller).approve(await acquisitionContract.getAddress(), TOKEN_ID);
  });

  it("Should enforce 80% valuation ceiling", async function () {
    await acquisitionContract.connect(oracle).updateTargetPrice(TOKEN_ID, INITIAL_FLOOR_WEI, DUMMY_PAYLOAD_HASH);
    expect(await acquisitionContract.maxTargetPriceWei(TOKEN_ID)).to.equal(EXPECTED_MAX_BID_WEI);
  });

  it("Should trip circuit breaker and prevent execution", async function () {
    await acquisitionContract.connect(scanNode).triggerCircuitBreaker("Smart Money Outflow > $25k");
    expect(await acquisitionContract.circuitBreakerActive()).to.be.true;

    await expect(
      acquisitionContract.connect(oracle).updateTargetPrice(TOKEN_ID, INITIAL_FLOOR_WEI, DUMMY_PAYLOAD_HASH)
    ).to.be.revertedWith("EdgeScout: Circuit Breaker active due to SCAN Node Risk Alert");
  });

  it("Should execute acquisition within 80% ceiling and transfer NFT", async function () {
    await acquisitionContract.connect(oracle).updateTargetPrice(TOKEN_ID, INITIAL_FLOOR_WEI, DUMMY_PAYLOAD_HASH);
    
    // Attempting to buy at 8.0 ETH (within ceiling)
    await expect(
      acquisitionContract.connect(owner).executeAcquisition(
        await mockNFT.getAddress(),
        TOKEN_ID,
        seller.address,
        { value: EXPECTED_MAX_BID_WEI }
      )
    ).to.emit(acquisitionContract, "AcquisitionExecuted");

    expect(await mockNFT.ownerOf(TOKEN_ID)).to.equal(owner.address);
  });

  it("Should revert acquisition if bid price exceeds 80% ceiling", async function () {
    await acquisitionContract.connect(oracle).updateTargetPrice(TOKEN_ID, INITIAL_FLOOR_WEI, DUMMY_PAYLOAD_HASH);
    
    const OVERPRICED_BID = ethers.parseEther("8.5"); // Exceeds 8.0 ETH ceiling
    await expect(
      acquisitionContract.connect(owner).executeAcquisition(
        await mockNFT.getAddress(),
        TOKEN_ID,
        seller.address,
        { value: OVERPRICED_BID }
      )
    ).to.be.revertedWith("EdgeScout: Executed price exceeds 80% valuation ceiling");
  });
});
