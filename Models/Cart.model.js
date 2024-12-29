const mongoose = require("mongoose");

const cart = mongoose.Schema({
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
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
});

const Cart = mongoose.model("Cart", cart);
module.exports = Cart;
