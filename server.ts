import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables dynamically from .env file
dotenv.config();

const app = express();
const PORT = 3000; // Hardcoded port 3000 mapped for Cloud Run Nginx proxy

// Middlewares to handle parseable JSON paylods
app.use(express.json());

// Initialize GoogleGenAI client using secure backend-only GEMINI_API_KEY
const apiKey = process.env.GEMINI_API_KEY;
const fallbackApiKey = process.env.FALLBACK_GEMINI_API_KEY;
const fallbackModel = process.env.FALLBACK_GEMINI_MODEL || "gemini-1.5-flash-lite";

if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY is not defined in environment variables. Gemini features may fail.");
}

// Global API service client linked with Google AI Developer Studio Platform
const ai = new GoogleGenAI({
  apiKey: apiKey || "",
});

const fallbackAi = fallbackApiKey ? new GoogleGenAI({
  apiKey: fallbackApiKey,
}) : null;

// Helper to call Gemini with Fallback Logic
async function callGemini(params: any) {
  try {
    if (!apiKey) throw new Error("Primary API Key missing");
    return await ai.models.generateContent(params);
  } catch (error: any) {
    const isQuotaError = error.message?.includes("429") || 
                         error.message?.includes("quota") || 
                         error.status === 429;
    
    if (isQuotaError && fallbackAi) {
      console.warn(`[FALLBACK] Primary API Quota Exceeded. Switching to model: ${fallbackModel}`);
      return await fallbackAi.models.generateContent({
        ...params,
        model: fallbackModel
      });
    }
    throw error;
  }
}

// Middleware to log API requests with custom timestamps for debug operations
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});


// Endpoint 1: Generate & Refine Prompt (Raw Intent convert karne ke liye main API)
app.post("/api/generate", async (req, res) => {
  try {
    const { rawInput, mode, customRules } = req.body;
    const selectedMode = mode || "Intermediate";

    if (!apiKey) {
      console.error("CRITICAL: GEMINI_API_KEY is missing in environment variables.");
      return res.status(500).json({ error: "Server Configuration Error: API Key is missing. Please set GEMINI_API_KEY in Vercel settings." });
    }

    if (!rawInput) {
      return res.status(400).json({ error: "Input is required to generate a prompt." });
    }

    // Dynamic prompt construction rules compiler:
    let rulesText = "";
    if (Array.isArray(customRules) && customRules.length > 0) {
      rulesText = customRules.map((r: any, index: number) => {
        return `- Rule ${index + 1}: ${r.rule} ('Enforcable: ${r.tagTag}' - description: ${r.desc})`;
      }).join("\n");
    } else {
      rulesText = `- Rule 1: Clear Role ('Act as a Specialized Coach/Expert Instructor in [Topic]...')
   - Rule 2: Explicit Goal ('Your task is to teach/guide the student...')
   - Rule 3: Context ('Background & Boundaries: Limit to [Topic/Selected Mode] level parameters')
   - Rule 4: Constraints ('Do not output final code immediately. Teach dynamically by asking Socratic or guiding questions!')
   - Rule 5: Output Structure ('Format: Clear markdown sections, step-by-step practice, and summaries')
   - Rule 6: Quality Criteria ('Success Criteria: Clean formatting, reliable modern standards, and error-free concepts')
   - Rule 7: Iterative Improvement (Include revision/input loop instructions)
   - Rule 8: Evaluation (Include a self-scoring rubric for tracking progress)`;
    }


    const systemInstruction = `You are PromptPilot AI, an intelligent prompt generator, evaluator, and coach.
Your task is to analyze a student's raw intention (which is often messy, lacks details or is written in mixed Roman Urdu/English) and return a highly optimized prompt blueprint alongside a complete pedagogical evaluation.

You MUST analyze the input and extract:
1. The student's Goal, Topic, Skill Level (Beginner/Intermediate/Expert based on their request/selected mode), Output Type, Constraints, and any Missing Information.
2. An optimized, copy-ready prompt adhering to these exact User-Configured Prompting Rules:
${rulesText}
3. A comparative score out of 10 for the Raw Prompt vs. the Generated Prompt across 5 metrics:
   - Goal Clarity
   - Context
   - Output Format
   - Constraints
   - Success Criteria
4. An Impact Analysis explaining at least 2 key things that were Missing (e.g. Missing Context, Missing Output Format) and their specific Impacts.
5. An Assignment Evaluation Estimate:
   - Creativity (out of 10)
   - Real World Problem Solving (out of 10)
   - AI Usage (out of 10)
   - Documentation (out of 10)
   - Difficulty (out of 10)
   - Overall (out of 10)
6. A general Quality Score (out of 100) for the generated prompt (typically 90-98/100).

Make sure the response is in pure JSON format matching the schema requested.`;

    const userPrompt = `Messy Student Learning Intention: "${rawInput}"
Selected Target Mode: "${selectedMode}" (Generate the prompt suitable for a ${selectedMode} level student)

Generate the JSON response matching the specifications. Keep the tone friendly, encouraging, and clear.`;

    console.log(`Generating prompt for input: "${rawInput.substring(0, 50)}..."`);

    const response = await callGemini({
      model: "gemini-2.0-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          required: [
            "goal", "topic", "skillLevel", "outputType", "constraints", 
            "missingInformation", "refinedPrompt", "qualityScore", "metrics", 
            "impacts", "assignmentEvaluation"
          ],
          properties: {
            goal: { type: "STRING" },
            topic: { type: "STRING" },
            skillLevel: { type: "STRING" },
            outputType: { type: "STRING" },
            constraints: { type: "STRING" },
            missingInformation: { type: "ARRAY", items: { type: "STRING" } },
            refinedPrompt: { type: "STRING" },
            qualityScore: { type: "INTEGER" },
            metrics: {
              type: "OBJECT",
              required: [
                "goalClarityUser", "goalClarityGenerated",
                "contextUser", "contextGenerated",
                "outputFormatUser", "outputFormatGenerated",
                "constraintsUser", "constraintsGenerated",
                "successCriteriaUser", "successCriteriaGenerated"
              ],
              properties: {
                goalClarityUser: { type: "INTEGER" },
                goalClarityGenerated: { type: "INTEGER" },
                contextUser: { type: "INTEGER" },
                contextGenerated: { type: "INTEGER" },
                outputFormatUser: { type: "INTEGER" },
                outputFormatGenerated: { type: "INTEGER" },
                constraintsUser: { type: "INTEGER" },
                constraintsGenerated: { type: "INTEGER" },
                successCriteriaUser: { type: "INTEGER" },
                successCriteriaGenerated: { type: "INTEGER" }
              }
            },
            impacts: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                required: ["missing", "impact"],
                properties: {
                  missing: { type: "STRING" },
                  impact: { type: "STRING" }
                }
              }
            },
            assignmentEvaluation: {
              type: "OBJECT",
              required: ["creativity", "realWorldProblem", "aiUsage", "documentation", "difficulty", "overall"],
              properties: {
                creativity: { type: "NUMBER" },
                realWorldProblem: { type: "NUMBER" },
                aiUsage: { type: "NUMBER" },
                documentation: { type: "NUMBER" },
                difficulty: { type: "NUMBER" },
                overall: { type: "NUMBER" }
              }
            }
          }
        }
      }
    });

    // In some cases, response.text might be a method, in others a property
    const resultText = typeof response.text === 'function' ? (response as any).text() : response.text;
    
    if (!resultText) {
      console.error("Empty response from Gemini API");
      throw new Error("No text returned from Gemini API");
    }

    try {
      const parsedResult = JSON.parse(resultText);
      res.json(parsedResult);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", resultText);
      throw new Error("Invalid JSON response from AI model.");
    }
    
  } catch (error: any) {
    console.error("Error in /api/generate:", error);
    res.status(500).json({ error: error.message || "Internal Server Error during prompt generation." });
  }
});

// Endpoint 2: Test Run Prompt (Novice vs Refined Demo Outputs Simulator API)
app.post("/api/test-run", async (req, res) => {
  try {
    const { rawInput, refinedPrompt } = req.body;

    if (!apiKey) {
      console.error("CRITICAL: GEMINI_API_KEY is missing in environment variables for test-run.");
      return res.status(500).json({ error: "Server Configuration Error: API Key is missing." });
    }

    if (!rawInput || !refinedPrompt) {
      return res.status(400).json({ error: "Both raw input and refined prompt are required for the test run." });
    }

    console.log("Starting side-by-side simulation...");

    // STEP 1: Basic default helper setup
    const novicePrompt = `Please answer a student's simple question directly. Do not overthink, just answer like a basic bot. Question: "${rawInput}"`;
    const noviceResponse = await callGemini({
      model: "gemini-2.0-flash",
      contents: novicePrompt,
      config: {
        systemInstruction: "You are a basic helpful AI helper. Give a brief, high-level copy-paste response."
      }
    });

    // STEP 2: Socratic refined pilot setup
    const refinedResponse = await callGemini({
      model: "gemini-2.0-flash",
      contents: refinedPrompt,
    });

    const noviceText = typeof noviceResponse.text === 'function' ? (noviceResponse as any).text() : noviceResponse.text;
    const refinedText = typeof refinedResponse.text === 'function' ? (refinedResponse as any).text() : refinedResponse.text;

    // Return comparative outputs to client terminal screens
    res.json({
      noviceOutput: noviceText || "No response from basic model.",
      refinedOutput: refinedText || "No response from refined model.",
    });

  } catch (error: any) {
    console.error("Error in /api/test-run:", error);
    res.status(500).json({ error: error.message || "Failed to perform comparison test run." });
  }
});


// Endpoint 3: Fetch the complete project report (.MD)
app.get("/api/report", async (req, res) => {
  try {
    const fs = await import("fs/promises");
    const reportPath = path.join(process.cwd(), "PROJECT_REPORT.md");
    const content = await fs.readFile(reportPath, "utf-8");
    res.json({ content });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to read report file." });
  }
});

// Endpoint 4: Fetch Streamlit application executable script
app.get("/api/download-python", async (req, res) => {
  try {
    const fs = await import("fs/promises");
    const appPath = path.join(process.cwd(), "app.py");
    const content = await fs.readFile(appPath, "utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=app.py");
    res.setHeader("Content-Type", "text/plain");
    res.send(content);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to read app.py file." });
  }
});

// Configure Vite or Static Assets serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on port ${PORT} with environment ${process.env.NODE_ENV || "development"}`);
  });
}

// Only start the server if not running inside a Serverless/Vercel platform function.
if (!process.env.VERCEL) {
  startServer();
}

export default app;
