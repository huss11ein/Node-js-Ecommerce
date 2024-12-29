const mongoose = require("mongoose");

const categoryScehma = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
 
        image: {
          type: String,
        },
     
    subCategoies: [
      {
        subCategory: {
          type: String,
          unique:true
        },
      },
    ],
  },
  
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categoryScehma);

module.exports = Category;
