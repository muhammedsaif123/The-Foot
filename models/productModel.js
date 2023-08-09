const mongoose = require('mongoose')
const { type } = require('os')

const productSchema = new mongoose.Schema({

    productName : {
        type :String,
        require:true
    },
    price : {
        type : Number,
        required :true
    },
    stockQuantity : {
        type : Number,
        required : true
    },
    image : {
        type : Array,
        required : true
    },
    category : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    is_List : {
        type :Boolean,
        default:true
    }
})

module.exports = mongoose.model('product',productSchema)