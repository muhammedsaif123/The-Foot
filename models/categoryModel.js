const mongoose = require('mongoose')
const { type } = require('os')

const categorySchema = new mongoose.Schema({
    categoryName :{
        type:String,
        required : true
    },
    status:{
        type:Boolean,
        default:true
    }
})

module.exports = mongoose.model('category',categorySchema)