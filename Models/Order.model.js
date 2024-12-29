const mongoose = require("mongoose");
const { disconnect } = require("process");
const { stringify } = require("querystring");
const adress = require("./Adderss");

const order = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    code: {
      type: String,
      required: true,
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
    paymentMethod: {
      type: String,
      enum: ["credit card", "cash on delivery"],
      required: true,
    },

    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },
    Note: {
      type: String,
    },
    ShippingFees: {
      type: Number,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      code: {
        type: String,
      },
      percentage: {
        type: Number,
      },
      value: {
        type: Number,
      },
    },
    total: {
      type: Number,
      required: true,
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", order);

module.exports = Order;
