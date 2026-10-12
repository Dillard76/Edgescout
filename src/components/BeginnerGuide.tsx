import React, { useState } from "react";
import {
  HelpCircle,
  Copy,
  Check,
  CheckCircle,
  ArrowRight,
  Terminal,
  Shield,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  LifeBuoy
} from "lucide-react";

export const BeginnerGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedError, setSelectedError] = useState<number>(0);

  const copyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      stepNumber: 1,
      title: "Explore the Live Simulator First",
      whereToClick: "Click the '🎯 Live Agent Playground' tab at the top of your screen.",
      whatToCopy: "No code needed yet!",
      plainEnglish: "You don't need to write any code right now. Just test out the buttons in the playground. Drag the 'Live Floor Price' slider, click 'Run Vision Pricer Oracle', and watch how it automatically calculates a 20% discount!",
      command: null
    },
    {
      stepNumber: 2,
      title: "Run Smart Contract Safety Tests",
      whereToClick: "Click the '🧪 Hardhat Unit Tests' tab, then click the green 'Run Hardhat Test Suite' button.",
      whatToCopy: "npx hardhat test",
      plainEnglish: "This runs 4 automatic safety checks on the smart contract. You will see 4 green checkmarks proving that EdgeScout will never let anyone overpay.",
      command: "npx hardhat test"
    },
    {
      stepNumber: 3,
      title: "Prepare Your Environment File (.env)",
      whereToClick: "Look at the project files on the left or in the '💻 Codebase & Contracts' tab.",
      whatToCopy: "The keys inside .env.example",
      plainEnglish: "The .env file holds your private settings like your Gemini API key and your wallet key. Never share this file with anyone.",
      command: `OPTIMISM_RPC_URL="https://mainnet.optimism.io"
PRIVATE_KEY="0x_YOUR_OPTIMISM_DEPLOYER_PRIVATE_KEY"
CONTRACT_ADDRESS="0x_DEPLOYED_CONTRACT_ADDRESS"`
    },
    {
      stepNumber: 4,
      title: "Deploy to Optimism Mainnet",
      whereToClick: "In your computer terminal, paste the deployment command below.",
      whatToCopy: "npx hardhat run scripts/deploy.js --network optimism",
      plainEnglish: "This sends your smart contract onto the real Optimism network (Chain ID 10) so it is ready to execute acquisitions for Ry Hawthorne #4041 or any digital asset on Optimism.",
      command: "npx hardhat run scripts/deploy.js --network optimism"
    }
  ];

  const commonErrors = [
    {
      id: 0,
      badge: "Smart Contract Revert",
      errorText: "Error: VM Exception while processing transaction: reverted with reason string 'EdgeScout: Executed price exceeds 80% valuation ceiling'",
      simpleExplanation: "You tried to make EdgeScout buy the NFT at a price that was higher than the 80% maximum budget lock.",
      howToFix: [
        "1. Check the current floor price (for example, 3.40 ETH).",
        "2. Multiply that floor price by 0.80 (3.40 × 0.80 = 2.72 ETH).",
        "3. Make sure your bid value is 2.72 ETH or lower. The smart contract will now accept your transaction."
      ]
    },
    {
      id: 1,
      badge: "Emergency Circuit Breaker",
      errorText: "Error: VM Exception while processing transaction: reverted with reason string 'EdgeScout: Circuit Breaker active due to SCAN Node Risk Alert'",
      simpleExplanation: "The emergency panic button is currently switched ON because the SCAN Node detected a market crash or whale dump.",
      howToFix: [
        "1. Wait for market liquidity and whale wallets to stabilize.",
        "2. Only the owner wallet can reset the breaker.",
        "3. Click the 'Reset Breaker' button in the Live Playground or call contract.resetCircuitBreaker()."
      ]
    },
    {
      id: 2,
      badge: "Permissions Error",
      errorText: "Error: VM Exception while processing transaction: reverted with reason string 'EdgeScout: Caller is not Vision Pricer Oracle'",
      simpleExplanation: "An unauthorized wallet tried to set the valuation price. Only the trusted Oracle wallet is allowed to update prices.",
      howToFix: [
        "1. Open your .env file.",
        "2. Check that VISION_PRICER_ORACLE_ADDRESS matches the wallet you are sending the update from.",
        "3. In the contract, the owner can set a new oracle using setVisionPricerOracle(newAddress)."
      ]
    },
    {
      id: 3,
      badge: "API Key Error",
      errorText: "Error: GEMINI_API_KEY environment variable is required",
      simpleExplanation: "The AI Vision Pricer tried to run, but couldn't find your Google Gemini API key.",
      howToFix: [
        "1. In Google AI Studio, open the Secrets / Environment panel.",
        "2. Make sure GEMINI_API_KEY is configured.",
        "3. If testing locally, add GEMINI_API_KEY=\"AIza...\" to your .env file."
      ]
    }
  ];

  const glossary = [
    {
      term: "OP Stack (Chain ID 10)",
      meaning: "Optimism is a super fast and cheap blockchain built right on top of Ethereum. Its official ID number is 10."
    },
    {
      term: "Floor Price",
      meaning: "The lowest price currently listed for sale for an artwork in that collection. If three pieces are for sale at 3.4 ETH, 4 ETH, and 5 ETH, the floor price is 3.4 ETH."
    },
    {
      term: "8,000 BPS (Basis Points)",
      meaning: "In finance, 10,000 basis points equals 100%. So 8,000 basis points means exactly 80%. EdgeScout uses this to enforce that you get at least a 20% discount."
    },
    {
      term: "Circuit Breaker",
      meaning: "Just like the safety switch in your house that turns off the power during a short circuit, this stops all buying if more than $25,000 is dumped by big investors."
    },
    {
      term: "Keccak-256",
      meaning: "A cryptographic fingerprint. It turns any text or contract payload into a unique 64-character code so you can prove it hasn't been tampered with."
    }
  ];

  return (
    <div className="space-y-8">
      {/* Friendly Introduction Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shrink-0">
            <Lightbulb className="w-8 h-8 text-amber-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-white font-bold text-xl">
              Beginner's Masterclass: EdgeScout v2 Step-by-Step
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Don't worry if you have never written a line of code or touched Web3 before. 
              Think of this page as your personal GPS: we will tell you <strong>where to click</strong>, 
              <strong> what to copy</strong>, and <strong>where to paste</strong> at every stage.
            </p>
          </div>
        </div>
      </div>

      {/* Step by Step Walkthrough */}
      <div className="space-y-4">
        <h3 className="text-white font-bold text-base flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>Step-by-Step Action Plan (Follow in Order)</span>
        </h3>

        <div className="space-y-4">
          {steps.map((s, idx) => (
            <div
              key={s.stepNumber}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {s.stepNumber}
                  </span>
                  <h4 className="text-white font-semibold text-sm">{s.title}</h4>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Step {s.stepNumber} of {steps.length}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-indigo-300 font-semibold flex items-center space-x-1">
                    <span>👉 WHERE TO CLICK:</span>
                  </span>
                  <p className="text-slate-300">{s.whereToClick}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-amber-300 font-semibold flex items-center space-x-1">
                    <span>💡 PLAIN ENGLISH EXPLANATION:</span>
                  </span>
                  <p className="text-slate-300">{s.plainEnglish}</p>
                </div>
              </div>

              {s.command && (
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-semibold text-emerald-300">📋 WHAT TO COPY:</span>
                    <button
                      onClick={() => copyText(s.command!, idx)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors text-[11px]"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy This Command</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                    {s.command}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Error Doctor */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">The Error Doctor (Simple Explanations & Fixes)</h3>
            <p className="text-xs text-slate-400">Did you see a scary error message? Click on it below to see what it really means and how to fix it in 30 seconds.</p>
          </div>
        </div>

        {/* Error Selector Tabs */}
        <div className="flex flex-wrap gap-2 pt-2">
          {commonErrors.map((err) => (
            <button
              key={err.id}
              onClick={() => setSelectedError(err.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedError === err.id
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {err.badge}
            </button>
          ))}
        </div>

        {/* Selected Error Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Exact Error Message You See:</span>
            <div className="p-2.5 rounded bg-rose-950/30 border border-rose-900/50 text-xs font-mono text-rose-300">
              {commonErrors[selectedError].errorText}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-amber-300 font-semibold text-xs flex items-center space-x-1">
              <span>🤔 WHAT THIS MEANS IN PLAIN ENGLISH:</span>
            </span>
            <p className="text-slate-300 text-xs leading-relaxed">
              {commonErrors[selectedError].simpleExplanation}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-1.5">
            <span className="text-emerald-400 font-semibold text-xs flex items-center space-x-1">
              <span>🛠️ HOW TO FIX IT STEP-BY-STEP:</span>
            </span>
            <div className="space-y-1 text-xs text-emerald-200/90 font-mono">
              {commonErrors[selectedError].howToFix.map((line, lIdx) => (
                <div key={lIdx}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Plain English Dictionary / Jargon Buster */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h3 className="text-white font-bold text-base">Jargon Buster (Web3 & AI Words Made Simple)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {glossary.map((g, idx) => (
            <div key={idx} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <span className="text-indigo-300 font-bold block">{g.term}</span>
              <p className="text-slate-400 leading-relaxed">{g.meaning}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
