import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  // API Route for Groq Chat
  app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY is not configured in Secrets." });
    }

    try {
      const completion = await groq.chat.completions.create({
        messages: messages,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
      });

      res.json(completion.choices[0].message);
    } catch (error: any) {
      console.error("Groq API Error:", error);
      res.status(500).json({ error: error.message || "Failed to communicate with Groq." });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      isConfigured: !!process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile"
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

startServer();
