const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const jwt=require("jsonwebtoken");
const jwtSecret="asd889asdas5656asdas887";
const nodemailer=require('nodemailer');
const transporter=nodemailer.createTransport({
    service:'gmail',
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: "tarkarsiddharth@gmail.com",
        pass: "sidd@1234"
    }
})
// const fs=require('fs')
//dbconnection 
const db = "mongodb://localhost:27017/pizza";
const connectDB = async () => {
    try {
        await mongoose.connect(db, { useNewUrlParser: true });
        console.log("MongoDB connected")
    }
    catch (err) {
        console.log(err.message);
    }
}
connectDB();
//end
const displaymodel = require('../db/displaySchema')
const ordersmodel = require('../db/OrdersSchema')
const registermodel= require('../db/RegisterSchema')

function autenticateToken(req,res,next){
    const authHeader=req.headers['authorization'];
    const token=authHeader && authHeader.split(' ')[1];
    console.log(token)
    if(token==null){
        res.json({"err":1,"msg":"Token not match"})
    }
    else {
        jwt.verify(token,jwtSecret,(err,data)=>{
            if(err){
                res.json({"err":1,"msg":"Token incorrect"})
            }
            else {
                console.log("Match")
                next();
            }
        })
    }
}
router.get("/fetchpost",autenticateToken, (req, res) => {
    displaymodel.find({}, (err, data) => {
        if (err) throw err;
        res.json({ "err":0,'data': data })
    })

})


router.post("/adduser",(req,res)=>{
    
    let ins = new registermodel({ name: req.body.name, mobile: req.body.mobile,email:req.body.email,password:req.body.password });
    ins.save((err) => {
        if (err) {
            console.log(err)
            res.send("Already Added")
        }
        else {
            res.send("ok")
        }
    })
})
router.get("/verify",(req,res)=>{
    registermodel.find({}, (err, data) => {
        if (err) throw err;
        res.json({ 'data': data })
    })
    
})


router.get("/fetchorders", (req, res) => {
    ordersmodel.find({}, (err, data) => {
        if (err) throw err;
        res.json({ 'data': data })
    })

})
router.post("/addorder", (req, res) => {
    
    console.log(req.body.cart)
    let name = [];
    let price=0;
    for (let i = 0; i < req.body.cart.length; i++) {
             price=price+req.body.cart[i].price;
        if (i != (req.body.cart.length - 1)) {
            name.push(req.body.cart[i].name + ",")
            

        }
        else if (i = (req.body.cart.length - 1)) {
            name.push(req.body.cart[i].name)
           
        }



    }
    let ins = new ordersmodel({ name: name, card: req.body.card,price:price,user:req.body.user });
    ins.save((err) => {
        if (err) {
            console.log(err)
            res.send("Already Added")
        }
        else {
            console.log(req.body,"nodii")

            transporter.sendMail({
                from: 'tarkarsiddharth@gmail.com',
                to: req.body.user,
                subject: "order Confirmation",
              
                html:`<h1>Your Order has been confirmed!!Thank you!!</h1>`
            },(error,res)=>{
                if(error){console.log(error)}else{console.log("mail sent",res)}
            })
            res.send("ok")
        }
    })
 


})
router.post("/login",(req,res)=>{
    let email=req.body.email;
    let password=req.body.password;
    registermodel.findOne({email:email,password:password},(err,data)=>{
        if(err){
            res.json({"err":1,"msg":"Email or password is not correct"})
        }
        else if(data==null)
        {
            res.json({"err":1,"msg":"Email or password is not correct"})
        }
        else {
            let payload={
                uid:email
            }
            const token=jwt.sign(payload,jwtSecret,{expiresIn:360000})
            res.json({"err":0,"msg":"Login Success","token":token})
        }
    })
})


module.exports = router;