import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Terminal,
  RefreshCw,
  ShieldAlert,
  GraduationCap,
  History,
  Sliders,
  Trash2,
  Info,
  Cpu,
  BookOpen
} from "lucide-react";

import {
  PROMPTING_RULES,
  RefinedPromptResponse,
  TestRunResponse
} from "./constants";

import { PresetSelector } from "./components/PresetSelector";
import { RulesManager } from "./components/RulesManager";
import { PromptSandbox } from "./components/PromptSandbox";

interface HistoryItem {
  id: string;
  timestamp: string;
  rawInput: string;
  mode: string;
  refinedResult: RefinedPromptResponse;
}

export default function App() {
  // --- 1. USER INPUTS & SKILL CATEGORIES STATE ---
  // rawInput: User ka dialouge yard (messy Urdu/English sentences)
  // mode: Learning Complexity level selected by user (Beginner, Intermediate, Expert)
  const [rawInput, setRawInput] = useState("");
  const [mode, setMode] = useState<"Beginner" | "Intermediate" | "Expert">("Intermediate");

  // --- 2. PIPELINE FLOW & RECOVERY STATE MANAGERS ---
  // isGenerating: Loading indicator while waiting for prompt refining API (/api/generate)
  // isSimulating: Loading indicator for side-by-side comparative diagnostics execution (/api/test-run)
  // generationError/simulateError: Handles and displays error responses gracefully
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [simulateError, setSimulateError] = useState<string | null>(null);

  // --- 3. PROMPT & SIMULATION RESOLVED RESULT MODULES ---
  // refinedResult: JSON payload matching standard RefinedPromptResponse interfaces
  // simulationResult: Novice vs Refined outputs cached for sandbox screens
  const [refinedResult, setRefinedResult] = useState<RefinedPromptResponse | null>(null);
  const [simulationResult, setSimulationResult] = useState<TestRunResponse | null>(null);

  // --- 4. VIEW LAYOUT & OVERLAYS TOGGLERS ---
  // currentTab: active segment inside prompt toolbox ("engineered" | "metrics" | "impact")
  // copiedText: Tracks recently copied items to toggle clipboard tick animations
  // isDownloadingPython: Loader ticker when downloading app.py
  // isRulesModalOpen: Open/close guidelines rules book panel overlay
  const [currentTab, setCurrentTab] = useState<"engineered" | "metrics" | "impact">("engineered");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isDownloadingPython, setIsDownloadingPython] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // --- 5. SYSTEM RULES ENGINE ENGINE (LOCAL STORAGE INLINE SYNC) ---
  // Default rules reside in Constants.ts, user modification updates this state & storage dynamically
  const [rules, setRules] = useState<Array<{ rule: string; tagTag: string; desc: string }>>(() => {
    const saved = localStorage.getItem("promptpilot_rules_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load prompt rules", e);
      }
    }
    return PROMPTING_RULES;
  });

  // Action callback: Add new rule block & sync locally
  const handleAddRule = (newRule: { rule: string; tagTag: string; desc: string }) => {
    const updated = [...rules, newRule];
    setRules(updated);
    localStorage.setItem("promptpilot_rules_v2", JSON.stringify(updated));
  };

  // Action callback: Remove an existing rule name & sync locally
  const handleDeleteRule = (ruleName: string) => {
    const updated = rules.filter(r => r.rule !== ruleName);
    setRules(updated);
    localStorage.setItem("promptpilot_rules_v2", JSON.stringify(updated));
  };

  // Action callback: Wipe dynamic customizations, restoring native default 8 pillars
  const handleResetRules = () => {
    setRules(PROMPTING_RULES);
    localStorage.setItem("promptpilot_rules_v2", JSON.stringify(PROMPTING_RULES));
  };

  // --- 6. USER HISTORY LOG SYNCER ---
  // Caches recent attempts so user can revisit their previously generated prompt cards offline.
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    const saved = localStorage.getItem("promptpilot_history_v1");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem("promptpilot_history_v1", JSON.stringify(newHistory));
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDownloadPrompt = (promptText: string, title: string) => {
    const element = document.createElement("a");
    const file = new Blob([promptText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `PromptPilot_${title.replace(/\s+/g, "_")}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadPythonMain = () => {
    setIsDownloadingPython(true);
    const link = document.createElement("a");
    link.href = "/api/download-python";
    link.setAttribute("download", "app.py");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsDownloadingPython(false), 1500);
  };

  // --- 7. CORE INTEGRATED ORCHESTRATOR TRIGGER ---
  // Yeh function sequential manner mein poora flow chalata hai:
  // (a) Input check karke loading flags sets karta hai
  // (b) Node API endpoints pe query throw karta hai takay structural JSON parameters and optimized prompt blueprint extract ki jaa sake.
  // (c) Success ke baad automatically side-by-side model outputs generate karne ke liye simulator trigger karta hai.
  // (d) End me local user history logs save kar deta hai localstorage me.
  const generateAndEvaluate = async (inputStr: string, chosenMode: string) => {
    if (!inputStr.trim()) return;

    // Reset loaders and error cards
    setIsGenerating(true);
    setGenerationError(null);
    setSimulateError(null);
    setRefinedResult(null);
    setSimulationResult(null);
    setCurrentTab("engineered");

    let generatedPrompt = "";
    let finalResultData: RefinedPromptResponse | null = null;

    try {
      // (Step A): Query main engine endpoint
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: inputStr, mode: chosenMode, customRules: rules })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate specialized prompt.");
      }

      // Read extracted attributes payload
      const data: RefinedPromptResponse = await res.json();
      setRefinedResult(data);
      generatedPrompt = data.refinedPrompt;
      finalResultData = data;
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || "Failed to generate refined prompt.");
      setIsGenerating(false);
      return;
    }

    setIsGenerating(false);

    // --- (Step B): BACKGROUND SIDE-BY-SIDE SIMULATION TRIAL ---
    // Agar prompt generation successful rahi, tou user tab transitions ke baghair real-time preview check kar sakta hai
    if (generatedPrompt && finalResultData) {
      setIsSimulating(true);
      try {
        const simRes = await fetch("/api/test-run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rawInput: inputStr,
            refinedPrompt: generatedPrompt
          })
        });

        if (!simRes.ok) {
          const simErr = await simRes.json();
          throw new Error(simErr.error || "Simulator diagnostic run failed.");
        }

        const simData: TestRunResponse = await simRes.json();
        setSimulationResult(simData);

        // --- (Step C): PERSIST CORRESPONDING ATTEMPT TO HISTORY ---
        const historyItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rawInput: inputStr,
          mode: chosenMode,
          refinedResult: finalResultData,
        };

        saveHistory([historyItem, ...history]);
      } catch (err: any) {
        console.error("Simulation error feedback:", err);
        setSimulateError(err.message || "Real feedback analysis benchmark failed.");
      } finally {
        setIsSimulating(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateAndEvaluate(rawInput, mode);
  };

  const handleLoadPresetAndRun = (intention: string) => {
    setRawInput(intention);
    generateAndEvaluate(intention, mode);
  };

  const handleLoadHistory = (item: HistoryItem) => {
    setRawInput(item.rawInput);
    setMode(item.mode as any);
    setRefinedResult(item.refinedResult);
    setSimulationResult(null);
    setCurrentTab("engineered");
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    saveHistory(updated);
  };

  const handleClearAllHistory = () => {
    saveHistory([]);
  };

  const filteredHistory = history.filter(item => 
    item.rawInput.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.refinedResult.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-purple-800/80">
      
      {/* HEADER SECTION (Beautiful Cyber Neon Navbar) */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-xl shadow-[0_0_15px_rgba(189,0,255,0.3)]">
            <GraduationCap className="h-6 w-6 text-white" id="app-logo" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2 neon-text-purple">
              PromptPilot AI
            </h1>
            <p className="text-[10px] text-purple-400 font-mono uppercase tracking-wider font-extrabold">
              Intelligent Prompt Refinement & Comparative Sandbox
            </p>
          </div>
        </div>

        {/* Active Engine Configuration Operator */}
        <div className="flex items-center gap-2.5">
          {/* Static Active Engine Status Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/60 border border-slate-850 px-3 py-1.5 rounded-xl text-xs text-slate-400 font-mono select-none">
            <span className="h-2 w-2 rounded-full bg-neon-emerald animate-pulse shrink-0" />
            <span>Active Engine</span>
          </div>

          {/* Single Dynamic Action Button to Operate AI Prompt Rules */}
          <button
            onClick={() => setIsRulesModalOpen(true)}
            className="flex items-center gap-2 bg-purple-950/40 hover:bg-purple-900/30 border border-purple-500/30 hover:border-purple-500/60 px-3.5 py-1.5 rounded-xl text-xs text-purple-300 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer font-bold font-mono uppercase shadow-md"
            title="Configure AI Prompting Rules"
          >
            <BookOpen className="h-3.5 w-3.5 text-purple-400" />
            <span>AI Rules: {rules.length}</span>
          </button>
        </div>
      </header>

      {/* SYSTEM BROADCAST (Plain, conversational mango-man guideline badge) */}
      <div className="bg-gradient-to-r from-purple-950/30 via-slate-900 to-indigo-950/30 border-b border-slate-800 text-slate-350 py-3.5 px-6 text-xs leading-relaxed flex items-center gap-3">
        <Info className="h-4.5 w-4.5 text-neon-blue shrink-0 animate-pulse" />
        <span className="font-sans">
          🚀 <strong>Aam Shehri Concept:</strong> Apni aam, rozmarra baat likhein (Urdu/English mixed). Hamari AI automatically standard syllabus, rules filter aur learning restrictions laga kar ek copy-ready expert chatbot guide bana degi!
        </span>
      </div>

      {/* CORE GRAPHIC WORKSPACE GRID */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT COLUMN (Inputs, sliders, historic searches) */}
        <section className="lg:col-span-5 flex flex-col space-y-6" id="input-section">
          
          {/* Preset Buttons loaded elegantly */}
          <PresetSelector onSelect={handleLoadPresetAndRun} />

          {/* Core Intention Input Card and slider selection */}
          <div className="bg-dark-card border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden neon-border-purple">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-neon-purple"></div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2 font-mono">
                <Terminal className="h-4 w-4" /> Convert Real Goals to Expert Prompts
              </h2>
              <span className="text-[10px] bg-slate-900 border border-slate-800 text-neon-blue px-2.5 py-0.5 rounded-md font-bold font-mono">
                STUDENT SANDBOX
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide block mb-2">
                  What do you want AI to help you with?
                </label>
                <textarea
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder="e.g., 'Ghar ka monthly budget seekhna hai basic formulas se' or 'Explain basic gardening to complete novice children.'"
                  className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-neon-purple focus:bg-slate-950 focus:shadow-[0_0_15px_rgba(189,0,255,0.15)] rounded-xl p-4 min-h-[110px] text-white placeholder-slate-550 focus:outline-none transition-all duration-300 leading-relaxed font-sans"
                  required
                  id="raw-input-box"
                />
              </div>

              {/* Mode Complexity Selector slider */}
              <div className="bg-slate-950/80 border border-slate-800/60 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5 font-mono">
                    <Sliders className="h-3.5 w-3.5 text-purple-400" /> Mode Complexities
                  </span>
                  <span className="text-[10px] bg-neon-blue/10 text-neon-blue border border-neon-blue/20 px-2.5 py-0.5 rounded font-mono font-bold uppercase">
                    {mode} Mode
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(["Beginner", "Intermediate", "Expert"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`py-2 text-[10px] font-extrabold rounded-lg border uppercase tracking-wider font-mono transition-all duration-300 cursor-pointer ${
                        mode === m
                          ? "bg-purple-600 text-white border-purple-500 shadow-[0_0_12px_rgba(189,0,255,0.4)]"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/80"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {mode === "Beginner" && "Simple explanations, gentle metaphors, step-by-step logic."}
                  {mode === "Intermediate" && "Standard layout parameters with active evaluation rubrics."}
                  {mode === "Expert" && "Deep, rigorous boundaries, and strict error analysis constraints."}
                </p>
              </div>

              {/* ACTION GENERATION TRIGGER BUTTON */}
              <button
                type="submit"
                disabled={isGenerating || isSimulating || !rawInput.trim()}
                className={`w-full py-4 flex items-center justify-center space-x-2.5 text-xs font-extrabold rounded-xl transition-all duration-300 cursor-pointer tracking-wider uppercase shadow-lg ${
                  !rawInput.trim() || isGenerating || isSimulating
                    ? "bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(189,0,255,0.45)] text-white active:scale-[0.98]"
                }`}
                id="submit-generate-btn"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                    <span>Analyzing & Structuring...</span>
                  </>
                ) : isSimulating ? (
                  <>
                    <Cpu className="h-4 w-4 animate-bounce text-white" />
                    <span>Executing Simulation Sandbox...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-white" />
                    <span>Generate Prompt Pilot</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* HISTORICAL SEARCHES */}
          <div className="bg-dark-card border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-3.5 relative overflow-hidden">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <History className="h-4 w-4 text-purple-400" /> Prompt History ({history.length})
              </span>
              {history.length > 0 && (
                <button
                  onClick={handleClearAllHistory}
                  className="text-[10px] text-rose-400 hover:underline font-bold uppercase transition hover:text-rose-300 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="p-4 bg-slate-950 border border-slate-800/60 text-center rounded-xl text-xs text-slate-550 italic font-medium leading-relaxed">
                No past searches stored. Generated prompts will display here.
              </div>
            ) : (
              <div className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Filter previous runs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 text-white placeholder-slate-550 focus:border-purple-650 rounded-xl px-3 py-2 focus:outline-none transition-all"
                />

                <div className="max-h-[200px] overflow-y-auto space-y-1.5 pr-1">
                  {filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleLoadHistory(item)}
                      className="group p-2.5 bg-slate-950 hover:bg-purple-950/20 rounded-xl border border-slate-800/60 hover:border-purple-500/50 transition duration-200 text-left cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex justify-between items-center text-[9px] text-slate-450 mb-0.5 font-mono">
                          <span className="font-extrabold uppercase text-neon-blue bg-neon-blue/10 px-1 rounded">
                            {item.mode}
                          </span>
                          <span>{item.timestamp}</span>
                        </div>
                        <h4 className="text-[11px] font-bold text-white group-hover:text-neon-purple truncate select-none transition-colors">
                          {item.refinedResult.topic || item.rawInput}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate italic">
                          "{item.rawInput}"
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Delete historic record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {filteredHistory.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-500 italic">No matches found.</div>
                  )}
                </div>
              </div>
            )}
          </div>

        </section>

        {/* RIGHT COLUMN RESULT VIEWPORTS */}
        <section className="lg:col-span-7 flex flex-col space-y-6" id="output-section">
          
          {/* Rules Configuration Console is now safely operated via the Top Header Modal */}

          {/* Actionable Error Panels */}
          {generationError && (
            <div className="p-4.5 border border-rose-500/20 bg-rose-950/25 rounded-2xl text-rose-300 text-xs flex items-start gap-3 shadow-lg">
              <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
              <div>
                <h4 className="font-extrabold text-rose-200 uppercase tracking-wide">Refinement Studio Error</h4>
                <p className="mt-1 font-mono text-rose-350 leading-relaxed">{generationError}</p>
              </div>
            </div>
          )}

          {/* Core Sandbox Interactive Outputs */}
          {refinedResult ? (
            <PromptSandbox
              refinedResult={refinedResult}
              simulationResult={simulationResult}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              copiedText={copiedText}
              onCopy={handleCopyToClipboard}
              onDownloadPrompt={handleDownloadPrompt}
              isSimulating={isSimulating}
              simulateError={simulateError}
            />
          ) : (
            /* Idle Static placeholder state styled as a sci-fi cockpit */
            <div className="bg-dark-card border border-slate-800/80 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden select-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-neon-purple/5 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/20 text-neon-purple rounded-2xl animate-pulse flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-neon-purple" />
              </div>

              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2 font-display">
                Pilot Engine Workspace Idle
              </h3>
              <p className="text-xs text-slate-450 leading-relaxed max-w-sm text-slate-400 mb-6">
                No telemetry generated yet. Select a trial preset or insert what you wish to study in the student box on the left, then trigger <strong className="text-neon-purple">"Generate Prompt Pilot"</strong>.
              </p>

              <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl border-dashed">
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest leading-loose">
                  ⚡ OFFLINE PRESISTENT CACHE READY
                </p>
              </div>
            </div>
          )}

        </section>

      </main>

      {/* FOOTER BAR */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center shadow-[0_-4px_30px_rgba(0,0,0,0.4)] mt-auto z-10">
        <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase font-bold">
          PROMPT PILOT ENGINE CONFIGURATION SYSTEM • DEVELOPER MAAS CAPABILITIES INJECTED • SECURE PERSISTENCE SETUP
        </p>
      </footer>

      {/* Rules Manager Modal Console */}
      <RulesManager
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        rules={rules}
        onAddRule={handleAddRule}
        onDeleteRule={handleDeleteRule}
        onResetRules={handleResetRules}
      />
    </div>
  );
}
