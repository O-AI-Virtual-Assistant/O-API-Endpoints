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
              "content": "You will be a helpful assistant, and respond to questions or any inquiry the user writes. Make sure to put any code between triple backticks (```), and use Markdown formatting."
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

    //   res.set({
    //     "Content-Type": "application/json",
    //     "Access-Control-Allow-Origin": "*", // Allow requests from any origin
    //   });
      console.log(res.json({answer}))
      res.json({ answer: answer });

    //   return answer;

    } catch(e) {
        console.error("Error in OpenAI API request:", e);
        return null
        // answer = "Error occurred while processing the request";
    }
  

  });
  
  export default router;
  