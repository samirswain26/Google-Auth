import axios from "axios";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import User from "../model/user.model.js";
import { genearteNonce, generateState } from "../utils/auth.util.js";
import passport from "passport";

const logout = (req, res) => {
  res.clearCookie("access_token");
  res.json({ message: "Logout successful" });
};

const GC = async (req, res) => {
  try {
    passport.authenticate("google", {
      failureRedirect: "/",
      successRedirect: "/profile",
    });
  } catch (error) {}
};

const Profile = async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.redirect("/");
    console.log("request user", req.user);
    res.send(
      `<h1>Welcome ${req.user.displayName}</h1>
    <img src="${req.user.photos[0].value}" />
    <a href="/logout">Logout</a>`
    );
  } catch (error) {
    console.error("Get Profile Error:", error.message);
    res.status(500).json({ message: "Internal server error in profile" });
  }
};

export {  logout, GC, Profile };
