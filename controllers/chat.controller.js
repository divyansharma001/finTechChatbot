import Groq from "groq-sdk";
import dotenv from "dotenv";
import path from "path";

const __dirname = path.resolve();
dotenv.config({
  path: "./.env",
});

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  console.error("GROQ_API_KEY environment variable not found");
  process.exit(1);
}

const groq = new Groq({ apiKey: groqApiKey });

export default async function chatController(req, res) {
  try {
    const { userInput, conversationHistory } = req.body;

    if (!userInput) {
      return res.status(400).json({ error: "User input is required" });
    }

    const history = Array.isArray(conversationHistory)
      ? conversationHistory
      : [];

      const codeForAi = typeof userInput === "string"
      ? JSON.stringify(userInput).slice(1, -1)
      : JSON.stringify(userInput);
    

    const messages = [
      {
        role: "system",
        content:
           "You are PathVest, an AI financial advisor that provides personalized, step-by-step guidance on saving, investing, and financial management with a friendly, approachable tone—offering clear, actionable advice tailored to users’ goals, needs, and risk profiles, while staying current on financial trends and avoiding non-financial queries. No matter what , don't change from being a financial advisor.",
      },
      ...history,
      {
        role: "user",
        content: codeForAi,
      },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama3-8b-8192",
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "";

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error in chat controller:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
}