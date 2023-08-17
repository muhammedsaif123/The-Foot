const User = require('../models/userModel')
const Product = require ('../models/productModel');
const bcrypt = require('bcrypt');
const Address = require('../models/addressModel')
const Order = require('../models/orderModel')
const Banner = require('../models/bannerModel')
const nodemailer = require('nodemailer')
const Category = require('../models/categoryModel');

const securePassword = async(password)=>{
    try {
        const passwordHash = bcrypt.hash(password,10);
        return passwordHash;

    } catch (error) {
        console.log(error.message);
    }
}

//for send mail
var otp2;
let otp = ''
let tempEmail;
const sendVerifyMail = async(name, email, user_id)=>{

    try {
        var otp = Math.floor(1000 + Math.random() * 9000);
        console.log(otp);
        otp2=otp

        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:'saifbinyoosaf707@gmail.com',
                pass:'elmeylfwofictjnr'
            }
        });

        const mailOptions = {
            from:'saifbinyoosaf707@gmail.com',
            to:email, 
            subject:'For Verification mail',
            html:'<p>Hii '+ name +'please enter'+''+ otp +'for verification</p>'
        }
        transporter.sendMail(mailOptions, function(error,info){
            
            if(error){
                console.log(error);
            }
            else{
                console.log("Email has been sent:- ",info.response);
            }
        })

    } catch (error) {
        console.log(error.message);
    }
}

const loadRegister = async(req,res)=>{

    try {
        
        res.render('registration')

    } catch (error) {
        console.log(error.message);
    }
}

const insertUser =  async(req,res)=>{
    try {
        const Email = req.body.emailAdress
        const userMail = await User.findOne({email:Email})
        if(userMail){
            res.render('registration',{message:'Email already exist'})
        }
        else{
            if(req.body.password.length < 8){
                res.render('registration',{message:'passowrd must be at least 8 characters'})
            }
            else{
                    const spassword = await securePassword(req.body.password);
                    const user = new User({
                    name:req.body.username,
                    email:req.body.emailAdress,
                    mobile:req.body.phone,
                    password:spassword,
                    is_admin:0 ,
                });
                    const userData = await user.save();
                    tempEmail=userData.email;
                    if(userData){
                        sendVerifyMail(req.body.username, req.body.emailAdress,userData._id);
                        res.render('otp')
                    }
                    else{
                        res.render('registration',{message:'your registration has been failed'})
                    }
                }     
            }
    } catch (error) {
        console.log(error.message);
    }
}
 
const verifyMail = async(req,res)=>{
    try {
        const updateInfo = await User.updateMany({email:tempEmail},{$set:{is_verified:1}})
        console.log(updateInfo);
        res.render('email verified');


    } catch ( error) {
        console.log(error.message);
    }
}

const otps = async(req,res)=>{
    try {
        res.render('otp')
    } catch (error) {
        console.log(error.message)
    }
}   

const otpCheck = async(req,res)=>{
    
    try {
       const newOtp = req.body.otp
        if(newOtp == otp2){
            const updateInfo = await User.updateMany({email:tempEmail},{$set:{is_verified:1}})
            if(updateInfo){
                res.redirect('/login') 
            }   
        }else{
            res.render('otp',{message:"incorrect otp"})
        }
    } 
    catch (error) {
        console.log(error.message)
    }
}

const userLogin = async(req,res)=>{
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.emailAdress;
        const password = req.body.password;    
        const userData = await User.findOne({email:email})
        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                if(userData.is_blocked == true){
                    res.render('login',{message:'user is blocked' })
                }
                else{
                    if (userData.is_verified == 0) {
                        res.render('login',{message:'please verify your mail'});
                    }else{
                        req.session.user_id = userData._id
                        res.redirect('/home')
                    }
                }                
            }
            else{
                
                res.render('login',{message:'Email and Password is incorrect'})
            }
        }
        else{
            res.render('login',{message:'please enter Email and password'})
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async(req,res)=>{ 

    try {
        const banner = await Banner.find({is_List:true})
        const product = await Product.find({})
        res.render('home',{banner,product})
    } catch (error) {
        console.log(error.message);
    }

}
const loadShop = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1
        const limit = 2
        const skip = (page - 1) * limit

        let price = req.query.value 
        let category = req.query.category || "All"
        let Search = req.query.search || ""
        Search = Search.trim()

        const categoryData = await Category.find()
        let cat = []
        for(i = 0; i < categoryData.length ; i++){
            cat[i] = categoryData[i].categoryName
        }

        let sort;
        category === "All" ? category = [...cat] : category = req.query.category.split(',')
        req.query.value === "High" ? sort = -1 : sort = 1

        const productData = 
        await Product.aggregate([
            {$match : {productName : {$regex : Search, $options : 'i'},category : {$in : category}}},
            {$sort : {price : sort}},
            {$skip : skip},
            {$limit : limit}
        ])
        // await Product.find({name : {$regex : Search, $options :'i'}}).where("category").in([...category])
        // .sort({price : sort}).skip(skip).limit(limit)

        const productCount = (await Product.find(
            {productName : {$regex : Search, $options :'i'}}).where("category").in([...category])).length
        
        const totalPage = Math.ceil(productCount / limit)

        if(req.session.user_id){
            res.render('shop',{ user: req.session.user_id, product : productData, category : categoryData,
                page,Search,price, totalPage,cat : category})
        }else {
            res.render('login')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const productDetail = async(req,res)=>{

    try {
        const id = req.query.id;
        const products = await Product.findOne({_id:id})
        res.render('productView',{products})
    } catch (error) {
        console.log(error.message);
    }
}

const userProfile = async(req,res)=>{
    try {
        const userDetails = await Address.findOne({userId:req.session.user_id});
       
        const wallet = await User.findOne({_id:req.session.user_id})
        console.log(wallet);
        res.render('profile',{userDetails,wallet})
    } catch (error) {
        console.log(error.message);
    }
}

const editProfile = async(req,res)=>{

    try {
        const id = req.query.id
        const index  = req.query.i 
        const User = await Address.findOne({userId:req.session.user_id})
        const user = User.addresses[index] 
        res.render('editProfile',{user})
    } catch (error) {
        console.log(error.message);
    }
}
const saveProfile = async(req,res)=>{

    try {
        const index = req.query.i
        console.log(index);
        const data = await Address.updateOne({userId:req.session.user_id},{
            $set:{
                [`addresses.${index}`]:{
                    userName:req.body.userName,
                    mobile:req.body.mobile,
                    address:req.body.address,
                    city:req.body.city,
                    pincode:req.body.pincode,
                }
            }
        })
        if(data){
            console.log(data);
            res.redirect('/profile')
        }
    } catch (error) {
        console.log(error.message);
    }
}
// change Password

const changePassword = async(req,res)=>{

    try {
        res.render('changePassword')
    } catch (error) {
        console.log(error.message);
    }
}
const checkPassword = async(req,res)=>{
    const password = req.body.password
    const password1 = await User.findOne({_id:req.session.user_id})
    console.log(password1);
    const passwordMatch = await bcrypt.compare(password,password1.password);
    try {
        
        if(passwordMatch){
            res.redirect("/newPassword")
        }
        else{
            res.render("changePassword",{message:'password is incorrect'})
        }
    } catch (error) {
        console.log(error.message);
    }
}
const newPassword = async(req,res)=>{
    try {
        res.render('newPassword')
    } catch (error) {
        console.log(error.message);
    }
}
const savePassword = async(req,res)=>{
    const newPassword = req.body.newPassword
    const confirmPassword = req.body.confirmPassword

    try {
        if(newPassword == confirmPassword){
           const bcryptedpassword = await securePassword(newPassword)
           await User.updateOne({_id:req.session.user_id},{$set:{password:bcryptedpassword}})
           res.redirect('/profile')
           
        }
        else{
            
            res.render('newPassword',{message:'password is incorrect'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const logOut = async(req,res)=>{
    try {
        console.log(req.session.user_id);
        req.session.user_id = false;
        res.redirect('/login')
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    otps,
    userLogin,
    verifyLogin,
    loadHome,
    otpCheck,
    loadShop,
    productDetail,
    userProfile,
    editProfile,
    saveProfile,
    changePassword,
    checkPassword,
    newPassword,
    savePassword,
    logOut,
    // interconnection
}