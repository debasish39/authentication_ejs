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
    "AuthApp <noreply@debasish.xyz>",

  to:
    user.email,

  subject:
    "Reset Your Password",

  html:
`
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8" />

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>
  Reset Your Password
</title>

</head>

<body style="
  margin:0;
  padding:0;
  background:#eef2ff;
  font-family:
    Arial,
    Helvetica,
    sans-serif;
">

  <!-- Outer Wrapper -->

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      background:
        linear-gradient(
          135deg,
          #4f46e5,
          #7c3aed,
          #06b6d4
        );
      padding:40px 20px;
    "
  >

    <tr>

      <td align="center">

        <!-- Main Container -->

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width:560px;
            background:#ffffff;
            border-radius:28px;
            overflow:hidden;
            box-shadow:
              0 12px 35px rgba(0,0,0,0.15);
          "
        >

          <!-- Header -->

          <tr>

            <td
              align="center"
              style="
                padding:50px 35px;
                background:
                  linear-gradient(
                    135deg,
                    #4f46e5,
                    #7c3aed
                  );
                color:white;
              "
            >

              <!-- Logo -->

              
              <h1 style="
                margin:0;
                font-size:34px;
                line-height:1.3;
                font-weight:700;
              ">
                Password Reset
              </h1>

              <p style="
                margin-top:14px;
                font-size:16px;
                line-height:1.7;
                color:
                  rgba(255,255,255,0.85);
              ">
                Secure account recovery for your AuthApp account.
              </p>

            </td>

          </tr>

          <!-- Content -->

          <tr>

            <td
              style="
                padding:45px 35px;
                color:#374151;
              "
            >

              <p style="
                margin-top:0;
                font-size:16px;
                line-height:1.8;
              ">
                Hello,
              </p>

              <p style="
                font-size:16px;
                line-height:1.9;
                color:#4b5563;
              ">
                We received a request to reset your password.
                Click the secure button below to continue.
              </p>

              <!-- CTA Button -->

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin:40px 0;
                "
              >

                <tr>

                  <td align="center">

                    <a
                      href="${resetLink}"
                      style="
                        display:inline-block;
                        padding:18px 36px;
                        background:
                          linear-gradient(
                            135deg,
                            #7c3aed,
                            #06b6d4
                          );
                        color:white;
                        text-decoration:none;
                        font-size:16px;
                        font-weight:bold;
                        border-radius:16px;
                        box-shadow:
                          0 8px 20px rgba(124,58,237,0.3);
                      "
                    >
                      Reset Password
                    </a>

                  </td>

                </tr>

              </table>

              <!-- Security Box -->

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  background:#f9fafb;
                  border-left:
                    5px solid #7c3aed;
                  border-radius:14px;
                  padding:22px;
                  margin-top:10px;
                "
              >

                <tr>

                  <td>

                    <p style="
                      margin:0;
                      font-size:15px;
                      line-height:1.8;
                      color:#4b5563;
                    ">
                      ⏳ This reset link expires in
                      <strong>15 minutes</strong>
                      for security reasons.
                    </p>

                  </td>

                </tr>

              </table>

              <!-- Security Note -->

              <p style="
                margin-top:35px;
                font-size:15px;
                line-height:1.9;
                color:#6b7280;
              ">
                If you didn’t request this password reset,
                you can safely ignore this email.
                Your account will remain secure.
              </p>

            </td>

          </tr>

          <!-- Footer -->

          <tr>

            <td
              align="center"
              style="
                padding:28px;
                background:#f9fafb;
                color:#6b7280;
                font-size:13px;
                line-height:1.8;
              "
            >

              © 2026 AuthApp <br />

              Secure Authentication System

            </td>

          </tr>

        </table>

      </td>

    </tr>

  </table>

</body>

</html>
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