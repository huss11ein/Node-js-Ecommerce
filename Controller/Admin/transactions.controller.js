const order = require("../../Models/Order.model");
const users = require("../../Models/User.model");
const productmodel = require("../../Models/Product.model");
const sendMyEmail = require( "../../helper/sendEmail" );

class transactions {
  static getTransactions = async (req, res) => {
    try {
      let orders = await order
        .find()
        .populate({
          path: "userId",
          strictPopulate: false,
          select: "name number email",
        })
        .where(req.query)
        .populate({
          path: "Products.productId",
          strictPopulate: false,
          select:
            "name description Discount Size price priceAfterDecount images category subCategory mainImage code",
        })
        .sort([["createdAt", -1]]);
      if (orders.length == 0) {
        return res.send(null);
      }
      res.status(200).send(orders);
    } catch (error) {
      res.status(400).send({
        apiStatus: false,
        message: error.message,
      });
    }
  };
  static getTransactionssorted = async (req, res) => {
    try {
      let orders = await order
        .find()
        .populate({
          path: "userId",
          strictPopulate: false,
          select: "name number email",
        })
        .sort(req.query)
        .populate({
          path: "Products.productId",
          strictPopulate: false,
          select:
            "name description Discount Size price priceAfterDecount images category subCategory code",
        });
      if (orders.length == 0) {
        return res.send(null);
      }
      res.status(200).send(orders);
    } catch (error) {
      res.status(400).send({
        apiStatus: false,
        message: error.message,
      });
    }
  };
  static changeTransactionstatus = async (req, res) => {
    try {
      const transaction = await order.findByIdAndUpdate(
        req.body.id,
        {
          status: req.body.status,
        },
        {
          returnDocument: "after",
        }
      ).populate({
        path: "userId",
        strictPopulate: false,
        select: "name number email",
      })
      let products=[]
     for (const element of transaction.Products){
      products.push(await productmodel.findById(element.productId))

     }
   
      await sendMyEmail({
        userEmail: transaction.userId.email,
        subject: `Your Order Is Now ${req.body.status} | Nut by noran `,
        contant: `
        <!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation</title>
        </head>
        
        <body style="font-family: Arial, sans-serif; color: #213B74; margin: 0; padding: 20px;">
        
            <img src="https://res.cloudinary.com/dkno6b9gj/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1695985126/logo/logo2_tuxn0u.jpg?_s=public-apps" alt="Logo" style="max-width: 100px;">
            <p style="color: #213B74;"> <strong>Nutbynoran <strong></p>
            <br>
            <p style="color: #213B74;"><strong>Dear ${
              transaction.userId.name
            },</strong></p>
            <br>
            <p style="color: #213B74;"><strong>Thank you for shopping at Nut!</strong></p>
                
            <h2 style="color: #213B74;"><srong>Order is now ${req.body.status} </srong></h2>
            <div style="border: 2px solid #D14828; padding: 10px; margin: 20px 0; border-radius: 10px;">
                <p><strong>Order ID:</strong></p>
                <div style="border: 1px dashed #D14828; padding: 10px; border-radius: 5px;">
                    <p style="text-align: center; font-size: 24px; font-weight: bold; color: #D14828;">${
                      transaction.code
                    }</p>
                </div>
            </div>
        
            <div style="border: 2px solid #D14828; padding: 10px; margin: 20px 0; border-radius: 10px;">
                <h3 style="color: #D14828;">Order Details</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                    <tr>
                        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
                        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Quantity</th>
                        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Price</th>
                    </tr>
                    ${products
                      .map(
                        (item) => `
                        <tr>
                            <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">${item.name}</td>
                            <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">1</td>
                            <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">${item.priceAfterDecount}</td>
                        </tr>
                    `
                      )
                      .join("")}
                </table>
            </div>
        
            <div style="border: 2px solid #D14828; padding: 10px; margin: 20px 0; border-radius: 10px;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                    <tr>
                        <td style="padding: 8px; text-align: left;">Subtotal:</td>
                        <td style="padding: 8px; text-align: left;">${
                          transaction.subtotal
                        }</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; text-align: left;">Shipping:</td>
                        <td style="padding: 8px; text-align: left;"> ${
                          transaction.ShippingFees
                        }</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; text-align: left;">Total:</td>
                        <td style="padding: 8px; text-align: left;"> ${
                          transaction.total
                        }</td>
                    </tr>
                </table>
            </div>
        </body>
        
        </html>
        
        
      `,
      });
      res.send(transaction);
    } catch (error) {
      res.status(400).send(error.message);
    }
  };
  static search = async (req, res) => {
    try {
      let orders = await order
        .find({
          $or: [
            { code: { $regex: `(?i)${req.body.search}` } },
            { status: { $regex: `(?i)${req.body.search}` } },
            { address: { $regex: `(?i)${req.body.search}` } },
          ],
        })
        .populate({
          path: "userId",
          strictPopulate: false,
          select: "name number email",
        })
        .where(req.query)
        .populate({
          path: "Products.productId",
          strictPopulate: false,
          select:
            "name description Discount Size price priceAfterDecount images category subCategory  ",
        })
        .sort([["createdAt", -1]]);
      if (orders.length == 0) {
        return res.send(null);
      }
      if (orders.length <= 0) {
        res.send(" orders Not Found :(");
        return;
      }
      res.status(201).send(orders);
    } catch (error) {
      res.status(400).send(error.message);
    }
  };

  static getDeliverdOrders = async (req, res) => {
    try {
      let AllDelivedTransactions = [];
      let orders = await order.find();
      for (let element in orders) {
        if (orders[element].status == "delivered") {
          let user = await users.findById(orders[element].userId);
          let oneOrder = orders[element];
          AllTransactions.push({ user, oneOrder });
        }
      }
      res.status(200).send(AllDelivedTransactions);
    } catch (error) {
      res.status(400).send({
        apiStatus: false,
        message: error.message,
      });
    }
  };
}
module.exports = transactions;
