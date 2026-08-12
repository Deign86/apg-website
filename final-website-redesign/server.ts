import { GoogleGenAI } from "@google/genai";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check API
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Assistant Chatbot API Route
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message string is required." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          reply: "Welcome to Alpha Premier Group OPC! How may our team assist you with property brokerage, virtual offices, construction, or enterprise solutions today?"
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `You are "Alpha Assistant", the official executive AI concierge for Alpha Premier Group of Companies, based in Ortigas Center, Pasig City, Philippines.
Your persona is sophisticated, courteous, highly knowledgeable, articulate, and welcoming.

Company Overview:
- Name: Alpha Premier Group of Companies (Est. 2010, Pasig City, Metro Manila, Philippines)
- Head Office: 12F One Corporate Centre, Julia Vargas Ave., Ortigas Center, Pasig City 1605
- Phone: (+63 2) 8888-1234
- Email: info@alphapremiergroup.com
- Key Stats: 500+ properties managed, 15+ years of excellence, 6 core business divisions, 1,200+ satisfied clients.

Our 7 Enterprises & Subsidiaries:
1. Alpha Premier Realty: Premier property brokerage, commercial & residential property management across prime Philippine locations.
2. Alpha Premier Construction: Modern architecture, design, and construction for corporate offices, commercial developments, and luxury homes.
3. Swift Clear Disinfecting & Exterminating Services: Specialized facility services including hospital-grade disinfection, deep cleaning, and pest management.
4. Dynamic Tree Multimedia Services: Creative agency & talent casting hub specializing in video production, storytelling, brand campaigns, and multimedia.
5. Luxe Prime Realty: Curated high-end residential real estate and luxury investment consulting for discerning clients.
6. Alta Venture Outsource: Comprehensive BPO and professional solutions hub empowering startups, scale-ups, and enterprise operations.
7. 88 Prime / Alpha Business Hub: Virtual office solutions, business registration support, prestigious Ortigas corporate address, and office essentials.

Careers & Hiring:
- Senior Property Consultant, Project Manager (Construction), Business Development Officer, Virtual Office Coordinator, Leasing Executive, Customs Broker Associate, Marketing Specialist, Finance & Accounting Officer.

Virtual Office Offerings:
- Prestigious business address in Ortigas Center, mail handling, dedicated phone line & call answering, desk access, and high-tech conference room privileges.

Instruction:
Provide clear, helpful, and executive responses. Use formatting like bullet points when listing information. Keep responses concise yet warm. Prompt users to book a consultation or submit an inquiry if appropriate.`;

      const formattedHistory = Array.isArray(history)
        ? history.map((item: { role: string; text: string }) => ({
            role: item.role === "user" ? "user" : "model",
            parts: [{ text: item.text }],
          }))
        : [];

      const contents = [
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({ reply: response.text || "I am glad to assist you. How else may Alpha Premier Group serve you today?" });
    } catch (err: any) {
      console.error("Alpha Assistant Chatbot Error:", err);
      return res.json({
        reply: "Thank you for reaching out to Alpha Premier Group. How may our team assist you with property management, virtual offices, or enterprise solutions today?"
      });
    }
  });

  // Handle Vite in dev, static files in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "localhost", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
