import { Request, Response, Router } from "express";
import { OpenAI } from "openai";

const router = Router();

// Middleware to handle CORS preflight requests
router.options("/", (_req: Request, res: Response) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.status(204).end();
});

const openai = new OpenAI({ apiKey: process.env.API_KEY });

// In-memory storage for conversation history
const conversationHistory: { [sessionId: string]: any[] } = {};

router.post("/", async (req: Request, res: Response) => {
  const sessionId = req.body.sessionId; // Assume session ID is passed in the request body
  const userMessage = req.body.content;

  console.log("in api");
  console.log("req body: ", req.body);

  // Initialize conversation history for the session if not already present
  if (!conversationHistory[sessionId]) {
    conversationHistory[sessionId] = [
      {
        role: "system",
        content:
          "You will be a helpful assistant, and respond to questions or any inquiry the user writes. Make sure to use Markdown formatting.",
      },
    ];
  }

  // Add the new user message to the conversation history
  conversationHistory[sessionId].push({
    role: "user",
    content: userMessage,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-05-13",
      messages: conversationHistory[sessionId],
    });

    const answer = response.choices.map((out) => out.message.content).join(" ");
    console.log(answer);

    // Add the assistant's response to the conversation history
    conversationHistory[sessionId].push({
      role: "assistant",
      content: answer,
    });

    res.json({ answer: answer });
  } catch (e) {
    console.error("Error in OpenAI API request:", e);
    res.status(500).json({ error: "Error occurred while processing the request" });
  }
});

export default router;
