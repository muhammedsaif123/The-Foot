const User = require('../models/userModel')
const Coupon = require('../models/couponModel')
const { findByIdAndUpdate } = require('../models/orderModel');

//adminSide loadcoupon

const loadCoupon = async(req,res)=>{

    try {
        res.render('addCoupons')
    } catch (error) {
        console.log(error.message);
    }
}

//save addingcoupons

const postAddCoupon = async(req,res)=>{
    try {
        const coupon = new Coupon({
            code:req.body.code,
            discountType:req.body.discountType,
            expiryDate:req.body.date,
            discountAmount:req.body.amount,
            maxCartAmount:req.body.cartAmount,
            maxDiscountAmount:req.body.discountAmount,
            maxUsers:req.body.couponCount 
        })
        const couponData = await coupon.save();
        if(couponData){
            res.redirect('/admin/couponListing')
        } 
        else{
            res.redirect('/addCoupons')
        }
    } catch (error) {
        console.log(error.message);
    }
}
//list add coupons

const listCoupons = async(req,res)=>{
    try {
        const couponData = await Coupon.find({})
        res.render('couponListing',{couponData})
    } catch (error) {
        console.log(error.message);
    }
}

//edit coupons

const editCoupons = async(req,res)=>{
    try {
        const couponId = req.query.id
        const couponData = await Coupon.findOne({_id:couponId})
        res.render('editCoupon',{couponData})
    } catch (error) {
        console.log(error.message);
    }
}

 // Save Edit Coupon

 const saveEditCoupon = async(req,res)=>{

    try {
        const couponId = req.query.id
        const couponUpdate = await Coupon.updateOne({_id:couponId},{$set:{
            code:req.body.code,
            discountType:req.body.discountType,
            expiryDate:req.body.date,
            discountAmount:req.body.amount,
            maxCartAmount:req.body.cartAmount,
            maxDiscountAmount:req.body.discountAmount,
            maxUsers:req.body.couponCount 
        }})
        if(couponUpdate){
            res.redirect('/admin/couponListing')
        }
        else{
            res.render('editCoupon',{message:'coupon not edited'})
        }
    } catch (error) {
        console.log(error.message);
    }
 }

 //delete coupon
 
 const deleteCoupon = async(req,res)=>{ 
    try {
        const couponId = req.body.id
        await Coupon.deleteOne({_id:couponId});
        res.json({remove:true})
    } catch (error) {
        console.log(error.message);
    }
 }

 //apply coupon
 const applyCoupon = async(req,res)=>{
    try{
        const code = req.body.code;
        const amount = Number(req.body.amount);
        const userExist = await Coupon.findOne({code:code,user:{$in:[req.session.user_id]}});
        if(userExist){
            res.json({user:true});
        }else{
            const couponData = await Coupon.findOne({code:code});
            console.log(couponData);
            if(couponData){
                if(couponData.maxUsers<=0){
                    res.json({limit:true});
                }else{
                    if(couponData.status == false){
                        res.json({status:true})
                    }else{
                        if(couponData.expiryDate<=new Date()){
                            res.json({date:true});
                        }else{
                            if(couponData.maxCartAmount >= amount){
                                res.json({cartAmount:true});
                            }else{
                                await Coupon.findByIdAndUpdate({_id:couponData._id},{$push:{user:req.session.user_id}});
                                await Coupon.findByIdAndUpdate({_id:couponData._id},{$inc:{maxUsers:-1}});
                                if(couponData.discountType == "Fixed"){
                                    const disAmount = couponData.discountAmount;
                                    console.log(disAmount,"hiii")
                                    const disTotal = Math.round(amount - disAmount);
                                    return res.json({amountOkey:true,disAmount,disTotal});
                                }else if(couponData.discountType == "Percentage Type"){
                                    const perAmount = (amount * couponData.discountAmount)/100;
                                    if(perAmount <= maxDiscountAmount){
                                        const disAmount = perAmount;
                                        const disTotal = Math.round(amount-disAmount);
                                        return res.json({amountOkey:true,disAmount,disTotal});
                                    }
                                }else{
                                    const disAmount = couponData.maxDiscountAmount;
                                    const disTotal = Math.round(amount-disAmount);
                                    return res.json({amountOkey:true,disAmount,disTotal});
                                }
                            }
                        }
                    }
                }
            }else{
                res.json({invalid:true});
            }
        }
    }catch(error){
        console.log(error.message);
    }
}

const loadcouponList = async(req,res)=>{
    try {
        const coupon = await Coupon.find({}) 
        res.render('coupons',{coupon})
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadCoupon,
    postAddCoupon,
    listCoupons,
    editCoupons,
    saveEditCoupon,
    deleteCoupon,
    applyCoupon,
    loadcouponList
}