const mongoose = require('mongoose')

const Blocked = mongoose.Schema({
    userId:{
 type:mongoose.Schema.Types.ObjectId,
 ref:"User"
    },
    email:{
        type:String
    }


} ,{ timeStamp: true })

const BlockedSchema = mongoose.model('Blocked', Blocked)
module.exports = BlockedSchema