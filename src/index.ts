import "reflect-metadata";
require("dotenv").config();
import express from "express";
import { createConnection } from "typeorm";
import { __prod__ } from "./constants";
import { config } from "dotenv";
import { OpenAI } from "openai";
import { join } from "path";
import { Strategy as GitHubStrategy } from "passport-github";
import passport from "passport";
import { User } from "./entities/User";
import jwt from "jsonwebtoken";

const main = async () => {
  await createConnection({
    type: "postgres",
    logging: !__prod__,
    synchronize: !__prod__,
    database: "Vs-O",
    entities: [join(__dirname, "./entities/*.*")],
    username: "postgres",
    password: "postgres",
  });

  const app = express();
  app.use(express.json());
  passport.serializeUser(function (user: any, done) {
    done(null, user.accessToken);
  });
  app.use(passport.initialize());

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3002/auth/github/callback",
      },
      async (_, __, profile, cb) => {
        let user = await User.findOne({ where: { githubId: profile.id } });
        if (user) {
          user.name = profile.displayName;
          await user.save();
        } else {
          user = await User.create({
            name: profile.displayName,
            githubId: profile.id,
          }).save();
        }
        cb(null, {
          accessToken: jwt.sign(
            { userId: user.id },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "1y",
            }
          ),
        });
      }
    )
  );

  app.get("/auth/github", passport.authenticate("github", { session: false }));

  app.get(
    "/auth/github/callback",
    passport.authenticate("github", { session: false }),
    function (req: any, res) {
      // Successful authentication, redirect home.
      // res.send(req.user.accessToken);
      res.redirect(`http://localhost:54321/auth/${req.user.accessToken}`);
    }
  );

  config();

  const openai = new OpenAI({ apiKey: process.env.API_KEY });

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

  app.get("/", (_req, res) => {
    res.send("Hello World!");
  });
  app.listen(3002, () => {
    console.log("Server is running on port 3002");
  });
};

main();
