import User from "../models/User.js";

import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";
import crypto from "crypto";
// import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
import {Resend} from "resend";
const resend =
  new Resend(
    process.env.RESEND_API_KEY
  );
/* =====================================
   HOME PAGE
===================================== */

const homePage = (req, res) => {

  res.render("home", {
    error: null,
  });

};



/* =====================================
   REGISTER PAGE
===================================== */

const registerPage = (req, res) => {

  res.render("register", {
    error: null,
  });

};




/* =====================================
   REGISTER USER
===================================== */

const registerUser = async (
  req,
  res
) => {

  try {

    const {
      name,
      email,
      password,
    } = req.body;

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {

     return res.render("register", {
  error: "User already exists",
});

    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.redirect("/login");

  } catch (error) {

    res.render("register", {
  error: error.message,
});

  }
};



/* =====================================
   LOGIN USER
===================================== */

const loginPage = (req, res) => {

  res.render("login", {
    error: null,
  });

};



const loginUser = async (
  req,
  res
) => {

  try {

    const { email, password } =
      req.body;

    const user =
      await User.findOne({ email });

    if (!user) {

      return res.render("login", {
        error: "Invalid Credentials",
      });

    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {

      return res.render("login", {
        error: "Invalid Credentials",
      });

    }

    // JWT TOKEN

    const token = jwt.sign(
      {
        id: user._id,
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

  } catch (error) {

    res.render("login", {
      error: error.message,
    });

  }
};



/* =====================================
   DASHBOARD
===================================== */

const dashboardPage = async (
  req,
  res
) => {

  try {

    const user =
      await User.findById(req.user.id);

    res.render("dashboard", {
      user,
    });

  } catch (error) {

    res.send(error.message);

  }
};



/* =====================================
   LOGOUT
===================================== */

const logoutUser = (req, res) => {

  res.clearCookie("token");

  res.redirect("/login");

};

/* =====================================
   CHANGE PASSWORD
===================================== */
const changePasswordPage=(req,res)=>{
  res.render(
    "changePassword",{
      error:null,
    }
  )
}
const changePassword=async(req,res)=>{
  try{
    const {oldPassword,newPassword}=req.body;
    const user=await User.findById(req.user.id);
    // CHECK OLD PASSWORD
    const isMatch=await bcrypt.compare(oldPassword,user.password);
    if(!isMatch){
      return res.render(
        "changePassword",{
          error:"Old password is incorrect",
        }
      );
    }

    // HASH NEW PASSWORD
    const hashedPassword=await bcrypt.hash(newPassword,10);
    // UPDATE PASSWORD
    user.password=hashedPassword;
    await user.save();
    res.redirect("/dashboard");
  }catch(error){
    res.render(
      "changePassword",{
        error:error.message,
      }
    );
  }
}

const forgotPasswordPage =
  (req, res) => {

    res.render(
      "forgotPassword",
      {
        error: null,
      }
    );

};
const forgotPassword = async (
  req,
  res
) => {

  try {

    const { email } =
      req.body;

    const user =
      await User.findOne({
        email
      });

    if (!user) {

      return res.render(
        "forgotPassword",
        {
          error:
            "User not found",
        }
      );

    }

    // GENERATE TOKEN

    const resetToken =
      crypto.randomBytes(33)
      .toString("hex");

    user.resetToken =
      resetToken;

    user.resetTokenExpire =
      Date.now() +
      15 * 60 * 1000;

    await user.save();

    // RESET LINK

    const resetLink =
`https://authentication-ejs.onrender.com/reset-password/${resetToken}`;

    // SEND EMAIL USING RESEND

    await resend.emails.send({

      from:
        "noreply@debasish.xyz",

      to:
        user.email,

      subject:
        "Password Reset",

     html:
`
<h2>Password Reset</h2>

<p>
You requested a password reset.
</p>

<p>
Click below:
</p>

<a href="${resetLink}">
Reset Password
</a>

<p>
This link expires in 15 minutes.
</p>
`,
    });

    res.redirect("/login");

  } catch (error) {

    res.render(
      "forgotPassword",
      {
        error:
          error.message,
      }
    );

  }
};

// RESET PASSWORD PAGE
const resetPasswordPage=async(req,res)=>{
  res.render(
    "resetPassword",{
      error:null,
      token:req.params.token,
    }
  )
}

// RESET PASSWORD Logic
const resetPassword=async(req,res)=>{
  try{
    const {password}=req.body;
    const token=req.params.token;
    const user=await User.findOne({
      resetToken:token,
      resetTokenExpire:{$gt:Date.now()},
    });
    if(!user){
      return res.send("Invalid or expired token");
    };
    // HASH NEW PASSWORD
    const hashedPassword=await bcrypt.hash(password,10);
    // UPDATE PASSWORD
    user.password=hashedPassword;
    // REMOVE RESET TOKEN
    user.resetToken=undefined;
    user.resetTokenExpire=undefined;
    await user.save();
    res.redirect("/login");
  }catch(error){
    res.send(error.message);
  }
}
export {
  homePage,
  registerPage,
  loginPage,
  changePasswordPage,
  changePassword,
  forgotPasswordPage,
  forgotPassword,
  resetPasswordPage,
  resetPassword,
  registerUser,
  loginUser,
  dashboardPage,
  logoutUser,
};