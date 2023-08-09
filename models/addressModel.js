const mongoose = require('mongoose');
const addressSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    addresses:[{
        userName:{
            type:String,
            required:true
        },
        mobile:{
            type:Number,
            required:true,
        },
        alternativeMob : {
             type :Number,
             required : true 
        },
        address:{
            type :String,
            required : true
        },
        city:{
            type : String,
            required : true
        },
        pincode:{
            type : String,
            required : true
        }
    }]
})

module.exports = mongoose.model('Address',addressSchema);