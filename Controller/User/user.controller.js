const userModel = require("../../Models/User.model");
const productModel = require("../../Models/Product.model");
const otp = require("../../helper/sendOTP");
const shippingFees = require("../../Models/shippingFees.Models");
const sendEmail = require("../../helper/sendEmail");
const Category = require("../../Models/Category.model");
const uploadfromxsl = require("../../helper/uploadfromxsl");
class User {
  static register = async (req, res) => {
    try {
      //const userOTP = otp(6);
      const userData = new userModel(req.body);
      if (userData.userRole != "user") throw new Error("INVALID USERROLE");
      //userData.otp = userOTP;
      let token = await userData.generateToken();
      await userData.save();
      res.status(200).send({
        token: token,
        userRole: userData.userRole,
      });
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        data: e.message,
        message: "error adding user",
      });
    }
  };
  static adddata = async (req, res) => {
    try {
      uploadfromxsl.up();
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        data: e.message,
        message: "error adding user",
      });
    }
  };
  static uploadProfileImage = async (req, res) => {
    try {
      req.user.image = req.file.destination;
      await req.user.save();
      res.send({
        apiStatus: true,
        data: req.user,
      });
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
      });
    }
  };
  static login = async (req, res) => {
    try {
      const userData = await userModel.login(req.body.email, req.body.password);
      if (userData.isBlocked) {
        throw new Error("Blocked ");
      }
      const token = await userData.generateToken();
      const role = userData.userRole;
      res.status(200).send({
        token: token,
        userRole: userData.userRole,
      });
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        data: e.message,
        message: "failed",
      });
    }
  };
  //error
  static singleUser = async (req, res) => {
    let country = await shippingFees.findOne({ Country: req.user.country });

    res.send({
      apiStatus: true,
      data: {
        name: req.user.name,
        number: req.user.number,
        email: req.user.email,
        birthdate: req.user.birthdate,
        country: req.user.country,
        CountryID: country.id,
        city: req.user.city,
        address: req.user.address,
      },
      message: "data featched",
    });
  };

  static logout = async (req, res) => {
    // remove token
    try {
      req.user.tokens = req.user.tokens.filter((tok) => req.token != tok.token);
      await req.user.save();
      res.send("logged out");
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        data: e.message,
        message: "failed loggout ",
      });
    }
  };

  static deleteSingleAcount = async (req, res) => {
    try {
      const user = await userModel.deleteOne({ id: req.params.id });
      res.send("Account Deleted");
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        data: e.message,
        message: "error deleting user",
      });
    }
  };
  static edit = async (req, res) => {
    try {
      //recrypt the password again
      if (req.body.password) {
        throw new Error("canpt rest password from here");
      }
      const userUpdated = await userModel.updateOne(
        { id: req.user._id },
        req.body,
        { upsert: false, runValidators: true }
      );
      res.send({
        apiStatus: true,
        data: userUpdated,
        message: "updates",
      });
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        message: e.message,
      });
    }
  };

  static Allproducts = async (req, res) => {
    try {
      let products = await productModel
        .find({ showStatus: "public" })
        .sort([["order", 1]]);
      res.status(201).send(products);
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        message: e.message,
      });
    }
  };
  static OneProduct = async (req, res) => {
    try {
      let product = await productModel
        .findOne({ _id: req.params.id })
        .where({ showStatus: "public" })

      res.status(201).send(product);
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        message: e.message,
      });
    }
  };
  static sortAESC = async (req, res) => {
    try {
      let products = await productModel
        .find()
        .sort("priceAfterDecount")
        .where("showStatus")
        .ne("private");
      res.status(201).send(products);
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        message: e.message,
      });
    }
  };
  static sortDESC = async (req, res) => {
    try {
      let products = await productModel
        .find()
        .sort({ priceAfterDecount: -1 })
        .where("showStatus")
        .ne("private");
      res.status(201).send(products);
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        message: e.message,
      });
    }
  };
  static ChooseByCategory = async (req, res) => {
    try {
      let category = await Category.findById(req.params.id);
      let products = await productModel
        .find({
          category: category.name,
        })
        .where("showStatus")
        .ne("private")
        .sort([["order", 1]]);
      res.status(201).send(products);
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        message: e.message,
      });
    }
  };
  static filterProduct = async (req, res) => {
   
    
    try {
      const filter = {
        showStatus: { $ne: "private" },
      };
      
      if (req.body.categories && req.body.categories.length > 0) {
        filter.category = { $in: req.body.categories };
      }
      
      if (req.body.subcategories&&req.body.subcategories.length > 0) {
        filter.subCategory = { $in: req.body.subcategories };
      }
      
      if (req.body.size && req.body.size.length > 0) {
        filter.Size = { $in: req.body.size };
      }
      
      if (req.body.minPrice !== null && req.body.maxPrice !== null) {
        filter.price = { $gte: req.body.minPrice, $lte: req.body.maxPrice };
      } else if (req.body.minPrice !== null) {
        filter.price = { $gte: req.body.minPrice };
      } else if (req.body.maxPrice !== null) {
        filter.price = { $lte: req.body.maxPrice };
      }
      const products = await productModel.find(filter).exec();

      res.status(201).send(products);
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        message: e.message,
      });
    }
  };
  static ChooseBySubCategory = async (req, res) => {
    try {
      let category = await Category.findById(req.params.id);
      let products = await productModel
        .find({
          category: category.name,
          subCategory: req.body.subcategory,
        })
        .where("showStatus")
        .ne("private")
        .sort([["order", 1]]);
      res.status(201).send(products);
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        message: e.message,
      });
    }
  };
  static SendOTP = async (req, res) => {
    try {
      let user = await userModel.findOne({ email: req.body.email });
      if (user) {
        let Otp = otp(6);

        await sendEmail({
          userEmail: req.body.email,
          subject: "Password ",
          contant: `
          <html>
            <body>
              <p>Hello Dear,</p>
              <p>You have requested to reset your password. Please use the following temporary code to complete the process:</p>
              <p>Temporary Code: <strong>${Otp}</strong></p>
              <p>Please enter this code in the password reset page to set a new password for your account.</p>
              <p>If you did not initiate this request, please disregard this message.</p>
              <p>Thank you,</p>
              <p>Nutbynoran</p>
            </body>
          </html>
        `,
        });

        user.OTP = Otp;
        await user.save();
        return res.send({ email: req.body.email, id: user._id });
      } else {
        throw new Error("user not fount in server");
      }
    } catch (error) {
      res.status(400).send({
        apiStatus: false,
        message: error.message,
      });
    }
  };

  static confiremOtp = async (req, res) => {
    try {
      let user = await userModel.findOne({ _id: req.params.id });
      if (req.body.otp == user.OTP) {
        user.OTP = 0;
        user.save();
        res.send({ id: user._id });
      } else {
        throw new Error("Otp not valid ");
      }
    } catch (error) {
      res.status(400).send({
        apiStatus: false,
        message: error.message,
      });
    }
  };
  static ResetPassword = async (req, res) => {
    try {
      let user = await userModel.findOne({ _id: req.params.id });
      if (user.OTP != 0) {
        throw new Error("user should enter otp ");
      }

      user.password = req.body.password;
      user.OTP = -1;
      user.save();
      res.send();
    } catch (error) {
      res.status(400).send({
        apiStatus: false,
        message: error.message,
      });
    }
  };
  static getleastRel = async (req, res) => {
    try {
      const data = await productModel
        .find()
        .where({ showStatus: "public" })
        .sort([["createdAt", -1]])
        .limit(6);
      res.send(data);
    } catch (error) {
      res.status(400).send({
        apiStatus: false,
        message: error.message,
      });
    }
  };
  static search = async (req, res) => {
    try {
      let products = await productModel.find({
        $or: [
          { name: { $regex: `(?i)${req.body.search}` } },
          { category: { $regex: `(?i)${req.body.search}` } },
          { subCategory: { $regex: `(?i)${req.body.search}` } },
        ],
      }) .where("showStatus")
      .ne("private")
      if (products.length <= 0) {
        res.send(" Product Not Found :(");
        return;
      }
      res.status(201).send(products);
    } catch (error) {
      res.status(400).send(error.message);
    }
  };
  static RetaltedProduct = async (req, res) => {
    try {
      let product = await productModel.findById(req.params.id);
      let products;
      if (product.subCategory) {
        products = await productModel
          .find({
            subCategory: product.subCategory,
            category: product.category,
          })
          .where({ "showStatus": "public" })
          .where("_id")
          .ne(product._id)
          .ne({"showStatus":"private"})
          .sort([["order", 1]]);

      } else {
        products = await productModel
          .find({ category: product.category })
          .where({ "showStatus": "public" })
          .where("_id")
          .ne(product._id)
      }

      res.send(products);
    } catch (error) {
      res.status(400).send({
        apiStatus: false,
        message: error.message,
      });
    }
  };
}
module.exports = User;
