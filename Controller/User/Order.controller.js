const productModel = require("../../Models/Product.model");
const cartModel = require("../../Models/Cart.model");
const orderModel = require("../../Models/Order.model");
const discountCode = require("../../Models/discountCode");

const shippingFees = require("../../Models/shippingFees.Models");
const { find } = require("../../Models/Product.model");
const sendMyEmail = require("../../helper/sendEmail");
// to place an orden => Check if item still available ,  the quantity is okay , decrease the amount quantaty of this product , check the adress given
const discoutcheck = async (userid, code) => {
  try {
    let cart = await cartModel.findOne({ userId: userid });
    if (code) {
      // check if code still have stock
      if (code.timeOfUse == 0) {
        throw new Error(" code not working anymore");
      }
      if (code.timeOfUseByoneUser) {
        let index;
        if (code.timeOfUseByoneUser) {
          let timeofUse = 0;
          code.Usage.forEach((element) => {
            if (element.userID.equals(userid)) {
              index = code.Usage.indexOf(element);
              timeofUse = element.timeOfUse;
            }
          });
          if (timeofUse == 0) {
            code.Usage.push({ userID: userid, timeOfUse: 1 });
          } else if (timeofUse >= code.timeOfUseByoneUser) {
            throw new Error("You reach the max use of this code");
          } else {
            code.Usage[index].timeOfUse = code.Usage[index].timeOfUse + 1;
          }
        }
      } else {
        code.Usage.push({ userID: userid, timeOfUse: 1 });
      }

      code.timeOfUse = code.timeOfUse - 1;
    } else {
      throw new Error("order should be more than ", code.minOrderPrice);
    }
    // check if subtotal have the min
    if (code.OnlyOnShipping) {
      return {
        price: cart.subtotal,
        code: code,
        shippingFees: 0,
      };
    }
    if (cart.subtotal >= code.minOrderPrice) {
      // check if percentage
      if (code.percentage) {
        cart.subtotal = cart.subtotal - (code.percentage / 100) * cart.subtotal;
      } else if (code.value) {
        cart.subtotal = cart.subtotal - code.value;
      }
    } else {
      throw new Error(`order need to be at least ${code.minOrderPrice}`);
    }
    return {
      price: cart.subtotal,
      code: code,
    };
  } catch (error) {
    return { error: error.message };
  }
};

const CalculateShippingFess = async (Country, City, enteredCode, userid) => {
  try {
    let fees;
    let shipping = await shippingFees.findOne({ Country: Country });
    for (let element in shipping.cities) {
      if (shipping.cities[element].Name == City) {
        fees = shipping.cities[element].fees;
      }
    }
    if (!fees) {
      throw new Error("shipping not avilable for this city");
    }
    // check if user entered code to cancel shipping

    if (enteredCode) {
      let cart = await cartModel.findOne({ userId: userid });

      let code = await discountCode.findOne({ name: enteredCode });
      if (code.timeOfUse == 0) {
        throw new Error(" code not working anymore");
      }
      if (code.minOrderPrice > cart.subtotal) {
        throw new Error(`min price for this code is ${code.minOrderPrice}`);
      }
      if (code.timeOfUseByoneUser) {
        code.Usage.forEach((element) => {
          if (element.userID.equals(userid)) {
            if (element.timeOfUse >= code.timeOfUseByoneUser) {
              throw new Error("You reach the max use of this code");
            }
          }
        });
      }
      if (code) {
        if (code.OnlyOnShipping) {
          fees = 0;
        }
      }
    }
    return fees;
  } catch (error) {
    return { error: error.message };
  }
};
class order {
  static search = async (req, res) => {
    try {
      let products = await productModel.find({
        $or: [
          { name: { $regex: `(?i)${req.body.search}` } },
          { showStatus: { $regex: `(?i)${req.body.search}` } },
          { category: { $regex: `(?i)${req.body.search}` } },
          { subCategory: { $regex: `(?i)${req.body.search}` } },
          { code: { $regex: `(?i)${req.body.search}` } },
        ],
      });
      if (products.length <= 0) {
        res.send(" Product Not Found :(");
        return;
      }
      res.status(201).send(products);
    } catch (error) {
      res.status(400).send(error.message);
    }
  };
  static subtotal = async (req, res) => {
    try {
      let fees = await CalculateShippingFess(
        req.body.country,
        req.body.city,
        req.body.code,
        req.user._id
      );
      if (fees.error) {
        throw new Error(fees.error);
      }
      if (fees == 0 && body.code) {
        let discountCode = await this.discount;
      }
    } catch (error) {}
  };
  static placeOrder = async (req, res) => {
    try {
      let discountData = {};
      let cart = await cartModel.findOne({ userId: req.user._id });
      // check if address is null
      if (req.body.address == "null" || req.body.address == null) {
        throw new Error("address is empty");
      }
      //IF CART EMPTY
      if (!cart) {
        throw new Error("Add Items To Placee an order");
      }

      // calculate shipping fees
      let fees;
      let order = await new orderModel(req.body);
      order.userId = req.user._id;
      order.Products = cart.Products;
      order.paymentMethod = req.body.paymentMethod;
      order.number = req.body.phoneNumber;
      order.Note = req.body.Note
      // check discount

      if (req.body.code) {
        fees = await CalculateShippingFess(
          req.body.country,
          req.body.city,
          req.body.code,
          req.user._id
        );
        if (fees.error) {
          throw new Error(fees.error);
        }
        var code = await discountCode.findOne({ name: req.body.code });
        if (code) {
          discountData = await discoutcheck(req.user._id, code);

          if (discountData.error) {
            throw new Error(discountData.error);
          }

          order.discount = {
            code: req.body.code,
            percentage: discountData.code.percentage,
            value: discountData.code.value,
          };
          if (discountData.shippingFees == 0) {
            order.ShippingFees = 0;
          } else {
            order.total = order.ShippingFees + discountData.price;
          }
          order.subtotal = discountData.price;
        } else {
          throw new Error("code not found ");
        }
      } else {
        fees = await CalculateShippingFess(
          req.body.country,
          req.body.city,

          null,
          req.user._id
        );
        order.subtotal = cart.subtotal;

        if (fees.error) {
          throw new Error(fees.error);
        }
      }
      //taking info form user cart
      order.total = fees + order.subtotal;
      order.ShippingFees = fees;

      let index = 0;
      let products = [];
      for (let element in cart.Products) {
        let product = await productModel.findById(
          cart.Products[element].productId
        );
        products.push(product);

        if (
          !product ||
          product.Status == "Out of Stock" ||
          product.showStatus == "private" ||
          product.quantity == 0
        ) {
          cart.Products.splice(index, 1)
                    throw new Error(
            `${product.name} is out of stock please delete it from your cart first`
          );
        }

        if (product.quantity == 0) {
          product.Status = "Out of Stock";
        } else {
          product.quantity = product.quantity - cart.Products[element].quantity;
        }
        index = index +1;

        await product.save();
      }
      if (cart.Products.length == 0) {
        throw new Error(" all products not available");
      }
      order.Products = cart.Products;
      order.code = `NUT${new Date().getTime()}`;

      await order.save();
      await cartModel.deleteOne({ userId: req.user._id });
      if (discountData.code != null) {
        await discountData.code.save();
      }
      await sendMyEmail({
        userEmail: req.user.email,
        subject: "Your Order Created | Nut by noran ",
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
              req.user.name
            },</strong></p>
            <br>
            <p style="color: #213B74;"><strong>Thank you for shopping at Nut!</strong></p>
            <p style="color: #213B74;">We can’t wait for you to see your new special item.</p>
            <p style="color: #213B74;">The order has been received and is now being processed.</p>
        
            <h2 style="color: #213B74;"><srong>Your Order has been Placed and is Being Processed </srong></h2>
            <div style="border: 2px solid #D14828; padding: 10px; margin: 20px 0; border-radius: 10px;">
                <p><strong>Order ID:</strong></p>
                <div style="border: 1px dashed #D14828; padding: 10px; border-radius: 5px;">
                    <p style="text-align: center; font-size: 24px; font-weight: bold; color: #D14828;">${
                      order.code
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
                          order.subtotal
                        }</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; text-align: left;">Shipping:</td>
                        <td style="padding: 8px; text-align: left;"> ${
                          order.ShippingFees
                        }</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; text-align: left;">Total:</td>
                        <td style="padding: 8px; text-align: left;"> ${
                          order.total
                        }</td>
                    </tr>
                </table>
            </div>
        </body>
        
        </html>
        
        
      `,
      });

      await sendMyEmail({
        userEmail: "Rana.yasser92@gmail.com",
        subject: "You Got A New Order | Nut by noran ",
        contant: `
        <!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Order</title>
        </head>
        
        <body style="font-family: Arial, sans-serif; color: #213B74; margin: 0; padding: 20px;">
        
            <img src="https://res.cloudinary.com/dkno6b9gj/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1695985126/logo/logo2_tuxn0u.jpg?_s=public-apps" alt="Logo" style="max-width: 100px;">
            <p style="color: #213B74;"> <strong>Nutbynoran <strong></p>
            <br>
            
            <br>

            <p style="color: #213B74;">New order has been received </p>
        
            <div style="border: 2px solid #D14828; padding: 10px; margin: 20px 0; border-radius: 10px;">
                <p><strong>Order ID:</strong></p>
                <div style="border: 1px dashed #D14828; padding: 10px; border-radius: 5px;">
                    <p style="text-align: center; font-size: 24px; font-weight: bold; color: #D14828;">${
                      order.code
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
                          order.subtotal
                        }</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; text-align: left;">Shipping:</td>
                        <td style="padding: 8px; text-align: left;"> ${
                          order.ShippingFees
                        }</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; text-align: left;">Total:</td>
                        <td style="padding: 8px; text-align: left;"> ${
                          order.total
                        }</td>
                    </tr>
                </table>
            </div>
        </body>
        
        </html>
        
        
      `,
      });
      await sendMyEmail({
        userEmail: "noranhussam@gmail.com",
        subject: "You Got A New Order | Nut by noran ",
        contant: `
        <!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Order</title>
        </head>
        
        <body style="font-family: Arial, sans-serif; color: #213B74; margin: 0; padding: 20px;">
        
            <img src="https://res.cloudinary.com/dkno6b9gj/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1695985126/logo/logo2_tuxn0u.jpg?_s=public-apps" alt="Logo" style="max-width: 100px;">
            <p style="color: #213B74;"> <strong>Nutbynoran <strong></p>
            <br>
            
            <br>

            <p style="color: #213B74;">New order has been received </p>
        
            <div style="border: 2px solid #D14828; padding: 10px; margin: 20px 0; border-radius: 10px;">
                <p><strong>Order ID:</strong></p>
                <div style="border: 1px dashed #D14828; padding: 10px; border-radius: 5px;">
                    <p style="text-align: center; font-size: 24px; font-weight: bold; color: #D14828;">${
                      order.code
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
                          order.subtotal
                        }</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; text-align: left;">Shipping:</td>
                        <td style="padding: 8px; text-align: left;"> ${
                          order.ShippingFees
                        }</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; text-align: left;">Total:</td>
                        <td style="padding: 8px; text-align: left;"> ${
                          order.total
                        }</td>
                    </tr>
                </table>
            </div>
        </body>
        
        </html>
        
        
      `,
      });
      res.send();
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        data: e.message,
      });
    }
  };

  static AddressFees = async (req, res) => {
    try {
      let fees = await CalculateShippingFess(
        req.body.country,
        req.body.city,
        req.body.code,
        req.user._id
      );
      if (fees.error) {
        throw new Error(fees.error);
      }
      res.status(200).send(fees.toString());
    } catch (error) {
      res.status(400).send({
        apistatus: false,
        message: error.message,
      });
    }
  };
  static discount = async (req, res) => {
    try {
      let total;
      let fees = req.body.address;
      let code = await discountCode.findOne({ name: req.body.code });
      let cart = await cartModel.findOne({ userId: req.user._id });

      if (req.body.code) {
        // check if code still have stock
        if (code.timeOfUse == 0) {
          throw new Error(" code not working anymore");
        }
        if (code.timeOfUseByoneUser) {
          let timeofUse = 0;
          code.Usage.forEach((element) => {
            if (element.userID.equals(req.user._id)) {
              timeofUse = +1;
            }
          });

          if (timeofUse >= code.timeOfUseByoneUser) {
            throw new Error("You reach the max use of this code");
          }
        }
        if (cart.subtotal < code.minOrderPrice) {
          throw new Error("order should be more than ", code.minOrderPrice);
        }
        // check if subtotal have the min

        // check if percentage
        if (code.percentage) {
          cart.subtotal =
            cart.subtotal - (code.percentage / 100) * cart.subtotal;
          fees = req.body.address;
        } else if (code.value) {
          cart.subtotal = cart.subtotal - code.value;
          fees = req.body.address;
        } else if (code.OnlyOnShipping) {
          total = cart.subtotal;
          fees = 0;
        }
        res.send({
          total: cart.subtotal,
          shippingFees: fees,
        });
      }
    } catch (e) {
      res.status(400).send({
        apistatus: false,
        message: e.message,
      });
    }
  };
  static getProd = async (order) => {
    let products = [];
    for (let element in order.Products) {
      let product = await productModel.findById(
        order.Products[element].productId
      );

      product.quantity = order.Products[element].quantity;
      products.push(product);
    }
    return products;
  };

  static NonDeliverdOrders = async (req, res) => {
    try {
      let Order = await orderModel
        .find({ userId: req.user._id })
        .where("status")
        .ne("delivered")

        .populate({
          path: "userId",
          strictPopulate: false,
          select: "Name Number email",
        })
        .populate({
          path: "Products.productId",
          strictPopulate: false,
          select:
            "name description Discount price priceAfterDecount images category subCategory ",
        });

      res.send(Order);
    } catch (e) {
      res.status(400).send({
        apistatus: false,
        message: e.message,
      });
    }
  };
  static allOrders = async (req, res) => {
    try {
      let Order = await orderModel
        .find({ userId: req.user._id })

        .populate({
          path: "userId",
          strictPopulate: false,
          select: "Name Number email",
        })
        .populate({
          path: "Products.productId",
          strictPopulate: false,
          select:
            "name description Discount price priceAfterDecount images category subCategory mainImage ",
        });
      if (Order.length == 0) {
        return res.send(null);
      }
      res.send(Order);
    } catch (e) {
      res.status(400).send({
        apistatus: false,
        message: e.message,
      });
    }
  };

  static trackOrder = async (req, res) => {
    try {
      let order = await orderModel.find({
        userId: req.user._id,
        _id: req.params.id,
      });
      res.send(order);
    } catch (error) {
      res.status(400).send({
        apiStatus: false,
        message: error.message,
      });
    }
  };
  static allProductUserBuy = async (req, res) => {
    try {
      let products = [];
      const orders = await orderModel
        .find({ userId: req.user._id, status: "delivered" })
        .populate({
          path: "Products.productId",
          strictPopulate: false,
        });

      let index = 0;
      orders.forEach((element) => {
        element.Products.forEach((e) => {
          products.push(e);
        });

        index = +1;
      });
      res.send(products);
    } catch (error) {
      res.status(400).send({
        apiStatus: false,
        message: error.message,
      });
    }
  };
  static CancelOrder = async (req, res) => {
    try {
      let order = await orderModel.findOne({
        userId: req.user._id,
        _id: req.params.id,
      });
      if (order.status == "in progress") {
        order.status = "canceled";
        for (let element in order.Products) {
          let product = await productModel.findById(
            order.Products[element].productId
          );
          product.quantity = 1;
          product.showStatus = "public";
          product.Status = "In stock";
          await product.save();
        }
        await order.save();
        res.status(200).send("order canceled");
      } else {
        throw new Error(`can't cancel your order as its now ${order.status}`);
      }
    } catch (error) {
      res.status(400).send({
        apiStatus: false,
        message: error.message,
      });
    }
  };
}
module.exports = order;
/*const mongoose = require("mongoose");
const { stringify } = require("querystring");
const adress = require("../Models/Adderss");

const order = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    Products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },

        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    status: {
      type: String,
      enum: ["in progress", "canceled", "out for delivery", "delivered"],
      default: "in progress",
    },
    payment_method: {
      type: String,
      enum: ["credit card", "cash on delivery"],
      required: true,
    },

    Country: {
      Type: String,
    },
    City: {
      type: String,
    },
    Area: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    Note:{
      type: String,
    },
    ShippingFees: {
      type: Number,
      required: true,

    },
    phoneNumber:{
      type: Number,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,

      
    }
  },
  {
    timestamps: true,
  }
);
const Order = mongoose.model("Order", order);

module.exports = Order;
*/

/* whan address added calculat total 
if compon code added calculate total 
whan place order calculate all again
*/
/*{
    "country": "Egypt",
    "city": "Cairo",
    "code": "andrew8",
    "address":60,
    "paymentMethod":"cash on delivery",
    "phoneNumber":"01126681992"
}*/
