import { Request, Response, Router } from "express";
import { OpenAI } from "openai";

const router = Router();

const openai = new OpenAI({ apiKey: process.env.API_KEY });

router.options("/", (_req: Request, res: Response) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.status(204).end();
});

router.post("/", async (req: Request, res: Response) => {
  console.log(req.body);
  const userMessage =
    "Can you generate a unit test for the following code" + req.body.text;

  let answer; // Initialize answer variable

  await openai.chat.completions
    .create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userMessage }],
    })
    .then((response) => {
      // Assuming response.choices is an array and not res.choices
      answer = response.choices.map((out) => out.message.content).join(" ");
    })
    .catch((error) => {
      console.error("Error in OpenAI API request:", error);
      answer = "Error occurred while processing the request";
    });

  res.set({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // Allow requests from any origin
  });

  res.json({ answer });
});

export default router;
