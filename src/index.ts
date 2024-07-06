import "reflect-metadata";
require("dotenv").config();
import express from "express";
import { createConnection } from "typeorm";
import { __prod__ } from "./constants";
import { config } from "dotenv";
import { join } from "path";
import { Strategy as GitHubStrategy } from "passport-github";
import passport from "passport";
import { User } from "./entities/User";
import jwt from "jsonwebtoken";
import cors from "cors";
import unitTestRoutes from "./commands/unitTests";
import newChatRoutes from "./commands/newChat";
import explainCodeRoutes from "./commands/explainCode";


const main = async () => {
  await createConnection({
    type: process.env.DATABASE_TYPE as any,
    logging: !__prod__,
    synchronize: !__prod__,
    database: process.env.DATABASE,
    entities: [join(__dirname, "./entities/*.*")],
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  });

  const app = express();
  app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );
  app.use(express.json());
  passport.serializeUser(function (user: any, done) {
    done(null, user.accessToken);
  });
  app.use(passport.initialize());

  // Passport configuration
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
          if (profile.photos && profile.photos.length > 0) {
            user.userImg = profile.photos[0].value;
          }
          await user.save();
        } else {

          let userImg = "";
          if (profile.photos && profile.photos.length > 0) {
            userImg = profile.photos[0].value;
          }
          
          user = await User.create({
            name: profile.displayName,
            githubId: profile.id,
            userImg: userImg,
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
   // GitHub authentication routes
   app.get("/auth/github", passport.authenticate("github", { session: false }));
   app.get(
     "/auth/github/callback",
     passport.authenticate("github", { session: false }),
     function (req: any, res) {
       res.redirect(`http://localhost:54321/auth/${req.user.accessToken}`);
     }
   );

  // Use the route handler for unit test routes
  app.use("/unit-test", unitTestRoutes);
  app.use("/newChat", newChatRoutes);
  app.use("/explainCode", explainCodeRoutes);


  app.use(express.json());
  app.use(
    (
      err: express.Errback,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      res.status(500).json({ error: "Internal Server Error" });
    }
  );

 

  app.get("/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.send({ user: null });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.send({ user: null });
      return;
    }

    let userId = "";

    try {
      const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      userId = payload.userId;
    } catch (err) {
      res.send({ user: null });
      return;
    }

    if (!userId) {
      res.send({ user: null });
      return;
    }

    const user = await User.findOne({ where: { id: Number(userId) } });

    res.send({ user });
  });

  config();

  app.get("/", (_req, res) => {
    res.send("Hello World, from O!");
  });

  app.listen(3002, () => {
    console.log("Server is running on port 3002");
  });
};

main();
