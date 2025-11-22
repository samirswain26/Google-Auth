import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";

import connectDB from "./db/db.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config({
  path: "./.env",
});

const app = express();
app.use(express.json());
app.use(cookieParser());

await import("./Google/auth.js");

const port = process.env.PORT || 4000;

app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: `http://localhost:${port}`, credentials: true }));
app.use(
  session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.listen(port, () => {
  console.log(`App is listen on port : ${port}`);
});

app.use("/api/v1/auth", authRoutes);

app.get("/", (req, res) => {
  // res.send("Chill karo! Sab hojayega...");
  res.send(`<a href="/auth/google">Login with Google</a>`);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    successRedirect: "/profile",
  })
);

app.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/");
  //This req.user data is coming from the db not the google user data...
  console.log("request user", req.user);
  res.send(
    `<h1>Welcome ${req.user.username}</h1>
    <img src="${req.user?.avatar}" />
    <a href="/logout">Logout</a>`
  );
});

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`App is listening on port : ${port}`);
    });
  })
  .catch((err) => {
    console.error("Mongodb connection error :", err);
  });
