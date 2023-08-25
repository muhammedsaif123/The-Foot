const User = require('../models/userModel')
const Product = require('../models/productModel')
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel')
const Order = require('../models/orderModel')
const Razorpay = require('razorpay')
const dotenv = require('dotenv');
const moment = require('moment');
const puppeteer = require('puppeteer');
const { addAddress } = require('./addressController');
dotenv.config();


var instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_KEY
})

const loadCheckout = async (req, res) => {

  try {
    const user = await User.findOne({ _id: req.session.user_id })
    const total = await Cart.aggregate([
      {
        $match: { user: user.name }
      },
      {
        $unwind: '$products'
      },
      {
        $project: {
          productPrice: '$products.productPrice',
          count: '$products.count'
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: ['$productPrice', '$count']
            }
          }
        }
      }
    ]);
    const Total = total[0].total

      const data = await Address.findOne({userId:req.session.user_id})
      console.log(data);
      const Wallet = await User.findOne({_id:req.session.user_id})

      if(data===null){
        const adress = new Address({
          userId:req.session.user_id,
          addAddress:[]
        })
        res.redirect('/addAddress')

      }else{
        if(data.addresses.length > 0 && data!=null ){
          res.render('checkOutpage', { data, Total,Wallet})
        }
        else{
          res.redirect('/addAddress')
        }
      }
     
    

  } catch (error) {
    console.log(error.message);
  }
}
const successPage = async (req, res) => {
try {

    const Id = req.session.orderid
    console.log(Id);
    const orderData = await Order.findById({_id:Id}).populate('products.productId' )  
    console.log(orderData);
     const user= false
    res.render('successPage',{orderData,user})
} catch (error) {
    console.log(error.message)
}

}

const loadOrder = async (req, res) => {

  try {
    const page = Number(req.query.page) || 1
        const limit = 15
        const skip = (page - 1) * limit
const sortOrder='asc'
    const userName = await User.findOne({ _id: req.session.user_id })
    const orderData = await Order.find({ userId: req.session.user_id }).populate('products.productId', 'deliveryAddress').sort({date:-1}).skip(skip).limit(limit)
    const orderCount = await Order.find({ userId: req.session.user_id }).count()
    const totalPage = Math.ceil(orderCount / limit)
    console.log(orderData)
 

    if (req.session.user_id) {
      res.render('order', { userName, orderData: orderData ,totalPage,page})
    }
    else {
      res.redirect('/')
    }
  } catch (error) {
    console.log(error.message);
  }
}

const placeOrder = async (req, res) => {
  try {
  
    const userName = await User.findOne({ _id: req.session.user_id });
    const total = await Cart.aggregate([
      {
        $match: { user: userName.name }
      },
      {
        $unwind: '$products'
      },
      {
        $project: {
          productPrice: '$products.productPrice',
          count: '$products.count'
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: ['$productPrice', '$count']
            }
          }
        }
      }
    ]);
    const Total = total[0].total; 
    const address = req.body.address;
    const paymentMethod = req.body.payment;
    const cartData = await Cart.findOne({ userName: req.session.user_id });
    const products = cartData.products;
    const totalPrice = req.body.amount
    const discount = parseInt(req.body.discount);
    const wallet = totalPrice - Total - discount;
    const status = paymentMethod === "COD" ? "placed" : "pending";
    
    const order = new Order({
      deliveryAddress: address,
      userId: req.session.user_id,
      userName: userName.name,
      paymentMethod: paymentMethod,
      products: products,
      totalAmount:totalPrice,
      Amount: Total,
      date: new Date(),
      status: status,
      orderWallet: wallet
    })
    const orderData = await order.save();
    const date = orderData.date.toISOString().substring(5, 7);
    const orderId = orderData._id;
    req.session.orderid=orderId
    if (orderData) {
      for (let i = 0; i < products.length; i++) {
        const pro = products[i].productId;
        const count = products[i].count;
        await Product.findByIdAndUpdate({ _id: pro }, { $inc: { stockQuantity: -count } });
      }
      
      if (status === "placed") {
        const wal = totalPrice - Total;
        await Order.updateOne({ _id: orderId }, { $set: { month: date } });
        await User.updateOne({ _id: req.session.user_id }, { $inc: { wallet: -wal } });
        await Cart.deleteOne({ userName: req.session.user_id });
        res.json({ codSuccess: true });
      }else if(paymentMethod === 'wallet'){
        console.log(1);
        const userData = await User.findOne({_id:req.session.user_id})
        console.log(userData);
                    if (userData.wallet >= totalPrice) {
                      console.log(2);
                        const cartData = await Cart.findOne({ userName: req.session.user_id });
                         const cartproduct = cartData.products
                        for(let i = 0; i<cartproduct.length; i++){
                            const productStock = await Product.findById(cartproduct[i].productId)
                               productStock.quantity -= cartproduct[i].stockQuantity
                            await productStock.save()

                        }
                        const orderamount = await Order.findOne({userId: req.session.user_id})
                        console.log(orderamount,'oooojooi');
                        const walletBalence = userData.wallet - orderamount.totalAmount;
                        await User.updateOne({_id:req.session.user_id},{$set:{cart:[],cartTotalPrice:0, wallet:walletBalence}})
                        await Order.updateOne({_id:orderId},{$set:{paymentMethod:'wallet',status:'placed'}})
                        await Cart.deleteOne({ userName: req.session.user_id });
                        const wallet = User.wallet;
                        res.json({ codSuccess: true });
                    } else {
                      res.json({ success: true });
                    }
      } else  {
        await Order.updateOne({ _id: orderId }, { $set: { month: date } });
        const totalAmount = orderData.totalAmount;
        var options = {
          amount: totalAmount * 100,
          currency: "INR",
          receipt: "" + orderId
        };

        instance.orders.create(options, function (err, order) {
          res.json({ order });
      })
      }
    } else {
  
      res.redirect('/checkOutpage');
    }
  } catch (error) {
    console.log(error.message);
  }
}

const verifyPayment = async (req, res) => {
  try {  
    const totalPrice = req.body.amount2;
    const total = req.body.amount;
    const wal = totalPrice - total;
    const details = req.body
    console.log(details,"hiii saifuuuu");
    const crypto = require('crypto');
    let hmac = crypto.createHmac('sha256', 'tU94AbwfSqled8YbyXi2upP2');
    hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
    hmac = hmac.digest('hex');
    if (hmac == details.payment.razorpay_signature) {
      await Cart.deleteOne({ userName: req.session.user_id });
      await Order.findByIdAndUpdate({ _id: details.order.receipt }, { $set: { status: "placed" } });
      await Order.findByIdAndUpdate({ _id: details.order.receipt }, { $set: { paymentId: details.payment.razorpay_payment_id } });
      console.log('hiii');
      // await User.updateOne({_id:req.session.user_id},{$inc:{wallet:-wal}});

     
      res.json({ success: true });
    } else {
      await Order.findByIdAndRemove({ _id: details.order.receipt });
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
}

// cancel the product

const cancelOrder = async (req,res)=>{
  try{
      const user = req.session.user_id;
      const orderid = req.body.ids;
      const orderData = await Order.findOne({_id:orderid});
      const userData = await User.findOne({_id:user});
      const userWallet = userData.wallet;
      if(orderData.status == "placed" || orderData.status == "Delivered"){
          if(orderData.paymentMethod == "onlinePayment"){
              const totalWallet = orderData.totalAmount+userWallet
              await User.updateOne({_id:req.session.user_id},{$set:{wallet:totalWallet}});
              await Order.findByIdAndUpdate({_id:orderid},{$set:{status:"Cancelled"}});
              res.json({success:true})
             }else{
              const totalWallet = userWallet+orderData.OrderWallet;
              await Order.findByIdAndUpdate({_id:orderid},{$set:{status:"Cancelled"}});
              await User.updateOne({_id:req.session.user_id},{$set:{wallet:totalWallet}});
              res.json({success:true});
             }
      }else{
          await Order.findByIdAndUpdate({_id:orderid},{$set:{status:"Cancelled"}});
          res.json({success:true});
      }
  }catch(error){
      console.log(error.message);
  }
}

//viewing order of the products

const vieworderProducts = async (req, res) => {

    try {
      const orderid = req.query.id
      const orderData = await Order.findOne({ _id: orderid }).populate('products.productId')
      console.log(orderData,'saifu');
      res.render('showOrderProduct', { orderData })
    } catch (error) {
      console.log(error.message);
    }
}

// admin order list

const adminOrder = async(req,res)=>{
  try {
    const page = Number(req.query.page) || 1
        const limit = 15
        const skip = (page - 1) * limit
        
    orderDetails = await Order.find({}).skip(skip).limit(limit)
    orderCount= await Order.find().count()
    const totalPage = Math.ceil(orderCount / limit)
      res.render('orders',{orderDetails,totalPage,page})
  } catch (error) {
      console.log(error.message);
  }
}

//admin side viewing product

const productList = async(req,res)=>{

  try {
    const orderid = req.query.id
    const orderDetails = await Order.findOne({_id:orderid}).populate('products.productId')
    res.render('orderDetails',{orderDetails})
  } catch (error) {
    console.log(error.message);
  }
}

//change status

const changeStatus = async(req,res)=>{
  try {
    const orderid = req.query.id
    const orderDetails = await Order.findOne({_id:orderid})
    res.render('editOrder',{orderDetails})
  } catch (error) {
    console.log(error.message);
  }
}

const saveEditOrder = async(req,res)=>{
  try {
   const orderid = req.query.id;
   const status = req.body.status
   const update = await Order.updateOne({_id:orderid},{$set:{status:status}});
    if(update){
      res.redirect('/admin/orders')
    }
    else{
      res.render('editOrder',{message:"Status Not Updated"});
    }
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  loadCheckout,
  successPage,
  loadOrder,
  placeOrder,
  cancelOrder,
  vieworderProducts,
  verifyPayment,
  adminOrder,
  productList,
  changeStatus,
  saveEditOrder,
}