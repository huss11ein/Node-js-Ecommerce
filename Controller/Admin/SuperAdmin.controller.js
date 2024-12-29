const { default: mongoose } = require( 'mongoose' )
const userModel = require('../../Models/User.model')

class SuperAdmin  {
static addAdmin = async (req, res)=>{
try{
    const userData = new userModel(req.body);
    // send email including email and password 

    //userData.otp = userOTP;
    await userData.generateToken();
    await userData.save();
    res.send({
      apiStatus: true,
      data: userData,
   
    });
  } catch (e) {
    res.send({
      apiStatus: false,
      data: e.message,
      message: "error adding Admin ",
    });
}}






}
const superAdmin = mongoose.model("SuperAdmin", SuperAdmin);
module.exports= superAdmin