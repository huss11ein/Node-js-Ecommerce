const { default: mongoose } = require("mongoose");
const userModel = require("../../Models/User.model");
const bcrypt = require("bcryptjs");
const discount = require("../../Models/discountCode");
class SuperAdmin {
  static addAdmin = async (req, res) => {
    try {
      req.body.userRole = "admin";
      const userData = new userModel(req.body);
      // send email including email and password
     //userData.otp = userOTP;
      await userData.generateToken();
      await userData.save();
      res.send();
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        data: e.message,
        message: "error adding Admin ",
      });
    }
  };
  static getALLAdmin = async (req, res) => {
    try {
      const allusers = await userModel
        .find({ userRole: "admin" })
        .select(["name", "number", "email", "userRole", "_id", "isBlocked"]);

      res.send(allusers);
    } catch (error) {
      res.status(400).send({
        apiStatus: false,
        data: error.message,
        message: "error showing Admin ",
      });
    }
  };
  static blockadmin = async (req, res) => {
    try {
      // User already Blocked Unblock him
      const user = await users.findOne({ _id: req.body.userID });
      user.isBlocked = !user.isBlocked;
      user.save();
      res.send("Blocked");
    } catch (error) {
      res.status(400).send({
        apiStatus: false,
        data: error.message,
        message: "error Blcoking User ",
      });
    }
  };
  static UpdateAdmin = async (req, res) => {
    try {
      //recrypt the password again
      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 8);
      }
      const userUpdated = await userModel.updateOne(
        { id: req.params.id },
        req.body,
        { upsert: false, runValidators: true }
      );
      res.send("Updated");
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        message: e.message,
      });
    }
  };
  static addDiscountCode = async (req, res) => {
    try {
      await new discount(req.body).save();
      res.send();
    } catch (error) {
      res.status(400).send({
        apiStatus: false,
        data: error.message,
        message: "error showing Admin ",
      });
    }
  };
  static getAllDiscountCode = async (req, res) => {
    try {
      const all = await discount.find();
      res.send(all);
    } catch (error) {
      res.status(400).send({
        apiStatus: false,
        message: error.message,
      });
    }
  };
  static deleteCode = async (req, res) => {
    try {
      await discount.deleteOne({ _id: req.params.id });
      res.send();
    } catch (error) {
      res.status(400).send({
        apiStatus: false,
        message: error.message,
      });
    }
  };
}
module.exports = SuperAdmin;