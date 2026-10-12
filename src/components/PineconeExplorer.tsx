import React, { useState, useEffect } from "react";
import { Database, Plus, Search, Tag, Cpu, Layers, Info, Check } from "lucide-react";
import { PineconeState, PineconeEntry } from "../types";

interface PineconeExplorerProps {
  beginnerMode: boolean;
}

export const PineconeExplorer: React.FC<PineconeExplorerProps> = ({ beginnerMode }) => {
  const [activeNamespace, setActiveNamespace] = useState<"identity" | "strategies" | "market_signals">("identity");
  const [memoryState, setMemoryState] = useState<PineconeState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Form for adding memory
  const [newId, setNewId] = useState<string>("");
  const [newContent, setNewContent] = useState<string>("");
  const [addSuccess, setAddSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchMemoryState();
  }, []);

  const defaultMemory: PineconeState = {
    dimension: 3072,
    namespaces: {
      identity: [
        {
          id: "ID-RISK-PROFILE-AGGRESSIVE",
          vectorPreview: [0.038, -0.012, 0.089, -0.045, 0.112],
          metadata: {
            role: "Autonomous Buyer",
            targetCollection: "_404/LostLayer",
            targetTokenId: 4041,
            artist: "Ry Hawthorne",
            maxBidCeilingBps: 8000,
            discountPercentage: "20.00%",
            smartMoneyThresholdUSD: 25000,
            network: "Optimism OP Stack (Chain ID: 10)",
            circuitBreakerPolicy: "Immediate freeze on -$25k USD netflows or 3+ whale exchange deposits"
          },
          createdAt: "2026-10-01T08:00:00Z"
        }
      ],
      strategies: [
        {
          id: "STRAT-OP-CB-202306",
          vectorPreview: [0.071, -0.082, 0.019, 0.043, -0.091],
          metadata: {
            origin: "OP/Base Ecosystem Drop Analysis",
            lesson: "Whale liquidity drains precede NFT floor collapses by an average of 42 minutes. Front-running the drop via contract interlock prevents illiquid inventory lockups.",
            confidenceScore: 0.94
          },
          createdAt: "2026-10-02T14:30:00Z"
        }
      ],
      market_signals: [
        {
          id: "SIG-OP-4041-002",
          vectorPreview: [-0.042, 0.061, 0.094, -0.011, 0.037],
          metadata: {
            tokenId: 4041,
            floorPriceWei: "3400000000000000000",
            floorPriceETH: "3.40",
            maxBidWei: "2720000000000000000",
            maxBidETH: "2.72",
            netflowUSD: -142500,
            status: "ARCHIVED_SIGNAL"
          },
          createdAt: "2026-10-05T12:00:00Z"
        }
      ]
    }
  };

  const fetchMemoryState = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pinecone/state");
      if (res.ok) {
        const data = await res.json();
        setMemoryState(data);
        return;
      }
    } catch {
      // Graceful fallback to defaultMemory
    }
    setMemoryState(defaultMemory);
    setLoading(false);
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newContent) return;

    try {
      const res = await fetch("/api/pinecone/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namespace: activeNamespace,
          id: newId,
          metadata: { note: newContent, userLogged: true }
        })
      });
      const data = await res.json();
      if (data.success) {
        setAddSuccess(true);
        setNewId("");
        setNewContent("");
        setTimeout(() => setAddSuccess(false), 3000);
        fetchMemoryState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {beginnerMode && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 text-indigo-200 text-sm flex items-start space-x-3 shadow-sm">
          <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-indigo-300">
              💡 What is Pinecone 3072-D Vector Memory?
            </p>
            <p className="text-indigo-200/90 text-xs leading-relaxed">
              Computers do not remember concepts like humans do—they turn ideas into long lists of numbers called <strong>vectors</strong>.
              In EdgeScout, every lesson and risk rule is converted into <strong>3,072 numbers</strong> and organized into 3 folders ("namespaces"):
              <strong className="text-white"> identity</strong> (who EdgeScout is and what rules it follows),
              <strong className="text-white"> strategies</strong> (lessons learned from past market crashes), and
              <strong className="text-white"> market_signals</strong> (past price observations and purchase settlements).
            </p>
          </div>
        </div>
      )}

      {/* Pinecone Stats Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-white font-bold text-base">Pinecone Vector Memory Map</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  3,072 Dimensions
                </span>
              </div>
              <p className="text-xs text-slate-400">Target Index: edgescout-v2-memory (Optimism Cluster)</p>
            </div>
          </div>

          {/* Namespace Selector Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            {(["identity", "strategies", "market_signals"] as const).map((ns) => (
              <button
                key={ns}
                onClick={() => setActiveNamespace(ns)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                  activeNamespace === ns
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {ns.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Namespace Details & Items */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Namespace: <strong className="text-purple-300 font-mono">/{activeNamespace}</strong></span>
            <span>
              {memoryState?.namespaces[activeNamespace]?.length || 0} Vector Record(s) Stored
            </span>
          </div>

          {loading ? (
            <div className="text-center py-10 text-slate-500 text-xs">Loading vector memory...</div>
          ) : (
            <div className="space-y-3">
              {memoryState?.namespaces[activeNamespace]?.map((entry: PineconeEntry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-purple-400">{entry.id}</span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Vector Preview (First 5 Dimensions) */}
                  <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center space-x-2">
                    <span className="text-slate-500 font-semibold">3072-D Slice:</span>
                    <span className="text-indigo-400">[{entry.vectorPreview.join(", ")}, ...]</span>
                  </div>

                  {/* Metadata key-values */}
                  <div className="text-xs font-mono text-slate-300 pt-1 border-t border-slate-800/50">
                    <pre className="text-[11px] text-slate-300 overflow-x-auto p-1 leading-relaxed">
                      {JSON.stringify(entry.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Memory Form */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h3 className="text-xs font-semibold text-white mb-3 flex items-center space-x-2">
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span>Store New Vector Observation to /{activeNamespace}</span>
          </h3>

          <form onSubmit={handleAddMemory} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Vector Record ID</label>
              <input
                type="text"
                placeholder="e.g. STRAT-LOSTLAYER-DROP"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[11px] text-slate-400 block mb-1">Observation / Lesson Note</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. Volume spiked 300% before floor stabilization at 3.40 ETH"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-colors shrink-0 shadow-sm"
                >
                  Store Memory
                </button>
              </div>
            </div>
          </form>

          {addSuccess && (
            <p className="mt-2 text-xs text-emerald-400 flex items-center space-x-1.5 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Vectorized & committed to namespace /{activeNamespace}!</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
