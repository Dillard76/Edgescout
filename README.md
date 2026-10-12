# 🛡️ EdgeScout v2 — Autonomous AI Cognitive Agent
**Optimism OP Stack (Chain ID: 10)**

> Welcome! If you are a **complete beginner** with zero coding or Web3 experience, this guide was written specifically for you in plain, simple English with step-by-step instructions.

---

## 🌟 1. What is EdgeScout v2 in Simple English?

Imagine you hired a super-smart digital art collector and risk analyst named **EdgeScout**.
- **Network-Wide Scope:** EdgeScout is built to operate across the **entire Optimism OP Stack (Chain ID 10)**. Its smart contract can evaluate, protect, and acquire **any ERC-721 digital asset or collection** on the Optimism network.
- **The Flagship Mission:** As its primary showcase mission, EdgeScout is configured to target an ultra-rare piece called **Ry Hawthorne "_404/LostLayer" (#4041)**.
- **The Golden Rule (The 80% Ceiling):** EdgeScout is forbidden by computer code (a "Smart Contract") from paying full price. It **must always secure at least a 20% discount** compared to the current market floor price. If the market floor is 10.0 ETH, EdgeScout will never pay more than 8.0 ETH.
- **The Emergency Panic Button (Circuit Breaker):** If big cryptocurrency investors ("whales") start dumping more than **$25,000 USD** across Optimism or 3+ big wallets suddenly send crypto to exchanges, EdgeScout immediately hits the emergency brakes and freezes all buying to protect your funds.
- **The Brain (AI Vision Pricer):** EdgeScout uses Google's latest Gemini AI models in a reliable chain (`gemini-3.8-flash` ➡️ `gemini-3.5-flash` ➡️ `gemini-3-flash-preview`). If the first model is busy, it automatically tries the next one.
- **The Safe (Zero-Trust Privacy):** Before any data is sent over the internet, a safety filter strips away any secret 12-word recovery passwords or private keys so you never accidentally expose your secrets.

---

## 📋 2. Jargon Buster (Plain English Dictionary)

| Term | What It Actually Means |
| :--- | :--- |
| **Smart Contract** | A set of automatic rules written in code that live on the blockchain. Once launched, no human can cheat or change the rules. |
| **Optimism (OP Stack)** | A fast, low-cost network built on top of Ethereum. Its identifier number is `10`. |
| **Floor Price** | The lowest asking price currently listed for sale in a collection. |
| **BPS (Basis Points)** | A finance term where `10,000 BPS = 100%`. So `8,000 BPS` is exactly `80%`. |
| **Circuit Breaker** | An automatic safety switch. Just like the fuse box in your house cuts power during a storm to prevent a fire, this cuts off buying during a market crash. |
| **Oracle** | A trusted messenger that brings real-world data (like current market prices) into the blockchain. |
| **Relayer** | A background robot script that monitors market indicators and sends warning transactions to the smart contract. |
| **Pinecone Vector Memory** | A smart database that allows AI to remember past trading lessons and risk profiles in high-dimensional space (3,072 dimensions). |

---

## 🚀 3. Quick Start: Where to Click, What to Copy, What to Paste

### Step 1: Open the EdgeScout Command Center
If you are running in AI Studio, the application is already live in your preview pane!
- Click the **"Live Agent Playground"** tab to test everything visually with buttons and sliders.
- Click the **"Run Fallback Chain"** button to see Gemini evaluate the floor price.

### Step 2: Running Unit Tests Locally
If you are running on your computer terminal:

1. **Open your terminal** (Command Prompt on Windows, Terminal on Mac/Linux).
2. **Copy and paste this command** to compile the smart contracts:
   ```bash
   npx hardhat compile
   ```
3. **Copy and paste this command** to run the safety test suite:
   ```bash
   npx hardhat test
   ```
   **What you will see:** All 4 tests will turn green:
   - ✅ Should enforce 80% valuation ceiling
   - ✅ Should trip circuit breaker and prevent execution
   - ✅ Should execute acquisition within 80% ceiling and transfer NFT
   - ✅ Should revert acquisition if bid price exceeds 80% ceiling

### Step 3: Deploying to Optimism Mainnet
When you are ready to deploy to the real Optimism network:

1. Fill in your `.env` file with your deployer wallet private key:
   ```env
   OPTIMISM_RPC_URL="https://mainnet.optimism.io"
   PRIVATE_KEY="0x_YOUR_PRIVATE_KEY_HERE"
   GEMINI_API_KEY="YOUR_GEMINI_KEY"
   ```
2. Run the deployment script:
   ```bash
   npx hardhat run scripts/deploy.js --network optimism
   ```
3. Copy the contract address printed in your terminal (starts with `0x...`) and paste it into your `.env` as `CONTRACT_ADDRESS`.

---

## ⚙️ 4. Project File Structure

```text
├── contracts/
│   ├── EdgeScoutAcquisition-v2.sol  # The core Solidity smart contract with 80% ceiling & circuit breaker
│   └── MockERC721.sol               # Test NFT collection used for unit tests
├── test/
│   └── EdgeScoutAcquisition.test.js # Hardhat test suite testing all safety interlocks
├── scripts/
│   ├── deploy.js                    # Script to deploy the contract to Optimism
│   ├── scanNodeRelayer.js           # Monitors -$25k USD netflows & trips the circuit breaker
│   └── visionPricerOracle.js        # Calls Gemini 3.8-flash -> 3.5-flash -> 3-flash-preview
├── docs/
│   └── OPERATIONAL_CHEATSHEET.txt   # Support rota, contacts, and contract parameters
├── server.ts                        # Full-stack backend API & Vite dev server
├── src/                             # Interactive React UI with beginner tutorials and simulators
└── hardhat.config.js                # Hardhat network & Solidity optimizer settings
```

---

## 🩺 5. Troubleshooting: Simple Explanations & Fixes

### Error 1: `"EdgeScout: Circuit Breaker active due to SCAN Node Risk Alert"`
- **Why it happened:** The emergency panic button was triggered because market outflows exceeded $25,000 USD or whales dumped tokens.
- **How to fix:** The contract owner must reset it by calling `resetCircuitBreaker()` after the market stabilizes.

### Error 2: `"EdgeScout: Executed price exceeds 80% valuation ceiling"`
- **Why it happened:** Someone tried to spend more than 80% of the floor price. The smart contract blocked it to guarantee your 20% discount.
- **How to fix:** Lower your purchase bid so it is equal to or less than `Floor Price × 0.80`.

### Error 3: `"EdgeScout: Caller is not Vision Pricer Oracle"`
- **Why it happened:** An unauthorized wallet address tried to update the NFT's target price.
- **How to fix:** Only the official Oracle address designated in the contract can update prices.
