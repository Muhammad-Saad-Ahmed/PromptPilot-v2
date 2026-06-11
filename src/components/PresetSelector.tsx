import React from "react";
import { Sparkles, HelpCircle } from "lucide-react";
import { PRESETS, PresetItem } from "../constants";

// PROPS DEFINITION:
// 'onSelect' function parent component (App.tsx) se aati hai jo rawInput state ko update karti hai jab user preset select karta hai.
interface PresetSelectorProps {
  onSelect: (intention: string) => void;
}

/**
 * PRESET SELECTOR COMPONENT:
 * Yeh component common examples (priors/presets) display karta hai taake aam shehri (users) ko pata chal sake ke PromptPilot
 * kis kism ke simple, natural concerns ko convert karta hai. No expert prompting knowledge is required here.
 */
export function PresetSelector({ onSelect }: PresetSelectorProps) {
  return (
    <div className="bg-dark-card border border-slate-800/80 rounded-2xl p-5 shadow-2xl relative overflow-hidden neon-border-blue transition-all duration-300">
      {/* Background radial soft light decor for futuristic look */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-neon-blue/5 rounded-full blur-2xl pointer-events-none"></div>
      
      {/* HEADER ROW: Section subtitle with an animated sparkle icon, and helper indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] uppercase tracking-wider font-extrabold text-cyan-400 font-mono flex items-center gap-1.5 neon-text-blue">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Popular Trial Presets / Aam Shehri Masail
        </span>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
          <HelpCircle className="h-3 w-3 text-neon-blue" />
          <span>No Expert Knowledge Needed</span>
        </div>
      </div>

      {/* Description text helper */}
      <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
        Select a conversational, simple Urdu/English goal below to see how PromptPilot designs high-quality AI guides for daily life.
      </p>

      {/* GRID LAYOUT: Maps through preset items defined in constants.ts to render clickable cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="preset-grid">
        {PRESETS.map((preset: PresetItem) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.intention)} // Triggers rawInput reload on click
            className="text-left bg-slate-900/60 hover:bg-slate-900/100 border border-slate-800/50 hover:border-cyan-400/60 p-3.5 rounded-xl transition-all duration-300 cursor-pointer hover:shadow-[0_0_12px_rgba(0,240,255,0.1)] group flex flex-col justify-between h-auto"
          >
            {/* Displaying simple Urdu title of the preset example */}
            <span className="text-white group-hover:text-neon-blue text-xs font-bold block mb-1.5 select-none transition-colors">
              {preset.title}
            </span>
            {/* Displaying Urdu/English mixed messy prompt instruction */}
            <p className="text-[10px] text-slate-400 group-hover:text-slate-350 line-clamp-2 leading-relaxed italic">
              "{preset.intention}"
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

