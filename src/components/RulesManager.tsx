import React, { useState } from "react";
import { BookOpen, Check, Trash2, Sparkles, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Rule Blueprint Structure
interface PromptRule {
  rule: string;
  tagTag: string;
  desc: string;
}

// PROPS DEFINITIONS:
// isOpen: control modal overlay visibility
// onClose: callback to hide rules module
// rules: current active rules array (synced with App.tsx state & localstorage)
// onAddRule: append a custom instruction rule
// onDeleteRule: remove a rule
// onResetRules: restore default 8 rules structures
interface RulesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  rules: PromptRule[];
  onAddRule: (rule: PromptRule) => void;
  onDeleteRule: (ruleName: string) => void;
  onResetRules: () => void;
}

/**
 * RULES MANAGER COMPONENT:
 * Allows students and designers to edit active prompt construction rules.
 * Modified rules are applied in real-time when submitting a raw intention.
 */
export function RulesManager({
  isOpen,
  onClose,
  rules,
  onAddRule,
  onDeleteRule,
  onResetRules
}: RulesManagerProps) {
  // --- INLINE FORM STATE FOR NEW RULE CREATION ---
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleTag, setNewRuleTag] = useState("");
  const [newRuleDesc, setNewRuleDesc] = useState("");
  const [error, setError] = useState<string | null>(null);

  // If closed, avoid rendering anything (Safe Guard)
  if (!isOpen) return null;

  // --- SUBMIT COMPILER: Triggers validation & updates parents state ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = newRuleName.trim();
    const tag = newRuleTag.trim();
    const desc = newRuleDesc.trim();

    // Field validity checks
    if (!name || !tag || !desc) {
      setError("Please fill in all inputs to proceed.");
      return;
    }

    // Uniqueness constraint check
    const exists = rules.some(r => r.rule.toLowerCase() === name.toLowerCase());
    if (exists) {
      setError("This rule name already exists in the catalog.");
      return;
    }

    // Call state update in parent & clean inputs
    onAddRule({ rule: name, tagTag: tag, desc });
    setNewRuleName("");
    setNewRuleTag("");
    setNewRuleDesc("");
  };

  return (
    <AnimatePresence>
      {/* OVERLAY WRAPPER: Full screen blur black backdrop */}
      <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        {/* Click outside backdrop closer */}
        <div className="absolute inset-0 cursor-default" onClick={onClose}></div>

        {/* MODAL CARD CONTAINER: Uses Framer Motion for premium scale-in/out animation effects */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-slate-900 border border-purple-500/35 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(189,0,255,0.25)] relative z-10"
        >
          {/* 1. HEADER SECTION: Title with Book icon & Close controls */}
          <div className="border-b border-slate-800 p-5 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 text-neon-purple rounded-xl">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black font-display text-white uppercase tracking-wider">
                  PromptPilot Interactive Rules Book
                </h3>
                <p className="text-[10px] text-purple-400 font-mono font-bold uppercase tracking-widest">
                  Manage active rules on which your prompt generator acts
                </p>
              </div>
            </div>
            {/* Close Button X */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-slate-850 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-xl transition cursor-pointer border border-slate-805"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 2. MAIN SCROLLABLE WRAPPER */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
            
            {/* Philosophy description banner */}
            <div className="p-4 bg-purple-950/25 rounded-2xl border border-purple-800/40">
              <h4 className="font-extrabold text-white mb-1 uppercase tracking-wide flex items-center gap-1.5 font-mono text-[11px]">
                <Sparkles className="h-4 w-4 text-neon-purple animate-pulse inline" /> Engine Rules Architecture
              </h4>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                These precise, live rules are injected directly into the LLM prompt generator. The generator constructs your expert prompts strictly conforming to this dynamic schema. You can read, delete, and add new rules here.
              </p>
            </div>

            {/* LIVE CATALOG MODULE: Displays list of active rules inside the prompt generator */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-purple-400 font-mono">
                  Active Catalog ({rules.length} Rules Layered)
                </h4>
                {/* Reset button to restore native defaults */}
                <button
                  type="button"
                  onClick={onResetRules}
                  className="text-[9px] text-purple-300 hover:text-white uppercase font-mono font-bold bg-slate-950 border border-slate-800 px-2.5 py-1 rounded hover:bg-neon-purple/20 transition-all duration-200 cursor-pointer"
                  title="Restore standard 8 pillars"
                >
                  Reset Defaults
                </button>
              </div>

              {/* LIST GRID OF ACTIVE RULES */}
              <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                {rules.map((rule, idx) => (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 hover:border-purple-500/20 transition-colors flex flex-col space-y-1.5">
                    <div className="flex justify-between items-center gap-2">
                      <strong className="text-purple-300 text-[11px] font-mono uppercase tracking-wide flex items-center gap-1">
                        <Check className="h-3.5 w-3.5 text-neon-emerald" /> {rule.rule}
                      </strong>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-purple-500/10 text-neon-purple border border-neon-purple/20 font-mono px-1.5 rounded">
                          {rule.tagTag}
                        </span>
                        {/* Delete button option */}
                        <button
                          type="button"
                          onClick={() => onDeleteRule(rule.rule)}
                          className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-450 rounded transition duration-150 cursor-pointer"
                          title="Remove Rule From Engine"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      {rule.desc}
                    </p>
                  </div>
                ))}
                {/* Empty fallback state */}
                {rules.length === 0 && (
                  <div className="text-center py-6 italic text-slate-500 text-[11px]">No rules loaded inside engine book. Engine is running without guidelines.</div>
                )}
              </div>
            </div>

            {/* NATIVE RULE CREATOR WORKSPACE: Allows appending more system constraints dynamically */}
            <div className="bg-slate-950/80 border border-purple-500/20 p-4.5 rounded-2xl space-y-3.5">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-neon-purple font-mono flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-neon-purple animate-pulse" /> Add Custom Rule Inline
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Name */}
                <div>
                  <label className="text-[9px] font-bold text-slate-405 uppercase block mb-1 font-mono">Rule Title (Heading)</label>
                  <input
                    type="text"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    placeholder="e.g. Rule 9: Jargon Control"
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-600 focus:outline-none focus:border-neon-purple transition-all font-sans"
                  />
                </div>

                {/* Tag Tag */}
                <div>
                  <label className="text-[9px] font-bold text-slate-405 uppercase block mb-1 font-mono">Tag Tag (Enforcer)</label>
                  <input
                    type="text"
                    value={newRuleTag}
                    onChange={(e) => setNewRuleTag(e.target.value)}
                    placeholder="e.g. Simple-Vocabulary:"
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-600 focus:outline-none focus:border-neon-purple transition-all font-sans"
                  />
                </div>
              </div>

              {/* Instructions Content */}
              <div>
                <label className="text-[9px] font-bold text-slate-405 uppercase block mb-1 font-mono">Instruction Specification (Description)</label>
                <textarea
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  placeholder="Command details (e.g. explain concepts only using household examples)..."
                  className="w-full text-[11px] bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-650 focus:outline-none focus:border-neon-purple transition-all min-h-[50px] leading-relaxed font-sans"
                />
              </div>

              {/* Submit error display state */}
              {error && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 font-semibold text-[10px] flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-450" />
                  <span>{error}</span>
                </div>
              )}

              {/* Dynamic append button */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-2 bg-purple-750 hover:bg-purple-650 text-white font-bold text-[11px] rounded-lg tracking-wide uppercase transition font-mono shadow-[0_0_12px_rgba(189,0,255,0.15)] active:scale-95 cursor-pointer"
              >
                Confirm & Append Rule Into Live Book
              </button>
            </div>

          </div>

          {/* 3. MODAL FOOTER */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-center">
            <span className="text-[9px] text-purple-400 font-mono uppercase tracking-widest font-bold text-center">
              🛡️ PROMPT ENGINE LIVE CONSOLE • ACTIVE RULES ENGAGED
            </span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}

