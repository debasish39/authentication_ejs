import express from "express";

const router = express.Router();

import jwt from "jsonwebtoken";

import passport from "passport";

import {

  homePage,
  registerPage,
  loginPage,
  registerUser,
  loginUser,
  dashboardPage,
  logoutUser,
  changePasswordPage,
  changePassword,
  forgotPasswordPage,
  forgotPassword,
  resetPasswordPage,
  resetPassword,

} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

/* =====================================
   ROUTES
===================================== */

router.get("/", homePage);

router.get("/register", registerPage);

router.post("/register", registerUser);

router.get("/login", loginPage);

router.post("/login", loginUser);

router.get(
  "/dashboard",
  authMiddleware,
  dashboardPage
);

router.get("/logout", logoutUser);
router.get(
  "/change-password",
  authMiddleware,
  changePasswordPage
);

router.post(
  "/change-password",
  authMiddleware,
  changePassword
);

router.get(
  "/forgot-password",
  forgotPasswordPage
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.get(
  "/reset-password/:token",
  resetPasswordPage
);

router.post(
  "/reset-password/:token",
  resetPassword
);
router.get(

  "/auth/google",

  passport.authenticate(
    "google",
    {
      scope:
        ["profile", "email"],
    }
  )

);

router.get(

  "/auth/google/callback",

  passport.authenticate(
    "google",
    {
      failureRedirect:
        "/login",
    }
  ),

  async (req, res) => {

    // GENERATE JWT

    const token = jwt.sign(

      {
        id: req.user._id,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d",
      }

    );

    // STORE COOKIE

    res.cookie("token", token, {
      httpOnly: true,
    });

    res.redirect("/dashboard");

  }

);

export default router;