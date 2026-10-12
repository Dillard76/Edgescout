/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Header } from "./components/Header";
import { CommandCenter } from "./components/CommandCenter";
import { SecurityBench } from "./components/SecurityBench";
import { PineconeExplorer } from "./components/PineconeExplorer";
import { TestRunner } from "./components/TestRunner";
import { BeginnerGuide } from "./components/BeginnerGuide";
import { CodeExplorer } from "./components/CodeExplorer";
import { BlockchainEvent } from "./types";
import { Shield, Users, Radio, Terminal, ExternalLink } from "lucide-react";

export default function App() {
  const [circuitBreakerActive, setCircuitBreakerActive] = useState<boolean>(false);
  const [beginnerMode, setBeginnerMode] = useState<boolean>(true); // Default to ON for our beginner user!
  const [activeTab, setActiveTab] = useState<string>("command");

  // Initial event log
  const [events, setEvents] = useState<BlockchainEvent[]>([
    {
      id: "evt-init-1",
      eventName: "SecuritySanitizationVerified",
      data: {
        payloadHash: "0x8fae9680327f2fbe8e469399996e3927f91753767f40176df2314a51e592fcfb",
        status: "Option A Regex Redaction Verified",
      },
      timestamp: "12:00:00 PM",
      txHash: "0xa1e7492c10bdfa338290e21bc5991492040182410bc441094892041284910248",
    },
    {
      id: "evt-init-2",
      eventName: "MarketSignalArchived",
      data: {
        namespace: "market_signals",
        tokenId: 4041,
        floorPriceWei: "3400000000000000000",
        maxBidWei: "2720000000000000000",
        discountEnforced: "20.00% (8000 BPS)",
      },
      timestamp: "12:00:01 PM",
      txHash: "0xb791240185918239014819481902481092840912481902840192840192840192",
    },
  ]);

  const handleEmitEvent = (event: BlockchainEvent) => {
    setEvents((prev) => [event, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <Header
        circuitBreakerActive={circuitBreakerActive}
        beginnerMode={beginnerMode}
        setBeginnerMode={setBeginnerMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "command" && (
          <CommandCenter
            beginnerMode={beginnerMode}
            circuitBreakerActive={circuitBreakerActive}
            setCircuitBreakerActive={setCircuitBreakerActive}
            onEmitEvent={handleEmitEvent}
            events={events}
          />
        )}

        {activeTab === "security" && (
          <SecurityBench beginnerMode={beginnerMode} />
        )}

        {activeTab === "memory" && (
          <PineconeExplorer beginnerMode={beginnerMode} />
        )}

        {activeTab === "tests" && (
          <TestRunner beginnerMode={beginnerMode} />
        )}

        {activeTab === "guide" && (
          <BeginnerGuide />
        )}

        {activeTab === "code" && (
          <CodeExplorer beginnerMode={beginnerMode} />
        )}
      </main>

      {/* Production Operations Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                OP
              </div>
              <div>
                <span className="text-white font-semibold">EdgeScout v2 Production Agent</span>
                <span className="text-slate-500 ml-2">Optimism Mainnet (OP Stack, Chain ID: 10)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
              <span className="text-slate-400">
                Ceiling: <strong className="text-emerald-400">8000 BPS (80%)</strong>
              </span>
              <span className="text-slate-400">
                Breaker: <strong className="text-amber-400">-$25k USD Outflow / 3+ Whales</strong>
              </span>
              <span className="text-slate-400">
                Fallback: <strong className="text-indigo-400">gemini-3.8-flash ➔ 3.5-flash ➔ 3-flash-preview</strong>
              </span>
            </div>
          </div>

          {/* On-Call Support Rota from OPERATIONAL_CHEATSHEET.txt */}
          <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2">
            <div className="flex items-center space-x-4">
              <span className="font-semibold text-slate-400">Support Rota:</span>
              <span>Primary: Alex Chen (24/7)</span>
              <span>Secondary: Elena Rostova</span>
              <span>Vector: Marcus Vance</span>
              <span>Security: Sarah Jenkins</span>
            </div>
            <div>
              <span>Escalation Backup: Ry Hawthorne (Artist & Oversight)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
