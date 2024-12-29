const mongoose = require("mongoose");
const fav = mongoose.Schema({

    UserId :{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:"User"
    },
    Products: [
        {
          product_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Product",
          },
        
     
         
        },
      ],

})

const favourite = mongoose.model("Fav", fav)
module.exports= favourite