const Banner = require('../models/bannerModel')

const loadAddBanner = async(req,res)=>{
    try {
        res.render('addBanner')
    } catch (error) {
        console.log(error.message);
    }
}

const addBanner = async(req,res)=>{
    try {
        const banner = new Banner({
            header:req.body.header,
            image:req.file.filename,
            description:req.body.description
        })
        const ban = await banner.save();
        if(ban){
            res.render('addBanner',{message:'Banner Added'})
        }
        else{
            res.render('addBanner',{message:'Banner Add Failed'})
        }
    } catch (error) {
        console.log(error.message);
    }
}
const bannerList = async(req,res)=>{
    try {
        
        const bannerData = await Banner.find();
        console.log(bannerData);
        res.render('bannerList',{banner:bannerData})
    } catch (error) {
        console.log(error.message);
    }
}

const listBanner = async(req,res)=>{
    try {
        res.render('bannerList')
    } catch (error) {
        console.log(error.message);
    }
}
const editBanner = async(req,res)=>{
    try {
        const id = req.query.id
        const bannerData = await Banner.findOne({_id:id})
        res.render('editBanner',{banner:bannerData})
    } catch (error) {
        console.log(error.message);
    }
}

 const saveBanner = async(req,res)=>{
    try {
        const id = req.body.id
      
            const bannerdata = await Banner.findByIdAndUpdate({_id:req.body.id},{$set:{header:req.body.header,description:req.body.description}})
         
            res.redirect("/admin/bannerList")
        
    } catch (error) {
        console.log(error.message);
    }
 }
 const bannerListing = async(req,res)=>{
    try {
        const listBanner = req.body.id
        console.log("hii")
        await Banner.findByIdAndUpdate({_id:listBanner},{$set:{is_List : false}})
        res.json({is_List:true})
    } catch (error) {
        console.log(error.message);
    }
 }
 const bannerUnlist = async(req,res)=>{
    try {
        const unlistBanner = req.body.id
        await Banner.findByIdAndUpdate({_id:unlistBanner},{$set:{is_List : true}})
        res.json({is_List:true})
    } catch (error) {
        console.log(error.message);
    }
 }

 const displayBanner = async(req,res)=>{
    try {
        const banner = await Banner.find({is_List:true})
        res.render('home',{banner})
    } catch (error) {
        console.log(error.message);
    }
 }
module.exports = {
    loadAddBanner,
    bannerList,
    addBanner,
    listBanner,
    editBanner,
    saveBanner,
    bannerListing,
    bannerUnlist,
    displayBanner
}