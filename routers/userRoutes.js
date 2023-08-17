const express = require('express')
const user_route = express()
const session = require('express-session')


const config = require('../config/config')
user_route.use(session({
    secret:config.sessionSecret,
    saveUninitialized:true,
    resave:false
}))

const auth = require('../middleware/auth')

user_route.set('view engine','ejs')
user_route.set('views','./views/Users') 

user_route.use(express.json());
user_route.use(express.urlencoded({ extended:true }));

const multer = require('multer');
const path = require('path')

const userController = require('../controllers/userController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const addressController = require('../controllers/addressController')
const couponController = require('../controllers/couponController')
const productController = require('../controllers/productController')
const wishlistController = require('../controllers/wishlistController')


user_route.get('/registerload',auth.isLogout,userController.loadRegister)

user_route.get('/verify',userController.verifyMail);

user_route.get('/otp',userController.otps)

user_route.get('/',auth.isLogout,userController.userLogin)

user_route.get('/login',auth.isLogout,userController.userLogin)

user_route.get('/home',auth.isLogin,userController.loadHome)

user_route.get('/Shop',auth.isLogin,userController.loadShop);

user_route.get('/productView',auth.isLogin,userController.productDetail)

user_route.get('/cart',auth.isLogin,cartController.loadCart)

user_route.get('/addCount',auth.isLogin,cartController.addCount)

user_route.get('/checkOutpage',auth.isLogin,orderController.loadCheckout)

user_route.get('/addAddress',auth.isLogin,addressController.addAddress)

user_route.get('/addAddressInProfile',addressController.addAddressInProfile)

user_route.get('/removeAddress',auth.isLogin,addressController.removeAddress)

user_route.get('/removeAddressInProfile',auth.isLogin,addressController.removeAddressInProfile)

user_route.get('/successPage',auth.isLogin,orderController.successPage)

user_route.get('/profile',auth.isLogin,userController.userProfile)
 
user_route.get('/editProfile',auth.isLogin,userController.editProfile)

user_route.get('/order',auth.isLogin,orderController.loadOrder)

user_route.get('/showProducts',auth.isLogin,orderController.vieworderProducts)

user_route.get('/changePassword',auth.isLogin,userController.changePassword)

user_route.get('/newPassword',auth.isLogin,userController.newPassword)

user_route.get('/Men',auth.isLogin,productController.filterMen)

user_route.get('/Women',auth.isLogin,productController.filterWomen)

user_route.get('/logout',userController.logOut)

user_route.get('/wishlist',auth.isLogin,wishlistController.loadWishlist)

user_route.get('/coupons',auth.isLogin,couponController.loadcouponList)

user_route.get('/shopfilter',auth.isLogin,productController.priceFilter)



// post

user_route.post('/register',userController.insertUser)

user_route.post('/otpCheck',userController.otpCheck)    

user_route.post('/login',userController.verifyLogin)

user_route.post('/addToCart',cartController.addCart)

user_route.post('/addAddress',addressController.insertAddress)

user_route.post('/addAddressInProfile',addressController.insertAddressInProfile)

user_route.post('/editProfile',userController.saveProfile)

user_route.post('/checkOutpage',orderController.placeOrder)

user_route.post('/cancel',orderController.cancelOrder)

user_route.post('/checkPassword',userController.checkPassword)

user_route.post('/savePassword',userController.savePassword)

user_route.post('/verifyPayment',orderController.verifyPayment)

user_route.post('/applyCoupon',couponController.applyCoupon)

user_route.post('/addCount',cartController.addCount)

user_route.post('/addToWishlist',wishlistController.addToWishlist);

user_route.post('/deleteCart',auth.isLogin,cartController.removeProduct)

user_route.post('/deleteWishlist',wishlistController.removeWishlist)

user_route.post('/lessCount',cartController.lessCount)

user_route.post('/search',productController.searchproduct)

// user_route.get('/interconnect',userController.interconnection)

module.exports = user_route;    