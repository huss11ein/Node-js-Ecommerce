const mongoose = require("mongoose");

const discount = mongoose.Schema({
 name:{
    type:String,
    unique:true,
    required: true,

 },
 timeOfUse:{
    type:Number,
    min:0,  
    required: true,
},
timeOfUseByoneUser:{
    type:Number,
max:this.timeOfUse
},
percentage :{
    type:Number,
    min:0,  
    
},
value:{
type:Number, 
min:0
},
OnlyOnShipping:{
type: Boolean,
default : false
},
minOrderPrice:{
    type:Number,
    required: true,
},
Usage: [
    {
      userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
      },
      timeOfUse: {
        type: Number,
        required: true,
        max: this.timeOfUseByoneUser
      },
    },
  ],
});


module.exports =  mongoose.model("discount", discount);
