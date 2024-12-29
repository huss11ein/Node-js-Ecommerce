const jwt = require("jsonwebtoken");
const userModel = require("../Models/User.model");

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const d_token = jwt.verify(token, "keykey");

    const user = await userModel.findOne({
      _id: d_token._id,
      "tokens.token": token,
    });
    if (user.userRole != "SuperAdmin") throw new Error("not Super admin");
    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    res.status(400).send({
      apiStatus: false,
      date: e.message,
      message: "not Authorizated ",
    });
  }
};

module.exports = adminAuth;
