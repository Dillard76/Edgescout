import React from "react";
import { Shield, ShieldAlert, Cpu, Layers, Sparkles, HelpCircle, CheckCircle } from "lucide-react";

interface HeaderProps {
  circuitBreakerActive: boolean;
  beginnerMode: boolean;
  setBeginnerMode: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  circuitBreakerActive,
  beginnerMode,
  setBeginnerMode,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Agent Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-red-500 to-amber-500 flex items-center justify-center shadow-md shadow-red-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold text-lg tracking-tight">EdgeScout</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  v2.0 OP
                </span>
                <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Chain ID: 10
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Target: Ry Hawthorne <span className="text-amber-400 font-mono">_404/LostLayer #4041</span>
              </p>
            </div>
          </div>

          {/* Real-time Status Badges */}
          <div className="flex items-center space-x-3">
            {/* 80% Bid Ceiling Badge */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>80% Ceiling (8,000 BPS)</span>
            </div>

            {/* Circuit Breaker Status Indicator */}
            <div
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg border text-xs font-medium transition-all ${
                circuitBreakerActive
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse shadow-md shadow-rose-500/20"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              }`}
            >
              {circuitBreakerActive ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span className="font-semibold">BREAKER TRIPPED (FROZEN)</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>INTERLOCK OPERATIONAL</span>
                </>
              )}
            </div>

            {/* Beginner Mode Toggle */}
            <button
              onClick={() => setBeginnerMode(!beginnerMode)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                beginnerMode
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
              }`}
              title="Toggle beginner plain English explanations"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{beginnerMode ? "Beginner Guide: ON" : "Beginner Guide: OFF"}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-t border-slate-800/80 pt-2 pb-2 overflow-x-auto text-sm no-scrollbar">
          {[
            { id: "command", label: "🎯 Live Agent Playground", desc: "Interactive Simulator" },
            { id: "security", label: "🔒 Zero-Trust Sanitizer", desc: "Regex Redaction" },
            { id: "memory", label: "🧠 Pinecone 3072-D Memory", desc: "Vector Explorer" },
            { id: "tests", label: "🧪 Hardhat Unit Tests", desc: "Safety Proofs" },
            { id: "guide", label: "📖 Beginner Step-by-Step", desc: "Click & Copy Guide" },
            { id: "code", label: "💻 Codebase & Contracts", desc: "Full Source Viewer" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md font-medium text-xs whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                activeTab === tab.id
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
