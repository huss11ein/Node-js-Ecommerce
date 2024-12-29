const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },
    Discount: {
      type: Number,
      min: 0,
    },
    Status: {
      type: String,
      enum: ["In stock", "Out of Stock"],
      required: true,
    },
    showStatus: {
      type: String,
      enum: ["public", "private"],
      required: true,},
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    priceAfterDecount: {
      type: Number,
    },
    mainImage: String,
    images: [
      {
        image: {
          type: String,
        },
      },
    ],
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    Size: {
      type: String,
      enum: [
        "Small",
        "Medium",
        "large",
        "XL",
        "XXL",
        "XXXL",
        "free size"
      ],
      required: true,
    },
    WashingInstructions: {
      type: String,
    },
    category: {
      type: String,
      required: true,
      ref: "Category",
    },
    code: {
      type: String,
    },
    subCategory: {
      type: String,
    },
    order: {
      type: Number,
      required: true,
    },
    addedToCart: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
productSchema.pre("save", async function () {
  if (!this.Discount) {
    this.priceAfterDecount = this.price;
  }
  this.priceAfterDecount = await (this.price -
    (this.Discount / 100) * this.price);
    if (this.quantity == 0) {
      this.Status = "Out of Stock";
    } else {

      this.Status = "In stock";
    }
    
});
productSchema.pre("findByIdAndUpdate", async function () {
  if (!this.Discount) {
    this.priceAfterDecount = this.price;
  }
  this.priceAfterDecount = await (this.price -
    (this.Discount / 100) * this.price);

    if (this.quantity === 0) {
      this.Status = "Out of Stock";
    } else {
      this.Status = "In stock";
    }
    
});
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
