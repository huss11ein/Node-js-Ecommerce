const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");


const mongoose = require("mongoose");
mongoose.set('strictQuery', false);


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`we are on http://localhost/${port} `));
app.use(cors({
  origin: "*",
  })
);
app.use(express.static('public'));

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
require("dotenv").config();
require("./Models/Connection/databaseConnection");

app.set("view engine", "hbs");

const userRoute = require("./app/user.routes");
app.use("/api/user", userRoute);
const AdminRoutes = require("./app/admin.Routes");
app.use("/api/Admin", AdminRoutes);
const SuperAdminRoutes = require("./app/superAdmin.routes");

app.use("/api/SuperAdmin", SuperAdminRoutes);


