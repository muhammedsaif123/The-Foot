const Product = require ('../models/productModel');
const Wishlist = require('../models/wishlistModel');
const cart = require('../models/cartModel');
const User = require('../models/userModel');
const { ObjectId } = require('mongodb');

const loadWishlist = async(req,res)=>{
    try {
        console.log("hiii");
        const userName = await User.findOne({_id:req.session.user_id});
        const wishlistData = await Wishlist.findOne({user:req.session.user_id}).populate("products.productId")
        console.log(wishlistData);
        const wish = wishlistData.products
        console.log("start"+wish+"oooppppps");
        if(wishlistData){
            if(wish.length > 0){
                if(req.session.user_id){
                    res.render('wishlist',{userName,wish})
                }
                else{
                    res.redirect('/')
                }
            }else{
                res.render('emptywishlist')
            }
        }
        else{
            res.render('emptywishlist')
        }
    } catch (error) {
        console.log(error.message);
    }
}
const addToWishlist = async(req,res)=>{
    try{
        console.log('saifu');
        const proId = req.body.id;
        const user = await User.findOne({_id:req.session.user_id})
        console.log(user);
        const productData = await Product.findOne({_id:proId});
        const wishlistData = await Wishlist.findOne({user:req.session.user_id});
        if(wishlistData){
            const checkWishlist = await wishlistData.products.findIndex((wish)=> wish.productId == proId);
            console.log(checkWishlist);
            if(checkWishlist != -1){
                res.json({check:true})
            }else{
                await Wishlist.updateOne({user:req.session.user_id},{$push:{products:{productId:proId}}});
                res.json({success:true});
            }
        }else{
            const wishlist = new Wishlist({
                user:req.session.user_id,
                userName:user.name,
                products:[{
                    productId:productData._id
                }]
            })
            const wish = await wishlist.save();
            if(wish){
                res.json({success:true});
            }
        }
    }catch(error){
        console.log(error.message);
    }
}
const removeWishlist = async(req,res)=>{
    try {
        const id = req.body.id;
        await Wishlist.updateOne({user:req.session.user_id},{$pull:{products:{productId:id}}})
       
        res.redirect('/wishList')
    } catch (error) {
        console.log(error.message);
    }
}

// add cart from wishlist
const addfromWishlist = async (req,res)=>{
    try {
        let id = req.body.query
        let productData = await Product.findById({_id:id});
        let userName = await User.findOne({_id:req.session.user_id});
        let cartData =await cart.findOne({userId:userName._id});
        if(cartData){
            console.log("hiiii");
            let proExit = await cartData.products.findIndex(
                (Product)=>Product.productid == id)
                if(proExit != -1){
                    await cart.updateOne({userId:req.session.user_id,"products.productid":id},{$inc:{"products.$.count":1}})
                    res.json({success:true})
                }   else{
                    await cart.findOneAndUpdate({userId:req.session.user_id},{$push:{products:{productid:id,productPrice:productData.Price}}});
                    res.json({success:true});
                }
            }else{
            console.log("hi");
            const Cart= new cart({
                    userId:userName._id,
                    userName:userName.name,
                    products:[{
                        productid:productData._id,
                        productPrice:productData.price
                    }]
                });
                const cartData = await Cart.save();
                if(cartData){
                    res.json({success:true})
                }else{
                    res.redirect('/shop');
                }
            }
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    loadWishlist,
    addToWishlist,
    removeWishlist,
    addfromWishlist
}