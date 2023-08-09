const category = require('../models/categoryModel');
const product = require('../models/productModel')
const uc = require('upper-case');


//listing the category

const categoryList = async(req,res)=>{
    try {
        const catData = await category.find({})
        res.render('category',{category:catData})
    } catch (error) {
        console.log(error.message);
    }
}

//get addcategory

const addCategory = async(req,res)=>{
    try {
        res.render('addCategory')
    } catch (error) {
        console.log(error.message);
    }
}

//add category

const insertCategory = async(req,res)=>{
    try {
     
        if(req.session.user_id){
           
        const catName = uc.upperCase(req.body.categoryName);
        const categorys = new category({
            categoryName:catName
        })

        if(catName.trim().length == 0){
            
            res.render('addCategory',{message:'invalid typing'});
        }
        else{
            const catData = await category.findOne({categoryName:catName});

            if(catData){
                res.render('addCategory',{message:'This category is already exist'})
            }
            else{
                const categoryData = await categorys.save();
                if(categoryData){
                    res.redirect('/admin/category')
                }
                else{
                    res.redirect('/admin/home')
                }
            }
        }
    }
        else{
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message);
    }
}
const editCategory = async(req,res)=>{
    try {
        const orderid = req.query.id;
        res.render('editCategory')
    } catch (error) {
        console.log(error.message);
    }
}
//saveEditCategory 

const saveCategory = async(req,res)=>{

    try {
        const orderid = req.query.id
        const Category = req.body.categoryName
        console.log(category);
        const update = await category.updateOne({_id:orderid},{$set:{categoryName:Category}})
        
        if(update){
            res.redirect('/admin/category')
        }
        else{
            res.render('editCategory',{message:'category not updated'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    categoryList,
    addCategory,
    insertCategory,
    editCategory,
    saveCategory
}