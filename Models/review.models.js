const mongoose = require("mongoose")
const Review = new mongoose.Schema({
OrderID:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Order'
},
UserID:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'user'
},
Review:{
    type: String,
    required:true
}},
{ timeStamp: true })

const ReviewSchema = mongoose.model("Review", Review)
module.exports = ReviewSchema