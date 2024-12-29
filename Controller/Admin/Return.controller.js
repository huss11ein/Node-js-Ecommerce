const returnModel = require("../../Models/Return.Model");
const sendMyEmail = require("../../helper/sendEmail");
const order = require("../User/Order.controller");
class Return {
  static changeRequestStatus = async (req, res) => {
    try {
      const prevrequests = await returnModel
        .findByIdAndUpdate(
          req.body.id,
          {
            Status: req.body.status,
            Returned: req.body.returned,
            Responsemessage: req.body.responseMessage,
          },
          {
            returnDocument: "after",
          }
        )
        .populate({
          path: "UserID",
          strictPopulate: false,
          select: "name number email city address code",
        })
        .populate({
          path: "ItemID",
          strictPopulate: false,
          select:
            "name description Discount price priceAfterDecount images category subCategory mainImage code",
        });
      if (req.body.status == "Refused") {
        await sendMyEmail({
          userEmail: prevrequests.UserID.email,
          subject: `Return Request `,
          contant: `<!DOCTYPE html>
          <html lang="en">
          
          <body style="font-family: Arial, sans-serif; color: #; margin: 0; padding: 20px;">
          
              <p><strong>Hi ${prevrequests.UserID.name},</strong></p>
          
              <p>Thanks for reaching out. Satisfying our customers is very important to us and I’m sorry our ${prevrequests.ItemID.name} didn’t meet your expectations. I fully respect your decision and can only apologize for any problems you experienced.</p>
          
              <p>You should expect the courier to pick up the order from 2-5 business days, after that please advise how you want to be sent the money.</p>
          
              <p>If you have any other questions or concerns, just reply to this email, I’ll be here to help you in any way I can.</p>
          
              <p><strong>Best,</strong></p>
              <p><strong>Nutbynoran,</strong></p>
          </body>
          
          </html>
          
          
`,
        });
      }
      res.status(200).send();
    } catch (error) {
      res.status(400).send({
        ApiStatus: false,
        message: error.message,
      });
    }
  };
  static GetALLRequests = async (req, res) => {
    try {
      const usersRequests = await returnModel
        .find()
        .populate({
          path: "UserID",
          strictPopulate: false,
          select: "name number email city address code",
        })
        .populate({
          path: "ItemID",
          strictPopulate: false,
          select:
            "name description Discount price priceAfterDecount images category subCategory mainImage code",
        });
      if (usersRequests.length == 0) {
        return res.send(null);
      }
      res.send(usersRequests);
    } catch (error) {
      res.status(400).send({
        ApiStatus: false,
        message: error.message,
      });
    }
  };
  static returnSearch = async (req, res) => {
    try {
      let orders = await returnModel
        .find({
          $or: [
            { code: { $regex: `(?i)${req.body.search}` } },
            { Status: { $regex: `(?i)${req.body.search}` } },
          ],
        })
        .populate({
          path: "UserID",
          strictPopulate: false,
          select: "name number email",
        })
        .populate({
          path: "ItemID",
          strictPopulate: false,
          select:
            "name description Discount Size price priceAfterDecount images category subCategory mainImage",
        })
        .where(req.query)
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
}

module.exports = Return;
