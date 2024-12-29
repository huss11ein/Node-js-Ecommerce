const mongoose = require("mongoose")
const Return = new mongoose.Schema({
ItemID:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Product'
},
UserID:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'user'
},
Reason:{
    type: String,
    required:true
},
Status :
{
    type:String,
    enum:["Approved", "Refused","Pending"],
    default:"Pending"
}
,
Responsemessage:{
    type:String
},
Returned :{
    type:String,

    enum:["Yes","No"],
    default:"No"
},
code:String

},
{ timeStamp: true })

const ReturnSchema = mongoose.model("Return", Return)
module.exports = ReturnSchema