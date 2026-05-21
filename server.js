import dotenv from "dotenv";
dotenv.config();

import express from "express";

import cors from "cors";

import cookieParser from "cookie-parser";

import path from "path";

import { fileURLToPath } from "url";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";

const app = express();

console.log(process.env.EMAIL_USER);

console.log(process.env.EMAIL_PASS);

/* =====================================
   __dirname FIX
===================================== */

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);



/* =====================================
   DATABASE
===================================== */

connectDB();



/* =====================================
   MIDDLEWARE
===================================== */

app.use(cors());

app.use(express.urlencoded({
  extended: true,
}));

app.use(express.json());

app.use(cookieParser());



/* =====================================
   VIEW ENGINE
===================================== */

app.set("view engine", "ejs");

app.set(
  "views",
  path.join(__dirname, "views")
);



/* =====================================
   STATIC FOLDER
===================================== */

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);



/* =====================================
   ROUTES
===================================== */

app.use("/", authRoutes);



/* =====================================
   SERVER
===================================== */

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on https://localhost:${PORT}`
  );

});