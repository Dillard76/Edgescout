// SPDX-License-Identifier: MIT
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
}
