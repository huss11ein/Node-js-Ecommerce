const mongoose = require("mongoose");
const shippingFees = mongoose.Schema(
    {
      Country: {
          type: String,
          required: true,
          trim: true,
          unique: true,
        },
        cities: [
         {
                  Name: String,
                  fees: Number,
                
              },
        ]
          
      },
      {
        timestamps: true,
      }
  

);
const ShippingFees = mongoose.model("shippingFees", shippingFees);
module.exports = ShippingFees;
