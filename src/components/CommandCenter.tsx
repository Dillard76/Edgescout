import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Shield,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Hash,
  Database,
  ArrowRight,
  Info,
  DollarSign
} from "lucide-react";
import { BlockchainEvent, OracleResult, ScanNodeState } from "../types";
import { RiskDashboard } from "./RiskDashboard";

interface CommandCenterProps {
  beginnerMode: boolean;
  circuitBreakerActive: boolean;
  setCircuitBreakerActive: (val: boolean) => void;
  onEmitEvent: (event: BlockchainEvent) => void;
  events: BlockchainEvent[];
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  beginnerMode,
  circuitBreakerActive,
  setCircuitBreakerActive,
  onEmitEvent,
  events,
}) => {
  // Oracle State
  const [floorPriceInput, setFloorPriceInput] = useState<number>(3.40);
  const [simulatedFailures, setSimulatedFailures] = useState<number>(0);
  const [oracleLoading, setOracleLoading] = useState<boolean>(false);
  const [oracleResult, setOracleResult] = useState<OracleResult | null>(null);

  // Relayer State
  const [netflowUSD, setNetflowUSD] = useState<number>(-142500);
  const [whaleClusterCount, setWhaleClusterCount] = useState<number>(3);
  const [scanEvaluating, setScanEvaluating] = useState<boolean>(false);
  const [scanState, setScanState] = useState<ScanNodeState | null>(null);

  // Contract Interlock State
  const [contractTargetPriceWei, setContractTargetPriceWei] = useState<string>("2720000000000000000"); // 2.72 ETH in wei
  const [contractTargetPriceEth, setContractTargetPriceEth] = useState<number>(2.72);
  const [acquisitionCompleted, setAcquisitionCompleted] = useState<boolean>(false);
  const [executionMessage, setExecutionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Trigger initial evaluation
  useEffect(() => {
    evaluateScanNode(netflowUSD, whaleClusterCount);
  }, []);

  const runOracleSync = async (floor = floorPriceInput, failCount = simulatedFailures) => {
    setOracleLoading(true);
    setExecutionMessage(null);
    try {
      const response = await fetch("/api/oracle/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          liveFloorEth: floor,
          simulatedFailureCount: failCount,
        }),
      });
      const data: OracleResult = await response.json();
      setOracleResult(data);

      if (!circuitBreakerActive) {
        setContractTargetPriceEth(data.maxBidEth);
        setContractTargetPriceWei(data.maxBidWei);

        onEmitEvent({
          id: `evt-${Date.now()}-1`,
          eventName: "SecuritySanitizationVerified",
          data: {
            payloadHash: data.payloadHash,
            status: "Option A Regex Redaction Verified",
          },
          timestamp: new Date().toLocaleTimeString(),
          txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        });

        onEmitEvent({
          id: `evt-${Date.now()}-2`,
          eventName: "MarketSignalArchived",
          data: {
            namespace: "market_signals",
            tokenId: 4041,
            floorPriceWei: data.floorWei,
            maxBidWei: data.maxBidWei,
            discountEnforced: "20.00% (8000 BPS)",
          },
          timestamp: new Date().toLocaleTimeString(),
          txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        });
      } else {
        setExecutionMessage({
          type: "error",
          text: "Reverted: EdgeScout: Circuit Breaker active due to SCAN Node Risk Alert",
        });
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setOracleLoading(false);
    }
  };

  const evaluateScanNode = async (flow = netflowUSD, whales = whaleClusterCount) => {
    setScanEvaluating(true);
    try {
      const response = await fetch("/api/scan-node/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ netflowUSD: flow, whaleClusterCount: whales }),
      });
      const data: ScanNodeState = await response.json();
      setScanState(data);

      if (data.circuitBreakerTripped && !circuitBreakerActive) {
        setCircuitBreakerActive(true);
        onEmitEvent({
          id: `evt-${Date.now()}-breaker`,
          eventName: "CircuitBreakerTripped",
          data: {
            reason: data.reason,
            triggeredBy: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (SCAN Node Relayer)",
            netflowUSD: data.netflowUSD,
            whaleClusterCount: data.whaleClusterCount,
          },
          timestamp: new Date().toLocaleTimeString(),
          txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        });
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setScanEvaluating(false);
    }
  };

  const handleManualTripBreaker = () => {
    setCircuitBreakerActive(true);
    setExecutionMessage(null);
    onEmitEvent({
      id: `evt-${Date.now()}-manual`,
      eventName: "CircuitBreakerTripped",
      data: {
        reason: "Manual Emergency Interlock Triggered by SCAN Node Relayer",
        triggeredBy: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      },
      timestamp: new Date().toLocaleTimeString(),
      txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
    });
  };

  const handleResetBreaker = () => {
    setCircuitBreakerActive(false);
    setExecutionMessage({
      type: "success",
      text: "Circuit Breaker successfully reset by Contract Owner. System operational.",
    });
  };

  const handleExecuteAcquisition = (bidPriceEth: number) => {
    setExecutionMessage(null);

    // Safety checks matching Solidity contract
    if (circuitBreakerActive) {
      setExecutionMessage({
        type: "error",
        text: "Transaction Reverted: 'EdgeScout: Circuit Breaker active due to SCAN Node Risk Alert'",
      });
      return;
    }

    if (contractTargetPriceEth <= 0) {
      setExecutionMessage({
        type: "error",
        text: "Transaction Reverted: 'EdgeScout: Valuation not set by Vision Pricer'",
      });
      return;
    }

    if (bidPriceEth > contractTargetPriceEth) {
      setExecutionMessage({
        type: "error",
        text: `Transaction Reverted: 'EdgeScout: Executed price (${bidPriceEth} ETH) exceeds 80% valuation ceiling (${contractTargetPriceEth} ETH)'`,
      });
      return;
    }

    if (acquisitionCompleted) {
      setExecutionMessage({
        type: "error",
        text: "Transaction Reverted: 'EdgeScout: Acquisition already finalized'",
      });
      return;
    }

    // Success!
    setAcquisitionCompleted(true);
    setExecutionMessage({
      type: "success",
      text: `🎉 Acquisition Finalized! Ry Hawthorne '_404/LostLayer' #4041 acquired for ${bidPriceEth} ETH (20% discount secured against ${floorPriceInput} ETH floor). Transferred to Contract Owner!`,
    });

    onEmitEvent({
      id: `evt-${Date.now()}-acq`,
      eventName: "AcquisitionExecuted",
      data: {
        tokenId: 4041,
        artist: "Ry Hawthorne",
        collection: "_404/LostLayer",
        purchasePriceEth: `${bidPriceEth} ETH`,
        purchasePriceWei: `${bidPriceEth * 1e18}`,
        seller: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        buyerOwner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      },
      timestamp: new Date().toLocaleTimeString(),
      txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
    });
  };

  return (
    <div className="space-y-6">
      {/* Beginner Welcome Banner */}
      {beginnerMode && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-200 text-sm flex items-start space-x-3 shadow-sm">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">
              👋 Beginner Mode is Active: What am I looking at?
            </p>
            <p className="text-amber-200/90 text-xs leading-relaxed">
              This is the live simulation of EdgeScout v2. Below you can see the 3 pillars that protect your funds:
              <strong className="text-white"> 1. Vision Pricer AI</strong> (calculates the 20% discount),
              <strong className="text-white"> 2. SCAN Node Relayer</strong> (watches for market crashes and hits the emergency brake), and
              <strong className="text-white"> 3. Smart Contract Interlock</strong> (the digital lock that refuses any bad trade).
              Try clicking the blue and red buttons below to see how it works!
            </p>
          </div>
        </div>
      )}

      {/* Risk Dashboard: Smart Money Netflow Proximity Radar & Warning Status */}
      <RiskDashboard
        netflowUSD={netflowUSD}
        thresholdUSD={25000}
        whaleClusterCount={whaleClusterCount}
        circuitBreakerActive={circuitBreakerActive}
        beginnerMode={beginnerMode}
        onUpdateNetflow={(flow, whales) => {
          setNetflowUSD(flow);
          setWhaleClusterCount(whales);
          evaluateScanNode(flow, whales);
        }}
      />

      {/* Top Grid: Three Interactive Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module 1: Vision Pricer Oracle (Gemini Model Chain) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Vision Pricer Oracle</h3>
                  <p className="text-xs text-slate-400">Gemini Model Chain Fallback</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                8000 BPS (80%)
              </span>
            </div>

            {beginnerMode && (
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-[11px] text-slate-300 leading-normal">
                💡 <strong>How it works:</strong> Gemini AI reads the current marketplace floor price, enforces a mandatory 20% discount (80% ceiling), and signs the payload with Option A Zero-Trust Sanitization.
              </div>
            )}

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium flex justify-between">
                  <span>Live Floor Price (ETH)</span>
                  <span className="text-indigo-400 font-mono">{floorPriceInput.toFixed(2)} ETH</span>
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="10.0"
                  step="0.1"
                  value={floorPriceInput}
                  onChange={(e) => setFloorPriceInput(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
                />
              </div>

              {/* Model Chain Fallback Simulator */}
              <div>
                <label className="text-xs text-slate-300 font-medium block">
                  Simulate Model Fallback Sequence:
                </label>
                <select
                  value={simulatedFailures}
                  onChange={(e) => setSimulatedFailures(parseInt(e.target.value))}
                  className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value={0}>Primary: gemini-3.8-flash (Standard)</option>
                  <option value={1}>Fallback 1: gemini-3.5-flash (Simulate 1st failure)</option>
                  <option value={2}>Fallback 2: gemini-3-flash-preview (Simulate 2 failures)</option>
                </select>
              </div>

              {/* Calculated Ceiling Preview */}
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">80% Max Target Ceiling</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm">
                    {(floorPriceInput * 0.8).toFixed(4)} ETH
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Enforced Discount</span>
                  <span className="text-indigo-400 font-semibold text-xs">20.00% (Save {(floorPriceInput * 0.2).toFixed(4)} ETH)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <button
              onClick={() => runOracleSync()}
              disabled={oracleLoading}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-md disabled:opacity-50"
            >
              {oracleLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Querying Model Chain...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Vision Pricer Oracle</span>
                </>
              )}
            </button>

            {oracleResult && (
              <div className="mt-3 p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                <div className="flex justify-between text-indigo-300 font-semibold">
                  <span>Model Used:</span>
                  <span>{oracleResult.modelUsed}</span>
                </div>
                <div className="truncate text-slate-400">
                  <span>Hash: {oracleResult.payloadHash}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Module 2: SCAN Node Relayer & Netflow Monitor */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">SCAN Node Relayer</h3>
                  <p className="text-xs text-slate-400">Nansen Smart Money & Netflows</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                -$25,000 USD Limit
              </span>
            </div>

            {beginnerMode && (
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-[11px] text-slate-300 leading-normal">
                💡 <strong>How it works:</strong> The SCAN Node is an off-chain robot that watches blockchain wallets. If whales pull more than $25k USD or 3+ top whales send tokens to exchanges, it automatically trips the emergency breaker to stop EdgeScout from buying into a crash.
              </div>
            )}

            {/* Slider 1: Netflow */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium flex justify-between">
                  <span>Smart Money Netflow (USD)</span>
                  <span
                    className={`font-mono font-semibold ${
                      Math.abs(netflowUSD) > 25000 ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    ${netflowUSD.toLocaleString()} USD
                  </span>
                </label>
                <input
                  type="range"
                  min="-200000"
                  max="50000"
                  step="5000"
                  value={netflowUSD}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setNetflowUSD(val);
                    evaluateScanNode(val, whaleClusterCount);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
                />
              </div>

              {/* Slider 2: Whale Clusters */}
              <div>
                <label className="text-xs text-slate-300 font-medium flex justify-between">
                  <span>Top-50 Whale Exchange Deposits</span>
                  <span
                    className={`font-mono font-semibold ${
                      whaleClusterCount >= 3 ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {whaleClusterCount} Wallets (Trigger: 3+)
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={whaleClusterCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setWhaleClusterCount(val);
                    evaluateScanNode(netflowUSD, val);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
                />
              </div>

              {/* Alert Status Box */}
              <div
                className={`p-3 rounded-lg border text-xs ${
                  scanState?.circuitBreakerTripped
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                }`}
              >
                <div className="flex items-center space-x-1.5 font-semibold">
                  {scanState?.circuitBreakerTripped ? (
                    <>
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>CRITICAL RISK THRESHOLD BREACHED</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Flows Stable (Under $25k Threshold)</span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-[11px] opacity-80">{scanState?.reason}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex space-x-2">
            <button
              onClick={handleManualTripBreaker}
              className="flex-1 py-2 px-3 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-medium text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Trip Breaker</span>
            </button>
            <button
              onClick={handleResetBreaker}
              className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Breaker</span>
            </button>
          </div>
        </div>

        {/* Module 3: Smart Contract Acquisition Arena */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">EdgeScout Contract</h3>
                  <p className="text-xs text-slate-400">EdgeScoutAcquisition-v2.sol</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  circuitBreakerActive
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                }`}
              >
                {circuitBreakerActive ? "LOCKED" : "OPERATIONAL"}
              </span>
            </div>

            {beginnerMode && (
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-[11px] text-slate-300 leading-normal">
                💡 <strong>Try this experiment:</strong> Click "Buy at 80% Ceiling" to test a valid purchase. Then try "Test Overpriced Bid" to see the smart contract automatically reject an unfair price!
              </div>
            )}

            {/* Target Spec */}
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Asset:</span>
                <span className="text-white font-semibold font-mono">Ry Hawthorne #4041</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Ceiling Wei:</span>
                <span className="text-emerald-400 font-mono text-[11px] truncate max-w-[160px]">
                  {contractTargetPriceWei}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Allowed Bid:</span>
                <span className="text-emerald-400 font-bold font-mono">{contractTargetPriceEth.toFixed(2)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Acquisition State:</span>
                <span className={acquisitionCompleted ? "text-emerald-400 font-semibold" : "text-amber-400"}>
                  {acquisitionCompleted ? "Finalized (Owned)" : "Pending Settlement"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            {/* Purchase at 80% ceiling */}
            <button
              onClick={() => handleExecuteAcquisition(contractTargetPriceEth)}
              disabled={acquisitionCompleted}
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-md disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Buy at 80% Ceiling ({contractTargetPriceEth.toFixed(2)} ETH)</span>
            </button>

            {/* Overpriced bid test */}
            <button
              onClick={() => handleExecuteAcquisition(contractTargetPriceEth + 0.5)}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 font-medium text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Test Overpriced Bid ({(contractTargetPriceEth + 0.5).toFixed(2)} ETH) [Will Revert]</span>
            </button>
          </div>
        </div>
      </div>

      {/* Execution Feedback Banner */}
      {executionMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            executionMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
              : "bg-rose-500/10 border-rose-500/30 text-rose-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            {executionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-mono">{executionMessage.text}</span>
          </div>
          <button
            onClick={() => setExecutionMessage(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Live Blockchain Event Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <h3 className="text-white font-semibold text-sm">Live Blockchain Event Stream</h3>
            <span className="text-xs text-slate-400">Optimism OP Stack (Chain ID: 10)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {events.length} Events Logged
          </span>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No contract events emitted yet. Run the Vision Pricer or execute a bid above to generate on-chain events!
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono space-y-1 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded ${
                      ev.eventName === "AcquisitionExecuted"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : ev.eventName === "CircuitBreakerTripped"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    }`}
                  >
                    {ev.eventName}
                  </span>
                  <span className="text-slate-500">{ev.timestamp}</span>
                </div>
                <div className="text-slate-400 text-[11px] truncate">
                  Tx: <span className="text-slate-300">{ev.txHash}</span>
                </div>
                <div className="text-slate-300 text-[11px] pt-1 border-t border-slate-800/50">
                  {JSON.stringify(ev.data, null, 2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
