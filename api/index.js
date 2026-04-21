const express = require("express");
const serverless = require("serverless-http");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const authRoutes = require("../routes/auth");
const rootDir = process.cwd();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(rootDir, "public")));

console.log(path.join(rootDir, "public"))

app.set("view engine", "ejs");
app.set("views", path.join(rootDir, "views"));

app.use("/", authRoutes);

module.exports = (req, res) => {return app(req,res)};