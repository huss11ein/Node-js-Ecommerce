const userModel = require("../../Models/User.model");
const productModel = require("../../Models/Product.model");
const orderModel = require("../../Models/Order.model");
const cartModel = require("../../Models/Cart.model");
const favModel = require("../../Models/favourite.model");
const Product = require("../../Models/Product.model");
class BuyProduct {
  static getproducts = async (req, res) => {
    try {
      let products = [];
      for (let element in req.body.products) {
        let product = await productModel.findById(req.body.products[element]);

        products.push(product);
      }
      res.send({ products: products });
    } catch (error) {
      res.status(400).send({
        apistatus: false,
        message: error.message,
      });
    }
  };
  static creatNewCart = async (userId, cart) => {
    if (!cart) {
      cart = await new cartModel({
        userId: userId,
        Products: [],
        subtotal: 0,
      });
    }
    await cart.save();

    return cart;
  };
  static calculateSubtotal = async (cart) => {
    let subtotal = 0;
    // Itrate over the request items
    for (let item of cart.Products) {
      let product = await productModel.findOne({_id: item.productId});
      if(!product) {
        cart.Products=  cart.Products.filter((product) => product.productId !== item.productId);
        await cart.save();
        continue;
      }
      if (product.priceAfterDecount  > 0) {     
        subtotal += product.priceAfterDecount * item.quantity;
      } else {
        subtotal += product.price * item.quantity;
      }
    }
    return subtotal;
  };
  static modifyCart = async (userId, requestItems) => {
    // Find user cart
    let cart = await cartModel.findOne({ userId: userId });
    // If the user doesn't have cart, create new one
    if (!cart) {
      cart = await this.creatNewCart(userId, cart);
      cart.subtotal = 0;
    }

    // Itrate over the request items
    for (let item of requestItems) {
      let product = await productModel.findById(item.productId);
      // Add product to cart only if product is present on database
      if (product) {
        // Search for product on cart

        if (!(await this.inCart(product, cart))) {
          cart.Products.push({
            productId: item.productId, 
            quantity: 1,
          });
        }
      } else {
        throw new Error("Product not deleted");
      }

      // Return cart
    }
    cart.subtotal = await this.calculateSubtotal(cart);
    await cart.save();
    return cart;
  };
  static addtoCart = async (req, res) => {
    try {
      let items = [];
      req.body.items.forEach((element) => {
        items.push({ productId: element, quantity: 1 });
      });

      const cart = await this.modifyCart(req.user._id, items);

      res.status(201).send();
    } catch (e) {
      res.status(400).send(e.message);
    }
  };
  static showCart = async (req, res) => {
    try {
      let cart = await cartModel.findOne({ userId: req.user._id });

      if (!cart) {
        cart = await this.creatNewCart(req.user._id, cart);
      }

      let products = [];

      if (cart) {
        for (let element in cart.Products) {
          let product = await productModel.findById(
            cart.Products[element].productId
          );

          if (cart.Products[element].quantity == 0 && product.quantity > 0) {
            cart.Products[element].quantity = 1;
            await cart.save();
          }
          product.quantity = cart.Products[element].quantity;
          products.push(product);
        }
      }
      let result = [];
      result.push({ products: products, subtotal: cart.subtotal });

      res.send(result[0]);
    } catch (e) {
      res.status(400).send({
        apistatus: false,
        message: e.message,
      });
    }
  };
  static inCart = (item, cart) => {
    let index = cart.Products.findIndex((object) => {
      return object.productId == item.id;
    });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  };
  static RemoveAll = async (req, res) => {
    try {
      let usercart = await cartModel.findOne({ userId: req.user._id });
      usercart = {
        userId: req.user._id,
        Products: [],
        subtotal: 0,
      };
      res.status(200).send();
    } catch (e) {
      res.status(400).send(e.message);
    }
  };
  static RemoveFromCart = async (req, res) => {
    try {
      let cart = await cartModel.findOne({ userId: req.user._id });

      let index = cart.Products.findIndex((object) => {
        return object.productId == req.params.id;
      });
      if (index >= 0) {
        cart.Products.splice(index, 1);
      }

      await this.calculateSubtotal(cart).then((value) => {
        cart.subtotal = value;
      });
      await cart.save();
      res.status(200).send();
    } catch (e) {
      res.status(400).send({
        apistatus: false,
        message: e.message,
      });
    }
  };
}
module.exports = BuyProduct;
/*  userId: userId,
      Products: [],
      subtotal: 0,*/
