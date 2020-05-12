const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true,"User Id is required"]
    },
    type:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        required:true,
        trim:true,
    },
    amount:{
        type:String,
        required:true,
        trim:true,
        default:0
    },
   ref:{
       type:String,
       required:true
   }
})


module.exports = Transaction = mongoose.model('transaction',TransactionSchema)