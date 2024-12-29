const userModel = require("../../Models/User.model");

class User {

  static login = async (req, res) => {
    try {
      const userData = await userModel.login(req.body.email, req.body.password);
      if (userData.isBlocked) {
        throw new Error("Blocked ");
      }
      
      if(!(userData.userRole=="admin"|| userData.userRole=="SuperAdmin")){
        throw new Error (" Not Admin ")
      }
      const token = await userData.generateToken();
      res.status(200).send({
      token: token ,
      use : userData.userRole 
        
      });
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        data: e.message,
        message: "failed",
      });
    }
  };

}
module.exports = User;
