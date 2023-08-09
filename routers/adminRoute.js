const express = require('express');
const admin_route = express();
const multer = require('multer')
const upload = require('../config/multer')
const path = require('path')

const session = require('express-session');
const config = require('../config/config');
admin_route.use(session({
    secret:config.sessionSecret,
    saveUninitialized:true,
    resave:false
}))
admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended:true }));

admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin');

const auth = require('../middleware/adminAuth')

const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')
const bannerController = require('../controllers/bannerController')

admin_route.get('/',auth.isLogout,adminController.adminlogin)

admin_route.get('/home',auth.isLogin,adminController.loadDashboard)

admin_route.get('/logout',adminController.logout)

admin_route.get('/home',auth.isLogin,adminController.adminDashboard) 

admin_route.get("/userList",auth.isLogin,adminController.UserList)

admin_route.get('/category',auth.isLogin,categoryController.categoryList)

admin_route.get('/addCategory',auth.isLogin,categoryController.addCategory)

admin_route.get('/editCategory',auth.isLogin,categoryController.editCategory)

admin_route.get('/addProduct',auth.isLogin,productController.addProduct)

admin_route.get('/productList',auth.isLogin,productController.productListing);

admin_route.get('/editProduct',auth.isLogin,productController.editProduct)

admin_route.get('/orders',auth.isLogin,orderController.adminOrder)

admin_route.get('/orderDetails',auth.isLogin,orderController.productList)

admin_route.get('/editOrder',auth.isLogin,orderController.changeStatus)

admin_route.get('/addCoupons',auth.isLogin,couponController.loadCoupon)

admin_route.get('/couponListing',auth.isLogin,couponController.listCoupons)

admin_route.get('/editCoupon',auth.isLogin,couponController.editCoupons)

admin_route.get('/addBanner',auth.isLogin,bannerController.loadAddBanner)

admin_route.get('/bannerList',auth.isLogin,bannerController.bannerList)

admin_route.get('/editBanner',auth.isLogin,bannerController.editBanner)

admin_route.get('/salesReport',auth.isLogin,adminController.salesReport)




admin_route.post('/',adminController.verifyLogin)

admin_route.post('/List',productController.list)

admin_route.post('/unList',productController.unList)

admin_route.post('/removeImage',productController.removeImg);

admin_route.post("/block",adminController.block)

admin_route.post("/unblock",adminController.unblock)

admin_route.post('/deleteCoupon',couponController.deleteCoupon)

admin_route.post('/addCategory',categoryController.insertCategory)

admin_route.post('/editCategory',categoryController.saveCategory)

admin_route.post('/addProduct',upload.upload.array("Image",10),productController.insertProduct)

admin_route.post('/editProduct',upload.upload.array("Image",10),productController.saveProduct);

admin_route.post('/editOrder',orderController.saveEditOrder)

admin_route.post('/addCoupons',couponController.postAddCoupon)

admin_route.post('/editCoupon',couponController.saveEditCoupon)

admin_route.post('/addBanner',upload.upload.single('image'),bannerController.addBanner)

admin_route.post('/editBanner',upload.upload.single('image'),bannerController.saveBanner)

admin_route.post('/bannerList',bannerController.bannerListing)

admin_route.post('/salesReport',adminController.loadSalesReport)



admin_route.post('/bannerUnList',bannerController.bannerUnlist)
admin_route.get('*',function(req,res){
    res.redirect('/admin');  
})


module.exports = admin_route;