const User = require('../models/userModel')
const Address = require('../models/addressModel')


const addAddress = async(req,res)=>{

    try {
       const userName = await User.findOne({_id:req.session.user_id})
       if(req.session.user_id){
        let customer = true
        res.render('addAddress',{customer,userName});
       }
       else{
        res.redirect('/')
       } 
    } catch (error) {
        console.log(error.message);
    }
}

const insertAddress = async(req,res)=>{

    try {
        const userData = await User.findOne({_id:req.session.user_id});
        const addressDetails = await Address.findOne({userId:req.session.user_id})
        if(addressDetails){
           
            const updateOne = await Address.findOneAndUpdate({userId:req.session.user_id},{$push:{addresses:{userName:req.body.userName,
            mobile : req.body.mobile,
            alternativeMob:req.body.alterMobile,
            address : req.body.address,
            city:req.body.city,
            pincode:req.body.pincode,
             }}})

            if(updateOne){
                res.redirect('/checkOutpage')
            }
            else{
                res.redirect('/checkOutpage')
            }
        }
        else{
            const address = new Address({
                userId:req.session.user_id,
                addresses:[{
                    userName:req.body.userName,
                    mobile:req.body.mobile,
                    alternativeMob:222,
                    address:req.body.address,
                    city:req.body.city,
                   
                    pincode:req.body.pincode,
                   
                }]
            });
            const addressData = await address.save();
            if(addressData){
                console.log(hoiii);
                res.redirect('/checkOutpage')
            }
            else{
                res.redirect('/checkOutpage')
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}
const insertAddressInProfile = async(req,res)=>{

    try {
        const userData = await User.findOne({_id:req.session.user_id});
        const addressDetails = await Address.findOne({userId:req.session.user_id})
        if(addressDetails){
           
            const updateOne = await Address.findOneAndUpdate({userId:req.session.user_id},{$push:{addresses:{userName:req.body.userName,
            mobile : req.body.mobile,
            alternativeMob:req.body.alterMobile,
            address : req.body.address,
            city:req.body.city,
            pincode:req.body.pincode,
             }}})

            if(updateOne){
                res.redirect('/profile')
            }
            else{
                res.redirect('/profile')
            }
        }
        else{
            const address = new Address({
                userId:req.session.user_id,
                addresses:[{
                    userName:req.body.userName,
                    mobile:req.body.mobile,
                    alternativeMob:222,
                    address:req.body.address,
                    city:req.body.city,
                   
                    pincode:req.body.pincode,
                   
                }]
            });
            const addressData = await address.save();
            if(addressData){
                res.redirect('/profile')
            }
            else{
                res.redirect('/profile')
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const addAddressInProfile = async(req,res)=>{
    
        try {
            const userName = await User.findOne({_id:req.session.user_id})
            if(req.session.user_id){
             let customer = true
             res.render('addAddress',{customer,userName});
            }
            else{
             res.redirect('/')
            } 
          
    } catch (error) {
        console.log(error.messag);
    }
}

const removeAddress = async(req,res)=>{

    try {
        console.log(req.query.id);
        
        await Address.updateOne(
            { userId: req.session.user_id },
            {
              $pull: {
                addresses: { _id: req.query.id }
              }
            }
          );
          
        res.redirect('/checkOutpage')
    } catch (error) {
        console.log(error.message);
    }
}

const removeAddressInProfile = async(req,res)=>{

    try {
        console.log(req.query.id);
        
        await Address.updateOne(
            { userId: req.session.user_id },
            {
              $pull: {
                addresses: { _id: req.query.id }
              }
            }
          );
        res.redirect('/profile')
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    addAddress,
    insertAddress,
    removeAddress,
    insertAddressInProfile,
    addAddressInProfile,
    removeAddressInProfile
}