import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables dynamically from .env file
dotenv.config();

const app = express();
const PORT = 3000; // Hardcoded port 3000 mapped for Cloud Run Nginx proxy

// Middlewares to handle parseable JSON paylods
app.use(express.json());

// Initialize GoogleGenAI client using secure backend-only GEMINI_API_KEY
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("Waring: GEMINI_API_KEY is not defined in environment variables. Gemini features may fail.");
}

// Global API service client linked with Google AI Developer Studio Platform
const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build', // For compliance auditing
    }
  }
});

// Middleware to log API requests with custom timestamps for debug operations
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});


// Endpoint 1: Generate & Refine Prompt (Raw Intent convert karne ke liye main API)
// Yeh API client se rawInput, Selected Mode (Beginner/Intermediate/Expert), aur current customRules list leti hai.
// Aur Gemini model ko strict JSON response schema ke sath query karti hai.
app.post("/api/generate", async (req, res) => {
  try {
    const { rawInput, mode, customRules } = req.body;
    const selectedMode = mode || "Intermediate";

    if (!rawInput) {
      return res.status(400).json({ error: "Input is required to generate a prompt." });
    }

    // Dynamic prompt construction rules compiler:
    // Hum rules book modal se custom rule set retrieve karte hain jise hum structured string mein generate karte hain.
    // Agar rules book khaali ho tou fallback default standard rules apply kardiye jaate hain.
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "goal", "topic", "skillLevel", "outputType", "constraints", 
            "missingInformation", "refinedPrompt", "qualityScore", "metrics", 
            "impacts", "assignmentEvaluation"
          ],
          properties: {
            goal: { type: Type.STRING },
            topic: { type: Type.STRING },
            skillLevel: { type: Type.STRING },
            outputType: { type: Type.STRING },
            constraints: { type: Type.STRING },
            missingInformation: { type: Type.ARRAY, items: { type: Type.STRING } },
            refinedPrompt: { type: Type.STRING, description: "The copyable optimized markdown prompt incorporating the 8 rules." },
            qualityScore: { type: Type.INTEGER },
            metrics: {
              type: Type.OBJECT,
              required: [
                "goalClarityUser", "goalClarityGenerated",
                "contextUser", "contextGenerated",
                "outputFormatUser", "outputFormatGenerated",
                "constraintsUser", "constraintsGenerated",
                "successCriteriaUser", "successCriteriaGenerated"
              ],
              properties: {
                goalClarityUser: { type: Type.INTEGER },
                goalClarityGenerated: { type: Type.INTEGER },
                contextUser: { type: Type.INTEGER },
                contextGenerated: { type: Type.INTEGER },
                outputFormatUser: { type: Type.INTEGER },
                outputFormatGenerated: { type: Type.INTEGER },
                constraintsUser: { type: Type.INTEGER },
                constraintsGenerated: { type: Type.INTEGER },
                successCriteriaUser: { type: Type.INTEGER },
                successCriteriaGenerated: { type: Type.INTEGER }
              }
            },
            impacts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["missing", "impact"],
                properties: {
                  missing: { type: Type.STRING, description: "e.g., Missing Context" },
                  impact: { type: Type.STRING, description: "e.g., AI does not know your level. Impact: Response may be too advanced." }
                }
              }
            },
            assignmentEvaluation: {
              type: Type.OBJECT,
              required: ["creativity", "realWorldProblem", "aiUsage", "documentation", "difficulty", "overall"],
              properties: {
                creativity: { type: Type.NUMBER },
                realWorldProblem: { type: Type.NUMBER },
                aiUsage: { type: Type.NUMBER },
                documentation: { type: Type.NUMBER },
                difficulty: { type: Type.NUMBER },
                overall: { type: Type.NUMBER }
              }
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No text returned from Gemini API");
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Error generating prompt:", error);
    res.status(500).json({ error: error.message || "Failed to generate prompt." });
  }
});

// Endpoint 2: Test Run Prompt (Novice vs Refined Demo Outputs Simulator API)
// Yeh API side-by-side terminal comparison generate karti hai.
// Yeh do simultaneous calls chalati hai:
// 1. standard basic bot (novice) response raw query par.
// 2. Optimized prompt response jo high-quality Socratic lesson parameters ke sath answer kare ga.
app.post("/api/test-run", async (req, res) => {
  try {
    const { rawInput, refinedPrompt } = req.body;

    if (!rawInput || !refinedPrompt) {
      return res.status(400).json({ error: "Both raw input and refined prompt are required for the test run." });
    }

    // STEP 1: Basic default helper setup (Answers directly, copy-paste format, no learning loop)
    const novicePrompt = `Please answer a student's simple question directly. Do not overthink, just answer like a basic bot. Question: "${rawInput}"`;
    const noviceResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: novicePrompt,
      config: {
        systemInstruction: "You are a basic helpful AI helper. Give a brief, high-level copy-paste response."
      }
    });

    // STEP 2: Socratic refined pilot setup (Using the copy-ready prompt containing rules, checks & bounds)
    const refinedResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: refinedPrompt,
    });

    // Return comparative outputs to client terminal screens
    res.json({
      noviceOutput: noviceResponse.text,
      refinedOutput: refinedResponse.text,
    });

  } catch (error: any) {
    console.error("Error executing test run:", error);
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
