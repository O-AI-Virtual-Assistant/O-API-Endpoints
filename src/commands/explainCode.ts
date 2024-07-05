import { Request, Response, Router } from "express";
import { OpenAI } from "openai";

const router = Router();

router.options("/", (_req: Request, res: Response) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.status(204).end();
});

const openai = new OpenAI({ apiKey: process.env.API_KEY });

router.post("/", async (req: Request, res: Response) => {
    console.log("in api")
    console.log("req body: ", req.body);

  try{
    const response = await openai.chat.completions
      .create({
        model: "gpt-4o-2024-05-13",
        messages: [
            {
              "role": "system",
              "content": "You will be provided with a piece of code, and your task is to explain it in a concise thorough way. Make sure to put any code between triple backticks (```) and use Markdown formatting"
            },
            {
              "role": "user",
              "content": req.body.content
            }
          ],
      });
    //   console.log("response: ", response);
      const answer = response.choices.map((out) => out.message.content).join(' ');
      console.log(answer)
      console.log(res.json({answer}))

      res.json({ answer: answer });


    } catch(e) {
        console.error("Error in OpenAI API request:", e);
        return null
    }
  

  });
  
  export default router;
  