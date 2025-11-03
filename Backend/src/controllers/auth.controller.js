import axios from "axios";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import User from "../model/user.model.js";
import { genearteNonce, generateState } from "../utils/auth.util.js";

const getjwksClient = async () => {
  return jwksClient({
    jwksUri: process.env.GOOGLE_JWKS_URL, //The uri should be change in future
    cache: true,
    rateLimit: true,
  });
};

const getSignKeyid = async (kid) => {
  const client = getjwksClient();
  return new Promise((resolve, reject) => {
    client.getSignKeyid(kid, (err, key) => {
      if (err) {
        return reject(err);
      }
      const signinKey = key.getPublicKey();
      resolve(signinKey);
    });
  });
};

const verifyGoogleToken = async (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decode) {
      throw new error("Invalid error");
    }

    const kid = decoded.header.kid;
    const signingKey = await getSignKeyid(kid);

    const verification = jwt.verify(token, signingKey, {
      algorithms: ["RS256"],
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    return verification;
  } catch (error) {
    throw new Error("token verification failed...");
  }
};

const googleLogin = async (req, res) => {
  const state = generateState();
  const nonce = genearteNonce();

  // Store state and nonce in session cookies
  res.cookie("oauth_state", state, {
    httpOnly: true,
    maxAge: 600000,
    sameSite: "lax",
  });
  res.cookie("oauth_nonce", nonce, {
    httpOnly: true,
    maxAge: 600000,
    sameSite: "lax",
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile%20openid&state=${state}&nonce=${nonce}`;

  // Redirect the user to the Google login page
  res.redirect(googleAuthUrl);
};



//  Handle Google Callback and Exchange Code for Tokens
const googleCallback = async (req, res) => {
  try {
    // Check if the state matches the one stored in the cookie
    const { code, state } = req.query;
    const savedState = req.cookies.oauth_state;
    const savedNonce = req.cookies.oauth_nonce;

    // Clear the cookies after use
    res.clearCookie("oauth_state");
    res.clearCookie("oauth_nonce");

    if (!state || !savedState || state !== savedState) {
      return res.status(401).json({ message: "Invalid state parameter" });
    }

    // Exchange code for Google tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      null,
      {
        params: {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
          code,
          grant_type: "authorization_code",
        },
      }
    );

    const { id_token, access_token, refresh_token } = tokenResponse.data;
    if (!id_token) {
      return res.status(401).json({ message: "Invalid ID token" });
    }

    // Verify the ID token
    const decodedToken = await verifyGoogleToken(id_token);
    if (!decodedToken) {
      return res.status(401).json({ message: "Invalid ID token" });
    }

    // Check if the nonce matches the one stored in the cookie
    if (!decodedToken.nonce || decodedToken.nonce !== savedNonce) {
      return res.status(401).json({ message: "Invalid nonce parameter" });
    }

    // Find or create the user in the database
    let user = await User.findOne({ googleId: decodedToken.sub });
    if (!user) {
      user = await User.create({
        googleId: decodedToken.sub,
        email: decodedToken.email,
        name: decodedToken.name,
        refreshToken: refresh_token || null,
      });
    } else if (refresh_token) {
      // Update the refresh token if it has changed
      user.refreshToken = refresh_token;
      await user.save();
    }

    // Generate our own JWT token for the user
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set the JWT token in a cookie
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1 hour
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error(
      "OAuth Callback Error:",
      error.response?.data || error.message
    );
    res.status(500).json({ message: "Authentication failed" });
  }
};

//  Get User Profile
const getProfile = async (req, res) => {
  try {
    // find the user by id
    const user = await User.findById(req.user.userId).select(
      "-refreshToken -__v"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

//  Logout User
const logout = (req, res) => {
  res.clearCookie("access_token");
  res.json({ message: "Logout successful" });
};


const login = async(req, res) => {
  try {
  } catch (error) {
    
  }
}


export { googleLogin, googleCallback, getProfile, logout };

