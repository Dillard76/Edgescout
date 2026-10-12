import React, { useState } from "react";
import { CODEBASE_FILES, CodeFile } from "../data/codebaseFiles";
import { FileCode, Copy, Check, Download, Info, Terminal, ChevronRight } from "lucide-react";

interface CodeExplorerProps {
  beginnerMode: boolean;
}

export const CodeExplorer: React.FC<CodeExplorerProps> = ({ beginnerMode }) => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(CODEBASE_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {beginnerMode && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 text-indigo-200 text-sm flex items-start space-x-3 shadow-sm">
          <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-indigo-300">
              💡 Codebase Explorer
            </p>
            <p className="text-indigo-200/90 text-xs leading-relaxed">
              Every file needed to build, test, and run EdgeScout v2 on the Optimism blockchain is displayed below. 
              Click any file on the left to see its code, read what each file does in plain English, and copy or download it with one click.
            </p>
          </div>
        </div>
      )}

      {/* Main Code Viewer Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar File List */}
        <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 shadow-md">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block px-2 mb-2">
            Project Files ({CODEBASE_FILES.length})
          </span>
          <div className="space-y-1">
            {CODEBASE_FILES.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                  selectedFile.path === file.path
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <FileCode className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Code Content & Header */}
        <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-white font-bold text-sm font-mono">{selectedFile.path}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {selectedFile.language}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedFile.description}</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center space-x-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Beginner Explanation Box */}
          <div className="p-3.5 rounded-lg bg-indigo-950/30 border border-indigo-900/50 text-xs text-indigo-200/90 leading-relaxed space-y-1">
            <span className="font-semibold text-indigo-300 block">💡 Plain English Breakdown:</span>
            <p>{selectedFile.beginnerNote}</p>
          </div>

          {/* Code Window with Line Numbers */}
          <div className="relative rounded-xl bg-slate-950 border border-slate-800/90 overflow-hidden">
            <div className="p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed select-all">
              <pre>{selectedFile.content}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
