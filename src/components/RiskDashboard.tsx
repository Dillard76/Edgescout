import React, { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Activity,
  Gauge,
  Flame,
  Info,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Sparkles,
  LineChart as LineChartIcon,
  Radio,
  Play,
  Pause,
  RefreshCw
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid
} from "recharts";

interface RiskDashboardProps {
  netflowUSD: number;
  thresholdUSD?: number;
  whaleClusterCount: number;
  circuitBreakerActive: boolean;
  beginnerMode: boolean;
  onUpdateNetflow?: (netflow: number, whales: number) => void;
}

export const RiskDashboard: React.FC<RiskDashboardProps> = ({
  netflowUSD,
  thresholdUSD = 25000,
  whaleClusterCount,
  circuitBreakerActive,
  beginnerMode,
  onUpdateNetflow,
}) => {
  // Live periodic update simulation states
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");
  const [updateCount, setUpdateCount] = useState<number>(0);

  // Absolute outflow value (e.g. -142,500 -> 142,500 outflow)
  const isOutflow = netflowUSD < 0;
  const outflowMagnitude = isOutflow ? Math.abs(netflowUSD) : 0;
  const outflowPercentOfThreshold = Math.min(100, Math.round((outflowMagnitude / thresholdUSD) * 100));

  // Determine Warning vs Critical vs Safe Status
  // Warning triggers when approaching $25,000 threshold (70% - 99.9% = $17,500 to $24,999)
  const isApproachingThreshold = outflowMagnitude >= 17500 && outflowMagnitude < thresholdUSD;
  const isBreached = outflowMagnitude >= thresholdUSD || whaleClusterCount >= 3;

  // Remaining safety buffer
  const bufferRemaining = Math.max(0, thresholdUSD - outflowMagnitude);

  // React useEffect hook: simulates periodic live updates to the netflow data every 4 seconds
  useEffect(() => {
    if (!isLiveStreaming || !onUpdateNetflow) return;

    const timer = setInterval(() => {
      // Simulate real-time continuous market drift (-$750 to +$550 USD)
      const jitter = Math.floor(Math.random() * 1300) - 750;
      const updatedNetflow = netflowUSD + jitter;

      onUpdateNetflow(updatedNetflow, whaleClusterCount);
      setLastSyncTime(new Date().toLocaleTimeString());
      setUpdateCount((c) => c + 1);
    }, 4000);

    // Clean up timer on unmount or when paused
    return () => clearInterval(timer);
  }, [isLiveStreaming, netflowUSD, whaleClusterCount, onUpdateNetflow]);

  // Status configuration
  let statusBadge = {
    color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    label: "FLOWS NORMAL (SAFE)",
    subtext: "Smart money outflows are well within safe operating limits.",
    icon: ShieldCheck,
    barColor: "bg-emerald-500",
    lineColor: "#10b981",
  };

  if (isBreached || circuitBreakerActive) {
    statusBadge = {
      color: "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse",
      label: "CRITICAL: THRESHOLD BREACHED (EMERGENCY FREEZE)",
      subtext: "Smart money outflow exceeded $25,000 USD limit or 3+ whale cluster detected. System locked.",
      icon: ShieldAlert,
      barColor: "bg-rose-500",
      lineColor: "#f43f5e",
    };
  } else if (isApproachingThreshold) {
    statusBadge = {
      color: "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse",
      label: "WARNING: APPROACHING $25,000 THRESHOLD",
      subtext: "Outflow is in the caution zone (>70% of limit). Automated circuit breaker will trip if outflow increases.",
      icon: AlertTriangle,
      barColor: "bg-amber-500",
      lineColor: "#f59e0b",
    };
  }

  // Generate 24-hour historical trend points ending smoothly at current netflowUSD
  const hours24Data = useMemo(() => {
    const historicalOffsets = [
      8500, 6200, 9400, 4100, 1500, -1800, -3200, -2100, 3400, 5800,
      4100, 1200, -2500, -4800, -6200, -8400, -9800, -12100, -13500,
      -15200, -17400, -19800, -21200
    ];

    const data = [];
    for (let i = 0; i < 23; i++) {
      const hoursAgo = 23 - i;
      const progress = i / 22; // 0 to 1
      const blendedValue = Math.round(
        historicalOffsets[i] * (1 - progress * 0.7) + (netflowUSD * 0.85) * (progress * 0.85)
      );

      data.push({
        time: `${hoursAgo}h ago`,
        netflow: blendedValue,
      });
    }

    // 24th point is NOW
    data.push({
      time: "Now",
      netflow: netflowUSD,
      current: true,
    });

    return data;
  }, [netflowUSD]);

  // Custom recharts tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const isOut = val < 0;
      const absVal = Math.abs(val);

      return (
        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg shadow-xl text-xs font-mono space-y-1">
          <div className="text-slate-400 font-semibold flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-slate-500 font-normal">24h Netflow</span>
          </div>
          <div
            className={`text-sm font-bold ${
              absVal >= thresholdUSD
                ? "text-rose-400"
                : absVal >= 17500
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            {isOut ? `-$${absVal.toLocaleString()}` : `+$${val.toLocaleString()}`} USD
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            {absVal >= thresholdUSD ? (
              <span className="text-rose-400 font-semibold">🚨 Trip Zone (Exceeds -$25k)</span>
            ) : absVal >= 17500 ? (
              <span className="text-amber-400 font-semibold">⚠️ Warning Zone (Approaching -$25k)</span>
            ) : (
              <span className="text-emerald-400 font-semibold">✅ Safe Zone</span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2.5 rounded-xl border ${
              isBreached || circuitBreakerActive
                ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                : isApproachingThreshold
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
            }`}
          >
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-white font-bold text-sm tracking-tight">Smart Money Netflow Risk Radar</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Nansen v1 API Interlock
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Aggressive $25,000 USD Outflow Circuit Breaker Telemetry
            </p>
          </div>
        </div>

        {/* Live Telemetry Controls & Status Badge */}
        <div className="flex items-center space-x-2">
          {/* Live Periodic Ticking Indicator */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveStreaming ? "bg-emerald-400 animate-ping" : "bg-slate-600"
              }`}
            />
            <span className={isLiveStreaming ? "text-emerald-400 font-semibold" : "text-slate-400"}>
              {isLiveStreaming ? "LIVE (4s)" : "PAUSED"}
            </span>
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className="ml-1 text-slate-400 hover:text-white p-0.5 rounded transition-colors"
              title={isLiveStreaming ? "Pause Live Periodic Updates" : "Resume Live Periodic Updates"}
            >
              {isLiveStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
            </button>
          </div>

          {/* Real-time Status Badge */}
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-2 ${statusBadge.color}`}>
            <statusBadge.icon className="w-4 h-4 shrink-0" />
            <span>{statusBadge.label}</span>
          </div>
        </div>
      </div>

      {/* Beginner Guide Tip */}
      {beginnerMode && (
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/70 text-xs text-slate-300 leading-relaxed flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300 block mb-0.5">
              💡 Live Telemetry Hook Active (React useEffect)
            </span>
            <span>
              A background timer is running via React's <code>useEffect</code> hook. Every 4 seconds, it simulates fresh blockchain transactions from Optimism, smoothly updating the numbers and the 24-hour line chart. You can pause or resume this stream at any time using the ⏸️ button in the top right.
            </span>
          </div>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Current Netflow Value */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Current Netflow</span>
            {isOutflow ? (
              <span className="text-rose-400 flex items-center text-[11px] font-medium">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> Outflow
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center text-[11px] font-medium">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> Inflow
              </span>
            )}
          </div>
          <div
            className={`text-xl font-bold font-mono ${
              isBreached || circuitBreakerActive
                ? "text-rose-400"
                : isApproachingThreshold
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            {netflowUSD < 0 ? `-$${Math.abs(netflowUSD).toLocaleString()}` : `+$${netflowUSD.toLocaleString()}`} USD
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{outflowMagnitude > 0 ? `${outflowPercentOfThreshold}% limit used` : "Capital influx"}</span>
            <span className="font-mono text-[10px] text-slate-400">Sync: {lastSyncTime}</span>
          </div>
        </div>

        {/* Metric 2: Circuit Breaker Threshold */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Safety Threshold</span>
            <span className="text-amber-400 text-[11px] font-mono">Aggressive</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            ${thresholdUSD.toLocaleString()} USD
          </div>
          <span className="text-[11px] text-slate-500 block">
            Automatic trip trigger ceiling
          </span>
        </div>

        {/* Metric 3: Safety Cushion / Buffer Remaining */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Safety Buffer</span>
            <span className="text-slate-400 text-[11px]">Before Freeze</span>
          </div>
          <div
            className={`text-xl font-bold font-mono ${
              bufferRemaining === 0 ? "text-rose-400" : isApproachingThreshold ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {bufferRemaining === 0 ? "EXCEEDED ($0)" : `$${bufferRemaining.toLocaleString()} USD`}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {bufferRemaining > 0 ? "Headroom before emergency lock" : "Breaker actively engaged"}
          </span>
        </div>

        {/* Metric 4: Whale Wallet Cluster Activity */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Whale Exchange Deposits</span>
            <span className={`text-[11px] font-semibold ${whaleClusterCount >= 3 ? "text-rose-400" : "text-slate-400"}`}>
              {whaleClusterCount >= 3 ? "TRIGGERED (3+)" : "Normal"}
            </span>
          </div>
          <div
            className={`text-xl font-bold font-mono ${
              whaleClusterCount >= 3 ? "text-rose-400" : "text-white"
            }`}
          >
            {whaleClusterCount} / 3 Wallets
          </div>
          <span className="text-[11px] text-slate-500 block">
            Top-50 exchange cluster alert
          </span>
        </div>
      </div>

      {/* 24-Hour Netflow Trend Line Chart (Recharts) */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <LineChartIcon className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-semibold text-white">24-Hour Smart Money Netflow Trend</h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              Hourly Telemetry • {updateCount} Live Updates
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <span className="flex items-center space-x-1.5 text-amber-400">
              <span className="w-2 h-0.5 border-b border-dashed border-amber-400 inline-block" />
              <span>Warn (-$17.5k)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-rose-400">
              <span className="w-2 h-0.5 border-b border-dashed border-rose-400 inline-block" />
              <span>Trip (-$25k)</span>
            </span>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="w-full h-44 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hours24Data} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                interval={4}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                tickFormatter={(val) => `${Math.round(val / 1000)}k`}
                domain={["dataMin - 5000", "dataMax + 5000"]}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Circuit Breaker Limit Reference Line (-$25k) */}
              <ReferenceLine
                y={-thresholdUSD}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                label={{
                  value: "-$25k LIMIT",
                  fill: "#f43f5e",
                  fontSize: 9,
                  position: "insideBottomRight",
                }}
              />
              {/* Warning Threshold Reference Line (-$17.5k) */}
              <ReferenceLine
                y={-17500}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                label={{
                  value: "-$17.5k WARN",
                  fill: "#f59e0b",
                  fontSize: 9,
                  position: "insideTopRight",
                }}
              />
              {/* Netflow Trend Line */}
              <Line
                type="monotone"
                dataKey="netflow"
                stroke={statusBadge.lineColor}
                strokeWidth={2.5}
                dot={{ r: 2, fill: "#fff" }}
                activeDot={{ r: 5, stroke: statusBadge.lineColor, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visual Threshold Gauge / Progress Bar */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium flex items-center space-x-1.5">
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
            <span>Outflow Threshold Proximity Gauge</span>
          </span>
          <span className="font-mono text-slate-400">
            Current Outflow: <strong className="text-white">${outflowMagnitude.toLocaleString()} USD</strong> / $25,000 USD
          </span>
        </div>

        {/* Progress Bar with Color Zones */}
        <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden flex">
          {/* Safe zone indicator (0 - 70%) */}
          <div className="w-[70%] h-full border-r border-slate-700/60 relative" title="Safe Zone ($0 - $17,500)" />
          {/* Warning zone indicator (70% - 100%) */}
          <div className="w-[30%] h-full bg-amber-500/10 relative" title="Warning Zone ($17,500 - $25,000)" />

          {/* Active Fill Level */}
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-300 ${statusBadge.barColor} ${
              isBreached ? "w-full" : ""
            }`}
            style={{ width: isBreached ? "100%" : `${outflowPercentOfThreshold}%` }}
          />
        </div>

        {/* Gauge Scale Labels */}
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>$0 (Inflow/Neutral)</span>
          <span className="text-emerald-500/80">$10,000 (Safe)</span>
          <span className="text-amber-400 font-bold">$17,500 (Warning Zone)</span>
          <span className="text-rose-400 font-bold">$25,000 (Circuit Breaker Trip)</span>
        </div>
      </div>

      {/* Warning Alert Banner (Visible when approaching threshold or breached) */}
      {isApproachingThreshold && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs flex items-start space-x-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-300 block text-sm">
              ⚠️ WARNING STATUS: Outflow Approaching $25,000 Risk Threshold
            </span>
            <p className="text-amber-200/90 leading-relaxed">
              Smart money netflows have reached <strong>${outflowMagnitude.toLocaleString()} USD</strong>, which is within 
              <strong> ${bufferRemaining.toLocaleString()} USD</strong> of tripping the emergency circuit breaker. 
              The SCAN Node Relayer is on high alert. If outflows increase by another ${bufferRemaining.toLocaleString()} USD, 
              buying operations will freeze immediately.
            </p>
          </div>
        </div>
      )}

      {isBreached && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-xs flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-rose-300 block text-sm">
              🚨 CRITICAL ALERT: Emergency Circuit Breaker Triggered
            </span>
            <p className="text-rose-200/90 leading-relaxed">
              Outflow exceeds the $25,000 threshold or 3+ whale cluster wallets have deposited to exchanges. 
              The <code>EdgeScoutAcquisitionV2</code> smart contract has been locked by the SCAN Node. All purchase bids will revert with:
              <code className="block mt-1 p-1.5 rounded bg-rose-950/80 border border-rose-900 font-mono text-[11px] text-rose-300">
                "EdgeScout: Circuit Breaker active due to SCAN Node Risk Alert"
              </code>
            </p>
          </div>
        </div>
      )}

      {/* Quick Simulation Presets */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-medium">Test Risk Threshold Scenarios:</span>
          <span className="text-[10px] text-slate-500">Live stream updates every 4s</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onUpdateNetflow?.(-8000, 1)}
            className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium transition-colors text-center"
          >
            🟢 Safe (-$8k)
          </button>
          <button
            type="button"
            onClick={() => onUpdateNetflow?.(-21500, 2)}
            className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-[11px] font-medium transition-colors text-center"
          >
            🟡 Warning (-$21.5k)
          </button>
          <button
            type="button"
            onClick={() => onUpdateNetflow?.(-142500, 3)}
            className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/40 text-[11px] font-medium transition-colors text-center"
          >
            🔴 Breach (-$142k)
          </button>
        </div>
        <p className="text-[10px] text-slate-500 text-center">
          Click any preset button above to test that scenario; the live telemetry will continuously fluctuate around it.
        </p>
      </div>
    </div>
  );
};
