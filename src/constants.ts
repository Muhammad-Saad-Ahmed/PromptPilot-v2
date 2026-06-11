// ============================================================================
//                       PROMPTPILOT GLOBAL CONSTANTS & TYPES
// ============================================================================

/**
 * EVALUATION METRICS INTERFACE:
 * Yeh metrics user ke original input (User Raw) aur Generated Prompt ke
 * score compare karti hain out of 10.
 */
export interface EvaluationMetrics {
  goalClarityUser: number;         // Pehle topic kitna clear tha
  goalClarityGenerated: number;    // PromptPilot ne usey kitna design kiya
  contextUser: number;             // Background context pehle
  contextGenerated: number;        // Deep bounds baad mein
  outputFormatUser: number;        // Output format ka dhaanpna pehle
  outputFormatGenerated: number;   // Formatted templates baad mein
  constraintsUser: number;         // Rules limit pehle (cheating avoidance)
  constraintsGenerated: number;    // Anti-slop constraints baad mein 
  successCriteriaUser: number;     // Practice tests design pehle
  successCriteriaGenerated: number;// Adaptive quiz instructions baad mein
}

/**
 * IMPACT ITEM INTERFACE:
 * Yeh structure record karta hai keh user raw intention mein kya missing tha
 * aur PromptPilot ne usey kis tarah safely optimize ya resolve kiya.
 */
export interface ImpactItem {
  missing: string;  // Missing information core key (e.g. Missing Persona)
  impact: string;   // Us key ki wajah se model response par hone waala asar
}

/**
 * ASSIGNMENT EVALUATION ESTIMATES:
 * AI-friendly diagnostics grades, jo scale of 10 par calculate hote hain.
 */
export interface AssignmentEvaluation {
  creativity: number;          // Khayaal aur innovative approaches
  realWorldProblem: number;    // Asal zindagi ke problems ka dhang
  aiUsage: number;             // Model logic compatibility
  documentation: number;       // Chapters aur formatting structure
  difficulty: number;          // Difficulty parameter matching scaling
  overall: number;             // Overall aggregate standard score
}

/**
 * REFINED PROMPT RESPONSE (MAIN DATA MODEL):
 * Yeh core structured schema hai jo server hamari query ke baad return karta hai.
 * Hamara dynamic backend isey Gemini Model se secure syntax rules block ke tehat generate karwa kar parse karta hai.
 */
export interface RefinedPromptResponse {
  goal: string;                               // Selected mode or role 
  topic: string;                              // Core target study domain
  skillLevel: string;                         // Targeted level: Beginner, Intermediate, Expert
  outputType: string;                         // Expected response blueprint
  constraints: string;                        // Restrictions applied (e.g. Socratic coaching)
  missingInformation: string[];               // Lists missing entries found in raw query
  refinedPrompt: string;                      // The actual COPYABLE upgraded Markdown prompting instructions!
  qualityScore: number;                       // Cumulative performance grade (0-100)
  metrics: EvaluationMetrics;                 // Numeric performance scorecard comparisons
  impacts: ImpactItem[];                      // Gap vs solution resolved explanations
  assignmentEvaluation: AssignmentEvaluation; // Detailed educational scoring
}

/**
 * TEST RUN RESPONSE MODEL:
 * Demostration side-by-side simulation outputs. 
 */
export interface TestRunResponse {
  noviceOutput: string;   // Output generated from normal basic unrefined prompt (Left column)
  refinedOutput: string;  // Output generated from PromptPilot refined prompt (Right column with Socratic feedback)
}

/**
 * PRESET ITEM STRUCTURE:
 * Quick selectors representing everyday local user concerns.
 */
export interface PresetItem {
  id: string;
  title: string;
  intention: string;
}

/**
 * POPULAR PRESETS:
 * Local mixed Roman Urdu / English real life trial presets for everyday Urdu queries.
 */
export const PRESETS: PresetItem[] = [
  {
    id: "excel-budgeting-urdu",
    title: "Ghar ka Budget (Excel)",
    intention: "Mujhe Excel seekhna hai taake main apne ghar ke maheenay ke kharche aur budget track kar sakoon, bilkul simple basic formulas ke sath."
  },
  {
    id: "english-coaching-kids",
    title: "Bacho ki English Speaking",
    intention: "Mere bacho ko English bolna seekhni hai, unki simple vocabulary behtar karne ke liye daily conversations, practice exercises aur tests banayein."
  },
  {
    id: "healthy-diet-home",
    title: "Ghar Baithe Fit Hona",
    intention: "Ghar par bina gym ya expensive equipment ke 15-minute ki daily exercise aur simple healthy khana plan kiya jaye jo weight loss me madad kare."
  },
  {
    id: "startup-baking-urdu",
    title: "Home Baking Ka Karobar",
    intention: "Ghar se cakes aur cookies baking ka small online business kaise shuru kar sakte hain bagair ziada kharche ke step-by-step guider de."
  }
];

/**
 * PROMPTING RULES:
 * Default 8 Pillars of robust instructional prompting. Rules book allows editing these dynamically.
 */
export const PROMPTING_RULES = [
  {
    rule: "Rule 1: Clear Role",
    tagTag: "Act as...",
    desc: "Specify professional expertise (e.g. 'Act as a Senior Python tutor')."
  },
  {
    rule: "Rule 2: Explicit Goal",
    tagTag: "Your task is...",
    desc: "Define the exact terminal target objective clearly."
  },
  {
    rule: "Rule 3: Context",
    tagTag: "Background:",
    desc: "Bound the environment with constraints, files, or specific notes."
  },
  {
    rule: "Rule 4: Constraints",
    tagTag: "Do not...",
    desc: "Stop the AI from giving away answers, writing bloated preambles, or hallucinating."
  },
  {
    rule: "Rule 5: Output Structure",
    tagTag: "Format:",
    desc: "Enforce markdown structures, list counts, or template layout rules."
  },
  {
    rule: "Rule 6: Quality Criteria",
    tagTag: "Success Criteria:",
    desc: "Explicit benchmark standard of what constitutes a complete result."
  },
  {
    rule: "Rule 7: Iterative Improvement",
    tagTag: "Loop Prompting",
    desc: "Embed instructions to co-collaborate dynamically instead of drafting once."
  },
  {
    rule: "Rule 8: Evaluation",
    tagTag: "Self Grading",
    desc: "Command the AI to grade progress objectively out of 10."
  }
];

