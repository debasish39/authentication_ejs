import express from "express";

const router = express.Router();

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



export default router;