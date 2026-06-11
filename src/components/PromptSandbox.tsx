import React from "react";
import { motion } from "motion/react";
import {
  Terminal,
  Check,
  Copy,
  Download,
  ListChecks,
  Play,
  Cpu,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Eye,
  RefreshCw
} from "lucide-react";
import { RefinedPromptResponse, TestRunResponse } from "../constants";

// PROPS DEFINITIONS FOR THE SANDBOX INTERACTIVE WORKSPACE:
// - refinedResult: Main JSON payload sent by Gemini (contains stats, optimized prompt, metrics, etc.)
// - simulationResult: Side-by-side comparative output runs (Novice vs Refined)
// - currentTab: Selected view state ("engineered" | "metrics" | "impact")
// - setCurrentTab: Tab updating function callback
// - copiedText: Ticker state indicating which block was recently copied
// - onCopy: Callback to copy text safely to clipboard
// - onDownloadPrompt: Save copyable prompt text onto user storage
// - isSimulating: Loading state for background diagnostics comparison runs
// - simulateError: Error log if Gemini comparison runs crash
interface PromptSandboxProps {
  refinedResult: RefinedPromptResponse;
  simulationResult: TestRunResponse | null;
  currentTab: "engineered" | "metrics" | "impact";
  setCurrentTab: (tab: "engineered" | "metrics" | "impact") => void;
  copiedText: string | null;
  onCopy: (text: string, id: string) => void;
  onDownloadPrompt: (promptText: string, title: string) => void;
  isSimulating: boolean;
  simulateError: string | null;
}

/**
 * PROMPT SANDBOX COMPONENT:
 * Presentational workspace displaying:
 * 1. The beautifully engineered prompt matching Socratic coaching paradigms.
 * 2. Visual comparison meters showing how PromptPilot upgraded user input.
 * 3. Side-by-side terminal simulations testing the prompt outputs.
 */
export function PromptSandbox({
  refinedResult,
  simulationResult,
  currentTab,
  setCurrentTab,
  copiedText,
  onCopy,
  onDownloadPrompt,
  isSimulating,
  simulateError
}: PromptSandboxProps) {
  
  // --- DOWNLOAD ANALYSIS REPORT (.MD) GENERATOR ---
  // Yeh function aik clean markdown (.md) report generate karta hai jise user download kar sakta hai.
  // Es report mein topic, preset modes, comparison quality metrics aur missing gaps ka detailed list hota hai.
  const handleDownloadEvaluationReport = () => {
    const reportText = `# PROMPTPILOT DETAILED PROMPT EVALUATION REPORT
(PromptPilot ki Tafseeli Report)

## 🎯 Target Topic (Sabaq ka Unwan)
${refinedResult.topic}
${refinedResult.goal ? `\n## 🎭 Persona Mode Assigned: ${refinedResult.goal}` : ""}
- Skill Level Category (Mushkil ka darja): ${refinedResult.skillLevel || "Adaptive Learn"}
- Student Output Format (Kaam ka design): ${refinedResult.outputType || "Structured Chapters & Exercises"}

---

## 📊 Quality Metric Comparison (Mawazna / Scale of 10)
How your raw input was upgraded to a professional Socratic level:

1. Topic Clarity & Depth (Baat kitni saaf hai)
   - Your Raw Input (Pehle): ${refinedResult.metrics.goalClarityUser}/10
   - PromptPilot Upgraded (Baad me): ${refinedResult.metrics.goalClarityGenerated}/10

2. Syllabus Boundary (Syllabus ki Hadden)
   - Your Raw Input (Pehle): ${refinedResult.metrics.contextUser}/10
   - PromptPilot Upgraded (Baad me): ${refinedResult.metrics.contextGenerated}/10

3. Output Style & Format (Kaam karne ka tarika)
   - Your Raw Input (Pehle): ${refinedResult.metrics.outputFormatUser}/10
   - PromptPilot Upgraded (Baad me): ${refinedResult.metrics.outputFormatGenerated}/10

4. No-Cheating Rules (Bina cheating ke seekhna)
   - Your Raw Input (Pehle): ${refinedResult.metrics.constraintsUser}/10
   - PromptPilot Upgraded (Baad me): ${refinedResult.metrics.constraintsGenerated}/10

5. Quiz & Practice (Chote sawal aur test)
   - Your Raw Input (Pehle): ${refinedResult.metrics.successCriteriaUser}/10
   - PromptPilot Upgraded (Baad me): ${refinedResult.metrics.successCriteriaGenerated}/10

---

## 🔍 Loop Holes Fixed (Aap ke prompt me reh janay wali kamiyan jo safe ho gayeen)
${refinedResult.missingInformation && refinedResult.missingInformation.length > 0 
  ? refinedResult.missingInformation.map((item, idx) => `🔴 **Gap ${idx + 1}**: ${item}`).join('\n')
  : "No major loop holes detected! Your initial prompt was very detailed."}

## 💡 How We Handled Them (PromptPilot ka hal)
${refinedResult.impacts?.map((imp, idx) => `### Slot ${idx + 1}: ${imp.missing}\n- 🛡️ **Solution Applied**: ${imp.impact}`).join('\n\n') || "N/A"}

---

## ⚖️ Scorecard Grading (AI friendly score)
- Creativity (Khayaal): ${refinedResult.assignmentEvaluation.creativity}/10
- Practical Use (Asal Zindagi): ${refinedResult.assignmentEvaluation.realWorldProblem}/10
- AI Logic (Aqal): ${refinedResult.assignmentEvaluation.aiUsage}/10
- Structure (Likhaee): ${refinedResult.assignmentEvaluation.documentation}/10
- Difficulty level (Mushkil ka level): ${refinedResult.assignmentEvaluation.difficulty}/10

---
Thank you for using PromptPilot AI! Aap ka Socratic Coach ab tayyar hai!`;

    // Setup an ephemeral virtual anchor tag to download file directly in-browser
    const element = document.createElement("a");
    const file = new Blob([reportText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `PromptPilot_Evaluation_${refinedResult.topic.replace(/\s+/g, "_")}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };


  return (
    <div className="bg-dark-card border border-slate-800/80 rounded-3xl flex flex-col min-h-[580px] overflow-hidden shadow-2xl relative">
      {/* Glow Effect */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-neon-purple/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Tab Swappers & Toolbar Actions */}
      <div className="border-b border-slate-800/80 bg-slate-950/70 p-3.5 flex flex-wrap gap-2 items-center justify-between z-10">
        <div className="flex space-x-1.5 overflow-x-auto">
          <button
            onClick={() => setCurrentTab("engineered")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all focus:outline-none flex items-center space-x-2 cursor-pointer ${
              currentTab === "engineered"
                ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(189,0,255,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-slate-900/60"
            }`}
            id="tab-prompt"
          >
            <Terminal className="h-4 w-4" />
            <span>1. Engineered Prompt</span>
          </button>

          <button
            onClick={() => setCurrentTab("metrics")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all focus:outline-none flex items-center space-x-2 cursor-pointer ${
              currentTab === "metrics"
                ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(189,0,255,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-slate-900/60"
            }`}
            id="tab-evaluation"
          >
            <ListChecks className="h-4 w-4" />
            <span>2. Evaluation & Loop Holes</span>
          </button>
        </div>

        {/* Copy / Export Prompt Actions */}
        <div className="flex items-center space-x-1.5 ml-auto sm:ml-0">
          <button
            onClick={() => onCopy(refinedResult.refinedPrompt, "refined")}
            className="px-3 py-1.5 text-[10px] font-bold bg-slate-900 hover:bg-slate-950 border border-slate-800 text-white rounded-lg transition-all flex items-center gap-1 cursor-pointer"
          >
            {copiedText === "refined" ? (
              <>
                <Check className="h-3 w-3 text-neon-emerald" />
                <span className="text-neon-emerald">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>COPY PROMPT</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              if (currentTab === "engineered") {
                onDownloadPrompt(refinedResult.refinedPrompt, refinedResult.topic);
              } else {
                handleDownloadEvaluationReport();
              }
            }}
            className="px-3 py-1.5 text-[10px] font-bold bg-slate-900 hover:bg-slate-950 border border-slate-850 hover:border-purple-500/40 text-purple-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
            title={currentTab === "engineered" ? "Download Prompt" : "Download Evaluation and Loop Holes Report"}
          >
            <Download className="h-3 w-3 text-neon-blue" />
            <span>{currentTab === "engineered" ? "DOWNLOAD PROMPT" : "DOWNLOAD REPORT"}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace content area */}
      <div className="flex-1 p-5 md:p-6 overflow-y-auto bg-slate-950/40 text-slate-200">
        
        {/* ----------------- TAB 1: OPTIMIZED PROMPT PANEL (PEHLE SEEDHE PROMPT) ----------------- 
            Is section mein final refined copy-ready prompt block display hota hai jo complete parameters
            ke sath customized rules follow karta hai. Isay user direct kisi bhi chatbot mein use kar sakta hai.
        */}
        {currentTab === "engineered" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Header Badge & Dial */}
            <div className="bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-900/50 p-4.5 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <span className="text-[10px] bg-purple-500/15 border border-purple-800/80 px-2 py-0.5 rounded font-mono uppercase font-black text-purple-300">
                  Refined Successfully
                </span>
                <h3 className="text-sm font-bold font-display uppercase tracking-wide flex items-center gap-1.5 text-white">
                  <TrendingUp className="h-4 w-4 text-neon-emerald" /> Prompt Pilot Blueprint Design
                </h3>
                <p className="text-[11px] text-slate-300 leading-normal font-sans">
                  Plain intentions have been formatted with professional roleplay rules, syllabus limits, and Socratic coach parameters.
                </p>
              </div>

              {/* Scorecard Box */}
              <div className="bg-slate-950 border border-purple-800/60 p-3 rounded-xl text-center min-w-[110px] shrink-0 shadow-lg relative">
                <span className="text-[8px] text-purple-400 uppercase font-black font-mono block">PILOT SCORE</span>
                <div className="text-2xl font-extrabold text-neon-emerald tracking-tight font-mono neon-text-emerald">
                  {refinedResult.qualityScore || "95"}
                </div>
                <span className="text-[8px] text-slate-400 uppercase tracking-widest font-mono">EXPERT GRADE</span>
              </div>
            </div>

            {/* Structured attributes extracted by Gemini */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/60">
                <span className="text-[9px] font-bold text-neon-purple uppercase font-mono block mb-1">🎭 Persona Mode Assigned</span>
                <p className="text-white text-xs font-bold leading-normal">{refinedResult.goal ? `Act as ${refinedResult.goal}` : "Expert Instructor Persona"}</p>
              </div>

              <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/60">
                <span className="text-[9px] font-bold text-neon-blue uppercase font-mono block mb-1">🏷️ Specific Topic Bounds</span>
                <p className="text-white text-xs font-bold leading-normal">{refinedResult.topic || "Specified Domain"}</p>
              </div>

              <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/60">
                <span className="text-[9px] font-bold text-neon-emerald uppercase font-mono block mb-1">🧠 Configured Difficulty</span>
                <p className="text-white text-xs font-bold leading-normal">{refinedResult.skillLevel || "Adaptive Learn"}</p>
              </div>

              <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/60">
                <span className="text-[9px] font-bold text-pink-400 uppercase font-mono block mb-1">⚙️ Student Output Format</span>
                <p className="text-white text-xs font-bold leading-normal">{refinedResult.outputType || "Structured Chapters & Exercises"}</p>
              </div>
            </div>


            {/* Warning missing information check box */}
            {refinedResult.missingInformation && refinedResult.missingInformation.length > 0 && (
              <div className="bg-amber-950/40 border border-amber-900/60 p-4 rounded-xl text-amber-200 text-xs">
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block mb-1 z-10">⚠️ SUGGESTIONS TO MAKE IT EVEN BETTER:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 font-sans leading-relaxed text-[10.5px]">
                  {refinedResult.missingInformation.map((item, id) => (
                    <li key={id} className="font-semibold">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Copy prompt box space */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                <span>Optimized Copy-Ready Prompt Block:</span>
                <span className="text-neon-purple text-[10px] font-black">STRICT PEP-8 BOUNDED</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4.5 text-slate-200 relative overflow-hidden font-mono text-xs leading-relaxed max-h-[280px] overflow-y-auto whitespace-pre-wrap select-text shadow-inner">
                {refinedResult.refinedPrompt}
                <div className="absolute bottom-[-50px] right-[-50px] w-48 h-48 bg-neon-purple/5 blur-[70px] rounded-full pointer-events-none"></div>
              </div>
              
              <div className="p-3.5 bg-slate-900/80 border border-slate-850 rounded-xl flex items-start gap-2">
                <Lightbulb className="h-4.5 w-4.5 text-neon-blue shrink-0 mt-0.5 animate-pulse" />
                <span className="text-[10.5px] text-slate-400 leading-normal font-sans font-medium">
                  <strong>Practical Tip:</strong> Copy this prompt block and paste it into any chatbot. It will trigger a beautiful conversational mentor that acts as a tutor, asks questions first, and guides you step-by-step!
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ----------------- TAB 2: QUALITY METRICS ----------------- */}
        {currentTab === "metrics" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-slate-900/90 to-purple-950/40 p-4.5 border border-slate-800 rounded-2xl relative overflow-hidden">
              <span className="text-[10px] bg-neon-purple/20 text-neon-purple border border-neon-purple/30 px-2.5 py-0.5 rounded font-mono uppercase font-black inline-block mb-1.5">
                Upgradation Analysis (Asaan Jaiza)
              </span>
              <h3 className="text-sm font-bold font-display uppercase tracking-wide flex items-center gap-1.5 text-white">
                <ListChecks className="h-4 w-4 text-neon-emerald" /> How PromptPilot Upgraded Your Prompt
              </h3>
              <p className="text-[11px] text-slate-350 leading-relaxed font-sans mt-1">
                Yahan dekhain ke aap ke mamooli prompt (Raw input) ko PromptPilot ne kis tarah behtar (Refined) banaya hai.
              </p>
            </div>

            {/* Glowing bar comparison meters */}
            <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 md:p-5 space-y-5 shadow-xl">
              <div className="text-[11.5px] font-bold text-purple-400 font-mono uppercase tracking-wider border-b border-slate-900 pb-2 flex items-center gap-2">
                <span>📊 PERFORMANCE COMPARISON (PEHLE VS. BAAD MEIN)</span>
                <span className="text-[9px] text-slate-400 font-normal lowercase bg-slate-900 px-2 py-0.5 rounded">scale 1-10</span>
              </div>

              <div className="grid grid-cols-1 gap-5">
                
                {/* Metric 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-bold text-white uppercase tracking-wider font-display block">1. Topic Clarity & Depth</span>
                      <span className="text-[10px] text-slate-450 text-slate-400 block font-sans">Aap ki baat kitni saaf aur gehri hai</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-300 whitespace-nowrap shrink-0">
                      Raw: <strong className="text-red-400">{refinedResult.metrics.goalClarityUser}/10</strong> ➜ Refined: <strong className="text-neon-emerald">{refinedResult.metrics.goalClarityGenerated}/10</strong>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-md overflow-hidden relative border border-slate-800">
                    <div
                      className="absolute top-0 left-0 h-full bg-rose-500 opacity-60 transition-all duration-1000"
                      style={{ width: `${refinedResult.metrics.goalClarityUser * 10}%` }}
                    />
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-neon-purple hover:shadow-[0_0_10px_rgba(189,0,255,0.7)] transition-all duration-1000"
                      style={{ width: `${refinedResult.metrics.goalClarityGenerated * 10}%`, mixBlendMode: "screen" }}
                    />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-bold text-white uppercase tracking-wider font-display block">2. Syllabus Boundary</span>
                      <span className="text-[10px] text-slate-400 block font-sans">Syllabus ki hadden aur limits (No drift)</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-300 whitespace-nowrap shrink-0">
                      Raw: <strong className="text-red-400">{refinedResult.metrics.contextUser}/10</strong> ➜ Refined: <strong className="text-neon-emerald">{refinedResult.metrics.contextGenerated}/10</strong>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-md overflow-hidden relative border border-slate-800">
                    <div
                      className="absolute top-0 left-0 h-full bg-rose-500 opacity-60 transition-all duration-1000"
                      style={{ width: `${refinedResult.metrics.contextUser * 10}%` }}
                    />
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-neon-blue hover:shadow-[0_0_10px_rgba(0,240,255,0.7)] transition-all duration-1000"
                      style={{ width: `${refinedResult.metrics.contextGenerated * 10}%`, mixBlendMode: "screen" }}
                    />
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-bold text-white uppercase tracking-wider font-display block">3. Output Style & Format</span>
                      <span className="text-[10px] text-slate-400 block font-sans">AI ke sabaq ka tarika aur chapters</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-300 whitespace-nowrap shrink-0">
                      Raw: <strong className="text-red-400">{refinedResult.metrics.outputFormatUser}/10</strong> ➜ Refined: <strong className="text-neon-emerald">{refinedResult.metrics.outputFormatGenerated}/10</strong>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-md overflow-hidden relative border border-slate-800">
                    <div
                      className="absolute top-0 left-0 h-full bg-rose-500 opacity-60 transition-all duration-1000"
                      style={{ width: `${refinedResult.metrics.outputFormatUser * 10}%` }}
                    />
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-neon-emerald hover:shadow-[0_0_10px_rgba(57,255,20,0.7)] transition-all duration-1000"
                      style={{ width: `${refinedResult.metrics.outputFormatGenerated * 10}%`, mixBlendMode: "screen" }}
                    />
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-bold text-white uppercase tracking-wider font-display block">4. No-Cheating Rules</span>
                      <span className="text-[10px] text-slate-400 block font-sans">Bina direct copy-paste ke step-by-step guidance</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-300 whitespace-nowrap shrink-0">
                      Raw: <strong className="text-red-400">{refinedResult.metrics.constraintsUser}/10</strong> ➜ Refined: <strong className="text-neon-emerald">{refinedResult.metrics.constraintsGenerated}/10</strong>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-md overflow-hidden relative border border-slate-800">
                    <div
                      className="absolute top-0 left-0 h-full bg-rose-500 opacity-60 transition-all duration-1000"
                      style={{ width: `${refinedResult.metrics.constraintsUser * 10}%` }}
                    />
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-pink-500 hover:shadow-[0_0_10px_rgba(244,63,94,0.7)] transition-all duration-1000"
                      style={{ width: `${refinedResult.metrics.constraintsGenerated * 10}%`, mixBlendMode: "screen" }}
                    />
                  </div>
                </div>

                {/* Metric 5 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-bold text-white uppercase tracking-wider font-display block">5. Quiz & Practice Exercises</span>
                      <span className="text-[10px] text-slate-400 block font-sans">Aap ki learning check karne ke liye chote sawalat</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-300 whitespace-nowrap shrink-0">
                      Raw: <strong className="text-red-400">{refinedResult.metrics.successCriteriaUser}/10</strong> ➜ Refined: <strong className="text-neon-emerald">{refinedResult.metrics.successCriteriaGenerated}/10</strong>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-md overflow-hidden relative border border-slate-800">
                    <div
                      className="absolute top-0 left-0 h-full bg-rose-500 opacity-60 transition-all duration-1000"
                      style={{ width: `${refinedResult.metrics.successCriteriaUser * 10}%` }}
                    />
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-amber-500 hover:shadow-[0_0_10px_rgba(245,158,11,0.7)] transition-all duration-1000"
                      style={{ width: `${refinedResult.metrics.successCriteriaGenerated * 10}%`, mixBlendMode: "screen" }}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Portfolio Rubric card */}
            <div className="bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl space-y-3 shadow-inner">
              <span className="text-[10px] font-bold text-purple-400 block font-mono uppercase tracking-widest">
                🏆 AI REPORT CARD (PILOT GRADE SYNOPSIS)
              </span>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-805 text-center">
                  <span className="text-[8px] font-mono text-slate-400 block uppercase">Creativity (Khayaal)</span>
                  <span className="text-[13px] font-bold font-mono text-neon-purple mt-0.5 block">{refinedResult.assignmentEvaluation.creativity}/10</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-805 text-center">
                  <span className="text-[8px] font-mono text-slate-400 block uppercase">Practical (Asal Zindagi)</span>
                  <span className="text-[13px] font-bold font-mono text-neon-blue mt-0.5 block">{refinedResult.assignmentEvaluation.realWorldProblem}/10</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-805 text-center">
                  <span className="text-[8px] font-mono text-slate-400 block uppercase">AI Smartness (Samajh)</span>
                  <span className="text-[13px] font-bold font-mono text-neon-emerald mt-0.5 block">{refinedResult.assignmentEvaluation.aiUsage}/10</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-805 text-center">
                  <span className="text-[8px] font-mono text-slate-400 block uppercase">Structure (Likhaee)</span>
                  <span className="text-[13px] font-bold font-mono text-pink-400 mt-0.5 block">{refinedResult.assignmentEvaluation.documentation}/10</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-805 text-center col-span-2 md:col-span-1">
                  <span className="text-[8px] font-mono text-slate-400 block uppercase">Difficulty (Mushkil)</span>
                  <span className="text-[13px] font-bold font-mono text-amber-500 mt-0.5 block">{refinedResult.assignmentEvaluation.difficulty}/10</span>
                </div>
              </div>
            </div>

            {/* Loop Holes Discovered in User Raw Intent Warning panel */}
            <div className="bg-rose-950/20 border border-rose-900/35 p-5 rounded-2xl space-y-3 shadow-md">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="h-5 w-5 text-rose-400 animate-pulse shrink-0" />
                <div>
                  <h4 className="text-xs font-black font-mono text-rose-400 uppercase tracking-wider">
                    ⚠️ Missing Details & Prompt Loop Holes (Aap ke prompt ki kamiyan)
                  </h4>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Agar aap direct ye prompt kisi normal chatbot se poochte, toh AI theek se jawab nahi de pata kyunki ye baatain missing theen:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {refinedResult.impacts?.map((imp, idx) => (
                  <div key={idx} className="bg-slate-950/90 p-4 rounded-xl border border-slate-900 flex flex-col justify-between space-y-2.5">
                    <div>
                      <span className="text-[9.5px] text-rose-450 font-extrabold uppercase font-mono tracking-wider block">
                        🔴 Missing Gap {idx + 1}: "{imp.missing}"
                      </span>
                      <p className="text-[11px] text-slate-350 font-sans mt-1 leading-normal">
                        Aap ne input mein is baat ki tafseel nahi batai thi.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-900">
                      <span className="text-[9px] text-neon-blue font-bold uppercase font-mono tracking-wider block">
                        🟢 Fixed by PromptPilot:
                      </span>
                      <p className="text-[10.5px] text-slate-400 font-sans leading-normal mt-0.5">
                        {imp.impact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Side-by-side comparative simulation */}
            <div className="space-y-4 bg-slate-950/30 p-5 rounded-2xl border border-slate-900">
              <div>
                <h4 className="text-xs font-extrabold uppercase font-mono text-neon-purple tracking-widest flex items-center gap-1">
                  <Cpu className="h-4 w-4 animate-spin text-neon-purple" /> Interactive Response Comparison Sandbox
                </h4>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                  Check out how ordinary models answer your raw prompt versus our refined PromptPilot.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Panel A: Novice default output */}
                <div className="border border-slate-800/60 rounded-2xl overflow-hidden bg-slate-950 flex flex-col min-h-[260px]">
                  <div className="bg-rose-950/25 px-4 py-3 border-b border-slate-900 flex justify-between items-center">
                    <span className="text-rose-400 text-xs font-bold font-mono uppercase flex items-center gap-1.5 matches-tutor">
                      <Eye className="h-3.5 w-3.5" /> Novice Raw Output
                    </span>
                    <span className="text-[9px] bg-rose-500/10 border border-rose-500/20 text-rose-350 px-1.5 py-0.5 rounded font-mono uppercase font-black">
                      No Rules
                    </span>
                  </div>

                  <div className="p-4 flex-1 text-[11px] text-slate-405 font-mono leading-relaxed overflow-y-auto max-h-[220px] select-text">
                    {isSimulating ? (
                      <div className="space-y-2 animate-pulse mt-4">
                        <div className="h-3 bg-slate-800 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-800 rounded w-5/6"></div>
                        <div className="h-3 bg-slate-800 rounded w-2/3"></div>
                      </div>
                    ) : simulateError ? (
                      <p className="text-rose-400 font-bold">{simulateError}</p>
                    ) : simulationResult?.noviceOutput ? (
                      simulationResult.noviceOutput
                    ) : (
                      <span className="text-slate-550 italic block mt-10 text-center">Simulate results by submitting on primary input console.</span>
                    )}
                  </div>
                </div>

                {/* Panel B: Refined Pilot output */}
                <div className="border border-neon-purple/40 rounded-2xl overflow-hidden bg-slate-950 flex flex-col min-h-[260px] shadow-[0_0_15px_rgba(189,0,255,0.05)]">
                  <div className="bg-purple-950/25 px-4 py-3 border-b border-neon-purple/20 flex justify-between items-center">
                    <span className="text-neon-purple text-xs font-bold font-mono uppercase flex items-center gap-1.5 neon-text-purple">
                      <Check className="h-3.5 w-3.5 text-neon-emerald" /> Refined Pilot Output
                    </span>
                    <span className="text-[9px] text-neon-emerald font-mono font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      Socratic Bounds
                    </span>
                  </div>

                  <div className="p-4 flex-1 text-[11px] text-slate-400 font-mono leading-relaxed overflow-y-auto max-h-[220px] select-text">
                    {isSimulating ? (
                      <div className="space-y-2 animate-pulse mt-4">
                        <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                        <div className="h-3 bg-slate-800 rounded w-4/5"></div>
                        <div className="h-3 bg-slate-800 rounded h-16 w-full"></div>
                      </div>
                    ) : simulateError ? (
                      <p className="text-rose-400 font-bold">{simulateError}</p>
                    ) : simulationResult?.refinedOutput ? (
                      simulationResult.refinedOutput
                    ) : (
                      <span className="text-slate-550 italic block mt-10 text-center">Simulate results by submitting on primary input console.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Large Tab 2 Download trigger */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
              <div className="font-sans">
                <h5 className="text-[11.5px] text-white font-extrabold uppercase">Save Diagnostic Report</h5>
                <p className="text-[10px] text-slate-450 text-slate-400 leading-normal mt-0.5">
                  Download the full evaluation profile, grading scores, and loophole fixes in markdown format.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadEvaluationReport}
                className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-neon-purple text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer uppercase shadow-lg select-none shrink-0"
              >
                <Download className="h-4 w-4" />
                <span>Download Report</span>
              </button>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}
