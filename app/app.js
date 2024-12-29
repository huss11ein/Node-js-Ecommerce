const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");


const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const dirPath = path.join(__dirname, "../routes");

app.use(cors({
  origin: "*",
  })
);
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
require("dotenv").config();
require("../Models/Connection/databaseConnection");

app.set("view engine", "hbs");

const userRoute = require("./user.routes");
app.use("/api/user", userRoute);
const AdminRoutes = require("./admin.Routes");
app.use("/api/Admin", AdminRoutes);
const SuperAdminRoutes = require("./superAdmin.routes");

app.use("/api/SuperAdmin", SuperAdminRoutes);

