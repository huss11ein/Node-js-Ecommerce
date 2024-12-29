const returnModel = require("../../Models/Return.Model");
const orderModel = require('../../Models/Order.model');
const productModel = require('../../Models/Product.model')
const sendMyEmail = require( "../../helper/sendEmail" );
class Return {
  static request = async (req, res) => {
    try {


      const prevrequests = await returnModel.findOne({
        UserID: req.user._id,
        ItemID: req.body.id,
      });
      if (prevrequests) {
        throw new Error(" You have made a request already ");
      }
      let boughtit = false;
      const orders = await orderModel
      .find({ userId: req.user._id, status: "delivered" })
      .populate({
        path: "Products.productId",
        strictPopulate: false,
      });
      let index=-1
      orders.forEach(element => {
        element.Products.forEach(e => {
          
          if(req.body.id==e.productId._id ) 
          {
            boughtit = true
          }     

});
        
       index =index+1 
      });
      if(boughtit){
        let product = await productModel.findById( req.body.id)
        const returnReq = await new returnModel({
          ItemID: req.body.id,
          UserID: req.user._id,
          Reason: req.body.Reason,
          code: orders[index].code
        }).save();
        await sendMyEmail({
          userEmail: req.user.email,
          subject: `Return Request `,
          contant: `<!DOCTYPE html>
          <html lang="en">
          
          <body style="font-family: Arial, sans-serif; color: #; margin: 0; padding: 20px;">
          
              <p><strong>Hi ${req.user.name},</strong></p>
          
              <p>Thanks for reaching out. Satisfying our customers is very important to us and I’m sorry our ${product.name} didn’t meet your expectations. I fully respect your decision and can only apologize for any problems you experienced.</p>
          
              <p>You should expect the courier to pick up the order from 2-5 business days, after that please advise how you want to be sent the money.</p>
          
              <p>If you have any other questions or concerns, just reply to this email, I’ll be here to help you in any way I can.</p>
          
              <p><strong>Best,</strong></p>
              <p><strong>Nutbynoran,</strong></p>
          </body>
          
          </html>
          
`,
        });
        res.send(returnReq);
      }
      else{
        throw new Error("user didn't buy this product")
      }
      
    } catch (error) {
      res.status(400).send({
        ApiStatus: false,
        message: error.message,
      });
    }
  };
  static TrackRequests = async (req, res) => {
    try {
      const userRequests = await returnModel.find({ UserID: req.user._id });
      res.send(userRequests);
    } catch (error) {
      res.status(400).send({
        ApiStatus: false,
        message: error.message,
      });
    }
  };
}
module.exports = Return;
