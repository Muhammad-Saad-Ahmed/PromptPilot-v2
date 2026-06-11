import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

// API Endpoint: Generate
app.post("/api/generate", async (req, res) => {
  try {
    const { rawInput, mode, customRules } = req.body;
    if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY is missing." });
    if (!rawInput) return res.status(400).json({ error: "Input is required." });

    let rulesText = Array.isArray(customRules) && customRules.length > 0 
      ? customRules.map((r: any, i: number) => `- Rule ${i + 1}: ${r.rule}`).join("\n")
      : "Default rules applied.";

    const systemInstruction = `You are PromptPilot AI... (Simplified for brevity in bridge)`;
    const userPrompt = `Student Intention: "${rawInput}"\nMode: "${mode || "Intermediate"}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: `Analyze and return JSON: goal, topic, skillLevel, outputType, constraints, missingInformation, refinedPrompt, qualityScore, metrics, impacts, assignmentEvaluation. Rules: ${rulesText}`,
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
    if (!apiKey) return res.status(500).json({ error: "API Key missing." });

    const noviceRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Answer briefly: ${rawInput}`,
      config: { systemInstruction: "Basic AI helper." }
    });

    const refinedRes = await ai.models.generateContent({
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
