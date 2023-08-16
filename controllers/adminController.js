const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const Order = require('../models/orderModel')
const adminlogin = async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}
const  verifyLogin = async(req,res)=>{
    try {
        const email = req.body.emailAdress;
        const password = req.body.password

        const userData = await User.findOne({email:email})
        if(userData){
         

            const passwordMatch = await bcrypt.compare(password,userData.password)

            if(passwordMatch){ 

                if(userData.is_admin === 0){
              

                    res.render('login',{message:'Email and password is incorrect'});
                }
                else{
                    
                    req.session.admin_id= userData._id;
                    res.redirect('/admin/home')
                }
            }
            else{
                res.render('login',{message:'Email and password is incorrect'});
            }
        }
        else{
            res.render('login',{message:'Please enter Email and password '});
        }
    } catch (error) {
        console.log(error.message);
    }
}
const loadDashboard = async(req,res)=>{

    try {
        
        const users = await User.find({}).count()
        const online = await Order.find({ paymentMethod: 'onlinePayment' }).count()
        console.log(online,'hiii');
        // console.log(online);
        const ord = await Order.find().populate( 'products.productId','category'  )
        console.log(ord,"saifu");
        const categoryCount = {};

        const totalales = await Order.find({ status: "delivered" })
        console.log(totalales,'hiiii');
        let sum = 0
        for (let i = 0; i < totalales.length; i++) {
            sum = sum + totalales[i].totalAmount
        }
        const salescount = await Order.find({ status: "delivered" }).count()
console.log(salescount,'aywaaa');
        const cod = await Order.find({ paymentMethod: "COD", status:'delivered'  })
       console.log(cod,'koooi');
        let cod_sum = 0
        for (var i = 0; i < cod.length; i++) {
            cod_sum = cod_sum + cod[i].totalAmount
        }
console.log(cod_sum);
        const upi = await Order.find({ paymentMethod: 'onlinePayment',status: "delivered" })
        console.log(upi,'maaaaamaaaaaa');
        // console.log(upi,"upi value");

        let upi_sum = 0
        for (var i = 0; i < upi.length; i++) {
            upi_sum = upi_sum + upi[i].totalAmount
        }
      console.log(upi_sum);
        const wallet = await Order.find({ paymentMethod: "wallet", status: "delivered" })
console.log(wallet,"kutyeeeee");
        let wallet_sum = 0

        for (var i = 0; i < wallet.length; i++) {
            wallet_sum = wallet_sum + wallet[i].totalAmount
        }
   console.log(wallet_sum,'koooman');
        const methodtotal = cod_sum + upi_sum + wallet_sum
        console.log(methodtotal,'vettaveliyan');
        const upi_percentage = upi_sum / methodtotal * 100
        const wallet_percentage = wallet_sum / methodtotal * 100
        const cod_percentage = cod_sum / methodtotal * 100


        
        const deliveryCount = await Order.find({ status: "delivered" }).count()
        console.log(deliveryCount,'machan');
        const confirmedCount = await Order.find({ status: "placed" }).count()
        console.log(confirmedCount,'muthmaniii');
        const cancelledCount = await Order.find({ status: "Cancelled" }).count()
        console.log(cancelledCount,'mandan');
        const returnedCount = await Order.find({ status: "Returned" }).count()
        console.log(returnedCount,'pottan');


        const salesChart = await Order.aggregate([

            {
                $match: { status: "delivered" } // Add $match stage to filter by status
            },
            {

                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },

                    sales: { $sum: '$totalAmount' },
                },
            },
            {
                $sort: { _id: -1 },
            },
            {
                $limit: 10,
            },
        ]);

        console.log('salesChart',salesChart);

        const dates = salesChart.map((item) => {
            return item._id;
        })

        const sale = salesChart.map((item) => {
            return item.sales;
        });


        const salesr = sale.map((x) => {
            return x
        })

        const date = dates.reverse()

        const sales = salesr.reverse()


        res.render('home', {
            userCount: users,
            deliveryCount,
            cancelledCount,
            returnedCount,
            confirmedCount,
            sum, cod_sum, upi_sum, wallet_sum,
            salescount,
            upi_percentage,
            cod_percentage,
            wallet_percentage,
            sales,
            date,
            methodtotal

           
        })
    } catch (error) {

        console.log(error.message);
    }
}

const logout = async(req,res)=>{
    try {
        console.log(req.session.admin_id+"sesssion");
        req.session.admin_id = false;
       
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}
const adminDashboard = async(req,res)=>{
    try {
        const usersData = await User.find({is_admin:0})
        res.render('home',{users:usersData})
    } catch (error) {
        console.log(error.message);
    }
}
   
const UserList = async(req,res)=>{
    try {
        const page = Number(req.query.page) || 1
        const limit = 15
        const skip = (page - 1) * limit

        const users = await User.find({is_admin:0}).skip(skip).limit(limit)
        const usersCount = await User.find({is_admin:0}).count()
        const totalPage = Math.ceil(usersCount / limit)
        res.render('userList',{users,totalPage,page})
    } catch (error) {
        console.log(error.message);
    }
}
//blocking the user

//User block

const block = async(req,res)=>{
    try{
        const userdata = await User.findByIdAndUpdate({_id:req.body.id},{$set:{is_blocked:true}})
        req.session.user_id = false;
        res.json({is_blocked: true })
    }
    
    catch(error){
        console.log(error.message);
    }
}

 //unblocking the user
const unblock = async(req,res)=>{
    try{
        const userdata = await User.findByIdAndUpdate({_id:req.body.id},{$set:{is_blocked:false}})
        res.json({is_blocked:false })
    }
    catch(error){
        console.log(error.message);
    }
}
const salesReport = async(req,res)=>{
    try {
        const salesReport = await Order.find({status:'delivered'}).sort({date:-1})
        res.render('salesReport',{salesReport})
    } catch (error) {
        console.log(error.message);
    }
}
const loadSalesReport = async (req, res) => {
    try {
        console.log('hiii');
        const startDate = req.body.startDate // Convert to Date object
        console.log(startDate);
        const endDate = req.body.endDate // Convert to Date object
        endDate.setDate(endDate.getDate() + 1); // Include the end date itself
        console.log(endDate);
            if(startDate >= endDate){
    const salesReport = await Order.find({
        status: 'delivered',
        date: {
            $gte: startDate,
            $lte: endDate
        }
    });

    console.log(salesReport);

    if (salesReport.length > 0) {
        res.render('salesReport', { salesReport });
    } else {
        res.render('noSalesReport'); // Handle case where no sales report is found
    }
}
        
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    loadSalesReport
};


module.exports = {
    loadSalesReport
};


module.exports = {
    adminlogin,
    verifyLogin,
    loadDashboard,
    logout,
    adminDashboard,
    UserList,
    block,
    unblock,
    salesReport,
    loadSalesReport
}