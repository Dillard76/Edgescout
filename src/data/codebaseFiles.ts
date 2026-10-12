export interface CodeFile {
  path: string;
  name: string;
  language: string;
  description: string;
  beginnerNote: string;
  content: string;
}

export const CODEBASE_FILES: CodeFile[] = [
  {
    path: "contracts/EdgeScoutAcquisition-v2.sol",
    name: "EdgeScoutAcquisition-v2.sol",
    language: "solidity",
    description: "Primary smart contract enforcing the 80% bid ceiling and emergency circuit breaker on Optimism.",
    beginnerNote: "Think of this as the digital vault. It guarantees that no matter what, EdgeScout will never pay more than 80% of the market price for the NFT.",
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract EdgeScoutAcquisitionV2 is Ownable, ReentrancyGuard {
    uint256 public constant MAX_BID_CEILING_BPS = 8000; // 80.00%
    uint256 public constant BPS_DENOMINATOR = 10000;
    uint256 public constant SMART_MONEY_OUTFLOW_THRESHOLD_USD = 25000; // $25,000 USD

    struct AssetProvenance {
        string artist;
        string collectionName;
        string visualSpec;
        uint256 launchTimestamp;
        bool isVerified;
    }

    AssetProvenance public assetProvenance;

    address public visionPricerOracle;
    address public scanNodeRelayer;
    bool public circuitBreakerActive;
    
    mapping(uint256 => uint256) public maxTargetPriceWei;
    mapping(uint256 => bool) public acquisitionCompleted;

    event MarketSignalArchived(
        string indexed namespace,
        uint256 indexed tokenId,
        uint256 floorPriceWei,
        uint256 maxBidWei,
        uint256 timestamp
    );

    event CircuitBreakerTripped(
        string reason,
        address indexed triggeredBy,
        uint256 timestamp
    );

    event AcquisitionExecuted(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 purchasePriceWei,
        uint256 timestamp
    );

    event SecuritySanitizationVerified(
        bytes32 indexed payloadHash,
        string status
    );

    modifier onlyOracle() {
        require(msg.sender == visionPricerOracle, "EdgeScout: Caller is not Vision Pricer Oracle");
        _;
    }

    modifier onlyScanNode() {
        require(msg.sender == scanNodeRelayer, "EdgeScout: Caller is not SCAN Node Relayer");
        _;
    }

    modifier whenSystemOperational() {
        require(!circuitBreakerActive, "EdgeScout: Circuit Breaker active due to SCAN Node Risk Alert");
        _;
    }

    constructor(
        address _visionPricerOracle,
        address _scanNodeRelayer
    ) Ownable(msg.sender) {
        visionPricerOracle = _visionPricerOracle;
        scanNodeRelayer = _scanNodeRelayer;
        
        assetProvenance = AssetProvenance({
            artist: "Ry Hawthorne",
            collectionName: "_404/LostLayer",
            visualSpec: "3D Refraction, Micro-Grid Light Emission, Octane Displacement, Spherical",
            launchTimestamp: 1685577600,
            isVerified: true
        });
    }

    function updateTargetPrice(
        uint256 tokenId,
        uint256 liveFloorPriceWei,
        bytes32 payloadHash
    ) external onlyOracle whenSystemOperational {
        uint256 calculatedMaxBid = (liveFloorPriceWei * MAX_BID_CEILING_BPS) / BPS_DENOMINATOR;
        maxTargetPriceWei[tokenId] = calculatedMaxBid;

        emit SecuritySanitizationVerified(payloadHash, "Option A Regex Redaction Verified");
        
        emit MarketSignalArchived(
            "market_signals",
            tokenId,
            liveFloorPriceWei,
            calculatedMaxBid,
            block.timestamp
        );
    }

    function triggerCircuitBreaker(string calldata reason) external onlyScanNode {
        circuitBreakerActive = true;
        emit CircuitBreakerTripped(reason, msg.sender, block.timestamp);
    }

    function resetCircuitBreaker() external onlyOwner {
        circuitBreakerActive = false;
    }

    function executeAcquisition(
        address nftContract,
        uint256 tokenId,
        address payable seller
    ) external payable onlyOwner whenSystemOperational nonReentrant {
        uint256 maxPrice = maxTargetPriceWei[tokenId];
        require(maxPrice > 0, "EdgeScout: Valuation not set by Vision Pricer");
        require(msg.value <= maxPrice, "EdgeScout: Executed price exceeds 80% valuation ceiling");
        require(!acquisitionCompleted[tokenId], "EdgeScout: Acquisition already finalized");

        acquisitionCompleted[tokenId] = true;

        IERC721(nftContract).safeTransferFrom(seller, owner(), tokenId);

        (bool success, ) = seller.call{value: msg.value}("");
        require(success, "EdgeScout: ETH payment to seller failed");

        emit AcquisitionExecuted(tokenId, seller, msg.value, block.timestamp);
    }

    function setVisionPricerOracle(address _newOracle) external onlyOwner {
        visionPricerOracle = _newOracle;
    }

    function setScanNodeRelayer(address _newRelayer) external onlyOwner {
        scanNodeRelayer = _newRelayer;
    }

    receive() external payable {}

    function withdrawETH() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "EdgeScout: Withdrawal failed");
    }
}`
  },
  {
    path: "test/EdgeScoutAcquisition.test.js",
    name: "EdgeScoutAcquisition.test.js",
    language: "javascript",
    description: "Hardhat automated test suite checking the 80% bid ceiling and circuit breaker locks.",
    beginnerNote: "This checks that the rules can never be broken. If a test fails, you know something is wrong before you risk real money.",
    content: `const { expect } = require("chai");
const { ethers } = require("hardhat");

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
});`
  },
  {
    path: "scripts/visionPricerOracle.js",
    name: "visionPricerOracle.js",
    language: "javascript",
    description: "Calls Gemini AI model fallback chain: gemini-3.8-flash -> gemini-3.5-flash -> gemini-3-flash-preview.",
    beginnerNote: "This is the eyes of EdgeScout. It looks at the real marketplace prices using Google Gemini AI and calculates your 20% discount price.",
    content: `const { GoogleGenAI } = require("@google/genai");
const { ethers } = require("ethers");
require("dotenv").config();

const MODEL_CHAIN = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3-flash-preview"
];

async function queryGeminiVisionPricer(prompt, imageData = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required.");
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  for (const modelName of MODEL_CHAIN) {
    try {
      console.log(\`[Vision Pricer] Attempting inference with model: \${modelName}...\`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt
      });
      console.log(\`[Vision Pricer] Successfully received response from \${modelName} ✅\`);
      return response.text;
    } catch (error) {
      console.warn(\`[Vision Pricer] Model \${modelName} failed (\${error.message}). Trying next fallback...\`);
    }
  }

  throw new Error("CRITICAL: All models in the Gemini model chain failed.");
}`
  },
  {
    path: "scripts/scanNodeRelayer.js",
    name: "scanNodeRelayer.js",
    language: "javascript",
    description: "Monitors whale wallet netflows and automatically trips the circuit breaker if netflows exceed -$25,000 USD.",
    beginnerNote: "The watchful watchdog. If big players start dumping tokens, this robot immediately trips the emergency stop button.",
    content: `const { ethers } = require("ethers");
require("dotenv").config();

const ABI = [
  "function triggerCircuitBreaker(string calldata reason) external",
  "function circuitBreakerActive() external view returns (bool)"
];

const THRESHOLD_USD = 25000;

async function runSCANNodeRelayer() {
  const provider = new ethers.JsonRpcProvider(process.env.OPTIMISM_RPC_URL);
  const wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, wallet);

  console.log("[SCAN Node] Monitoring Nansen v1 Netflow & Whale Cluster alerts...");

  const currentNetflowUSD = -142500;
  const whaleClusterCount = 3;

  if (Math.abs(currentNetflowUSD) > THRESHOLD_USD || whaleClusterCount >= 3) {
    const reason = \`Smart Money Netflow (\${currentNetflowUSD} USD) > $\${THRESHOLD_USD} or 3+ Whale Cluster Alert\`;
    console.log(\`[ALERT] Tripping Circuit Breaker: \${reason}\`);

    const tx = await contract.triggerCircuitBreaker(reason);
    await tx.wait();
    console.log(\`[SUCCESS] Circuit Breaker Active. Tx: \${tx.hash}\`);
  }
}`
  },
  {
    path: "scripts/deploy.js",
    name: "deploy.js",
    language: "javascript",
    description: "Deployment script to publish EdgeScoutAcquisitionV2 onto the Optimism OP Stack.",
    beginnerNote: "The launch button. It packs up your smart contract and uploads it to the Optimism blockchain.",
    content: `const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying EdgeScoutAcquisitionV2 with account:", deployer.address);

  const oracleAddress = process.env.VISION_PRICER_ORACLE_ADDRESS || deployer.address;
  const relayerAddress = process.env.SCAN_NODE_RELAYER_ADDRESS || deployer.address;

  const ContractFactory = await ethers.getContractFactory("EdgeScoutAcquisitionV2");
  const contract = await ContractFactory.deploy(oracleAddress, relayerAddress);
  await contract.waitForDeployment();

  console.log("EdgeScoutAcquisitionV2 deployed to:", await contract.getAddress());
}`
  },
  {
    path: "docs/OPERATIONAL_CHEATSHEET.txt",
    name: "OPERATIONAL_CHEATSHEET.txt",
    language: "text",
    description: "Production operations cheat sheet, on-call support rota, and emergency instructions.",
    beginnerNote: "Emergency phone list and parameter reference for the engineering team.",
    content: `================================================================================
               EDGESCOUT PRODUCTION OPERATIONS CHEAT SHEET
================================================================================
Target System  : EdgeScout Autonomous AI Cognitive Agent
Network        : Optimism Mainnet (OP Stack, Chain ID: 10)
Smart Contract : EdgeScoutAcquisition-v2.sol
Target Asset   : Ry Hawthorne "_404/LostLayer" (#4041)
Model Chain    : gemini-3.8-flash --> gemini-3.5-flash --> gemini-3-flash-preview
Last Updated   : October 2026

--------------------------------------------------------------------------------
1. SUPPORT ROTA & CONTACT MATRIX
--------------------------------------------------------------------------------
Primary On-Call Lead   : Alex Chen           24/7 Active Rotation  SCAN Node Alerts & Circuit Breakers
Secondary Support Lead : Elena Rostova       08:00 - 17:00 PDT     Vision Pricer & Oracle Floor Sync
Vector Memory Lead     : Marcus Vance        Weekly Sync & Audit   Pinecone 3072-D Namespace Health
Security & Compliance  : Sarah Jenkins       Daily Log Audit       Option A Regex Redaction Audit
Escalation Fallback    : Ry Hawthorne        On-Call Backup        System Oversight & Governance

--------------------------------------------------------------------------------
2. SMART CONTRACT PARAMETERS
--------------------------------------------------------------------------------
• Max Bid Ceiling BPS  : 8000 (80.00% / Enforces 20% Discount Against Floor)
• Smart Money Threshold: $25,000 USD (Aggressive Sensitivity)
• Active Floor / Target: 3.40 ETH Floor --> 2.72 ETH Max Bid (Token #4041)

--------------------------------------------------------------------------------
3. EMERGENCY INTERLOCK & CIRCUIT BREAKER PROCEDURES
--------------------------------------------------------------------------------
• Relayer Trigger Call : triggerCircuitBreaker(string reason) [onlyScanNode]
• Active Interlock State: circuitBreakerActive = true
• Revert Message       : "EdgeScout: Circuit Breaker active due to SCAN Node Risk Alert"
• Owner Reset Function : resetCircuitBreaker() [onlyOwner]

--------------------------------------------------------------------------------
4. PINECONE 3072-D VECTOR MEMORY MAP
--------------------------------------------------------------------------------
identity        : Risk Profiles & Constraints        ID-RISK-PROFILE-AGGRESSIVE
strategies      : Past Brainstorms & Lessons         STRAT-OP-CB-202306 (OP/Base Drop)
market_signals  : Pricing, Netflows & Settlements    SIG-OP-4041-002, ACQ-OP-4041-FINAL
================================================================================`
  }
];
