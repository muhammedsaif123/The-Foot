const product = require ('../models/productModel');
const category = require ('../models/categoryModel')
const User   = require('../models/userModel')

//get addproduct page

const addProduct = async(req,res)=>{
    const catData = await category.find({});
    try {
        res.render('addProduct',{cat:catData})
    }
    catch(error){
        console.log(error.message);
    }
}

//add product
const insertProduct = async(req,res)=>{

    try {
        const image = [];
        for(i=0;i<req.files.length;i++){
            image[i] = req.files[i].filename;
        }

        const new_product = new product({
            productName : req.body.product,
            image : image,
            price : req.body.price,
            stockQuantity : req.body.stockQuantity,
            category : req.body.category,
            description : req.body.description
        })
        const productData = await new_product.save();
        
        if(productData){
            res.render('addProduct',{message:'Product added successfully',})
        }
        else{
            res.render('addProduct',{error:'Failed adding Product'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

//product list
const productListing = async(req,res)=>{

    try {
        const page = Number(req.query.page) || 1
        const limit = 15
        const skip = (page - 1) * limit

        const productData = await product.find({}).skip(skip).limit(limit)
        productCount= await product.find().count()
        const totalPage = Math.ceil(productCount / limit)
        res.render('productList',{product:productData,totalPage,page});


    } catch (error) {
       console.log(error.message); 
    }
}

// edit product
const editProduct = async(req,res)=>{

    try {
        const id = req.query.id
        const proData = await product.findById({_id:id})
        const catData = await category.find({});
        if(proData){
            res.render('editProduct',{product:proData,cat:catData})
        }
        else{
            res.redirect('/admin/home')
        }
    } catch (error) {
        console.log(error.message);
    }
}

//update and save product

const saveProduct = async(req,res)=>{

    try {   

       if(req.session.user_id){
        const productData = await product.findOne({_id:req.query.id});
        if(req.body.product.trim().length == 0 || req.body.price.trim().length == 0 || req.body.stockQuantity.trim().length == 0){
            res.render('editProduct',{message:'Enter valid text',product:productData})
        }
        else{
            console.log('risvan')
            const productData = await product.findByIdAndUpdate({_id:req.query.id},{$set:{productName : req.body.product,price : req.body.price,stockQuantity : req.body.stockQuantity,category : req.body.category,description : req.body.description}})
            for(let i=0;i<req.files.length;i++){
                const imageUpdate = await product.findByIdAndUpdate({_id : req.query.id},{$push:{image:req.files[i].filename}})
            }
            if(productData || imageUpdate){
                res.redirect('/admin/productList')
            }
            else{
                res.render('editProduct',{message:'Product edit failed'})
            }
        }
       }
    } catch (error) {
        console.log(error.message);
    }
}
const list = async(req,res)=>{

    try {
        const delproduct = req.body.id
         await product.findByIdAndUpdate({_id:delproduct},{$set:{is_List : true}})
        res.json({is_List : true})
        
    } catch (error) {
        console.log(error.message);
    }
}
const unList = async(req,res)=>{

    try {
        const delproduct = req.body.id
        await product.findByIdAndUpdate({_id:delproduct},{$set:{is_List : false}})
        res.json({is_List : true})
    } catch (error) {
        console.log(error.message);
    }
}
const removeImg = async (req,res)=>{
    try{
        const id = req.body.id;
        const pos = req.body.pos;
        const dleImg = await product.findById({_id:id});
        console.log(dleImg);
        const image = dleImg.image[pos];
        const updateImage = await product.findByIdAndUpdate({_id:id},{$pullAll:{image:[image]}});
        if(updateImage){
            res.json({success:true});
        }else{
            res.redirect('/admin/dashboard');
        }
    }catch(error){
        console.log(error.message);
    }
}

const filterMen = async(req,res)=>{
    try {
        const id = req.query.id
        const products = await product.find({category:id})
        res.render('Shop', {product: products});
    } catch (error) {
        console.log(error.message);
    }
}

const filterWomen = async(req,res)=>{
    try {
        const id = req.query.id
        const products = await product.find({category:id})
        res.render('Shop', {product: products});
    } catch (error) {
        console.log(error.message);
    }
}
const priceFilter = async(req,res)=>{
    try {
        const first = req.query.first
        const second = req.query.second
        if(first && second){
            console.log('hii');
            const products = await product.find({ $and: [{ is_List: false ,price: { $gte: first, $lte: second } }] });
             console.log(products);
        res.render('Shop', { product:products});
        }else{
            const products = await product.find({ $and: [{ is_List: false }, { price: { $gte: first} }] });
            res.render('Shop', { product:products});
        }
    } catch (error) {
        console.log(error.message);
    }
}
const searchproduct = async (req, res) => {
    try {
      let categoryData = await category.find();
      let userName = await User.findOne({ _id: req.session.user_id });
      let search = req.body.search;
      
      let productData = await product.find({
        productName: { $regex: search, $options: "i" },
      });

      let filter = "default";
      console.log(productData.length);
      
      res.render("Shop", { categoryData, userName, product: productData, filter });
    } catch (error) {
      console.log(error.message);
    }
};

module.exports = {
    addProduct,
    insertProduct,
    productListing,
    editProduct,
    saveProduct,
    list,
    unList,
    removeImg,
    filterMen,
    filterWomen,
    priceFilter,
    searchproduct
}