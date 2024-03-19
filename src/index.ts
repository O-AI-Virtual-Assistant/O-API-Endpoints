import "reflect-metadata";
import express from "express";
import { __prod__ } from "./constants";
import { config } from "dotenv";
import { OpenAI } from "openai";

const main = async () => {
  const app = express();

  app.use(express.json());

  config();

  const openai = new OpenAI({ apiKey: process.env.API_KEY });

  app.get("/", (_req, res) => {
    res.send("Hello World!");
  });

  // Middleware to handle CORS preflight requests
  app.options("/unit-test", (_req, res) => {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS, POST",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.status(204).end();
  });

  app.post("/unit-test", async (req, res) => {
    console.log(req.body);

    // Extract the text field from req.body
    
    const userMessage = "Can you generate a unit test for the following code" +  req.body.text;

    // Perform any asynchronous operations if needed

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

  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
};

main();
