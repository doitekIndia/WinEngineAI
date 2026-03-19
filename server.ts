import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Orchestrator API
  app.post("/api/assist", async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    try {
      // 1. Intent Analysis
      const analyzerModel = ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: `Analyze this Windows-related query and determine which specialized agents should handle it. 
        Available Agents: error_diagnosis, optimization, tweak, network, security, guide.
        Query: "${message}"
        Return ONLY a JSON array of agent names. Example: ["error_diagnosis", "guide"]`,
      });

      const analysisResponse = await analyzerModel;
      const text = analysisResponse.text || "[]";
      const agentsToCall: string[] = JSON.parse(text.replace(/```json|```/g, "").trim());

      // 2. Call Agents in Parallel
      const agentPromises = agentsToCall.map(async (agent) => {
        const prompt = getAgentPrompt(agent, message);
        const result = await ai.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: prompt,
        });
        return {
          agent,
          response: result.text,
        };
      });

      const agentResults = await Promise.all(agentPromises);

      res.json({
        query: message,
        detectedAgents: agentsToCall,
        results: agentResults,
      });
    } catch (error) {
      console.error("Orchestrator Error:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  // Individual Agent APIs (as requested)
  const agents = ["error", "optimize", "tweak", "network", "security", "guide"];
  agents.forEach((agentType) => {
    app.post(`/api/agents/${agentType}`, async (req, res) => {
      const { message } = req.body;
      try {
        const prompt = getAgentPrompt(agentType === "error" ? "error_diagnosis" : agentType, message);
        const result = await ai.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: prompt,
        });
        res.json({ agent: agentType, response: result.text });
      } catch (error) {
        res.status(500).json({ error: `Agent ${agentType} failed` });
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

function getAgentPrompt(agent: string, query: string): string {
  const baseInstructions = `You are a Senior Windows System Engineer specialized in ${agent.replace("_", " ")}. 
  Provide a structured solution for the following query: "${query}".
  
  MANDATORY STRUCTURE (Markdown):
  ### 🔍 Problem Understanding
  [Briefly explain what is happening]
  
  ### ⚠️ Possible Causes
  [Ranked list of causes]
  
  ### 🛠 Step-by-Step Fix
  [Clear, executable steps from basic to advanced]
  
  ### 💻 Commands
  [Exact CMD or PowerShell commands if applicable]
  
  ### 🚑 Advanced Recovery
  [Safe mode, BIOS, or registry steps if needed]
  
  ### 🧠 Prevention Tips
  [How to avoid this in the future]
  
  Tone: Professional, precise, and practical. Warn before risky steps.`;

  return baseInstructions;
}

startServer();
