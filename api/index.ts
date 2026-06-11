import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const fallbackApiKey = process.env.FALLBACK_GEMINI_API_KEY;
const fallbackModel = process.env.FALLBACK_GEMINI_MODEL || "gemini-1.5-flash-lite";

const ai = new GoogleGenAI({ apiKey: apiKey || "" });
const fallbackAi = fallbackApiKey ? new GoogleGenAI({ apiKey: fallbackApiKey }) : null;

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

// API Endpoint: Generate
app.post("/api/generate", async (req, res) => {
  try {
    const { rawInput, mode, customRules } = req.body;
    if (!apiKey && !fallbackApiKey) return res.status(500).json({ error: "GEMINI_API_KEY is missing." });
    if (!rawInput) return res.status(400).json({ error: "Input is required." });

    let rulesText = Array.isArray(customRules) && customRules.length > 0 
      ? customRules.map((r: any, i: number) => `- Rule ${i + 1}: ${r.rule}`).join("\n")
      : "Default rules applied.";

    const systemInstruction = `You are PromptPilot AI, an intelligent prompt generator, evaluator, and coach.
Your task is to analyze a student's raw intention and return a highly optimized prompt blueprint.

CRITICAL: The "refinedPrompt" field MUST be in high-quality Markdown format. Use headers (#, ##), bold text (**), bullet points (-), and code blocks if necessary. 
The prompt should be structured with clear sections: 
- 🎯 **Role & Persona**
- 📝 **Goal & Objective**
- 🏗️ **Context & Constraints**
- 🔄 **Iterative Feedback Loop**
- 📊 **Success Criteria/Rubric**

You MUST analyze the input and extract:
1. The student's Goal, Topic, Skill Level (Beginner/Intermediate/Expert based on their request/selected mode), Output Type, Constraints, and any Missing Information.
2. An optimized, copy-ready Markdown prompt adhering to these exact User-Configured Prompting Rules:
${rulesText}
3. A comparative score out of 10 for the Raw Prompt vs. the Generated Prompt.
4. An Impact Analysis for missing pieces.
5. An Assignment Evaluation Estimate.
6. Overall Quality Score.

Make sure the response is in pure JSON format matching the schema requested.`;
    const userPrompt = `Student Intention: "${rawInput}"\nMode: "${mode || "Intermediate"}"`;

    const response = await callGemini({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const resultText = typeof response.text === 'function' ? (response as any).text() : response.text;
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API Endpoint: Test Run
app.post("/api/test-run", async (req, res) => {
  try {
    const { rawInput, refinedPrompt } = req.body;
    if (!apiKey && !fallbackApiKey) return res.status(500).json({ error: "API Key missing." });

    const noviceRes = await callGemini({
      model: "gemini-2.5-flash",
      contents: `Answer briefly: ${rawInput}`,
      config: { systemInstruction: "Basic AI helper." }
    });

    const refinedRes = await callGemini({
      model: "gemini-2.5-flash",
      contents: refinedPrompt
    });

    res.json({
      noviceOutput: typeof noviceRes.text === 'function' ? (noviceRes as any).text() : noviceRes.text,
      refinedOutput: typeof refinedRes.text === 'function' ? (refinedRes as any).text() : refinedRes.text
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper Endpoints
app.get("/api/download-python", async (req, res) => {
  res.send("Download logic placeholder - check server.ts for full implementation");
});

export default app;
