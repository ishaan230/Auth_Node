//jshint esversion:6
const express = require('express')
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
require('dotenv').config()

// const { title } = require('process')
// const { error } = require('console')
// const encrypt = require('mongoose-encryption')
// const bcrypt = require('bcrypt')
// const saltRounds = 12

mongoose.connect("mongodb://localhost:27017/userDB")

//creating schema
const userSchema = new mongoose.Schema({
    username:String,
    password:String,
    secret:String
})

//passport local mongoose pllugin for db schema
userSchema.plugin(passportLocalMongoose)

// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:['password']})


//creating model
const User = new mongoose.model("User",userSchema)

//using passport
passport.use(User.createStrategy())

//for cookies
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app = express()

app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))


//init session
app.use(session({
    secret: "SecretHere",
    resave: false,
    saveUninitialized: false
}))

//init session and passport
app.use(passport.initialize())
app.use(passport.session())



app.get("/login",function(req,res){
    res.render("login")
})
app.get("/register",function(req,res){
    res.render("register")
})
app.get("/",function(req,res){
    if(req.isAuthenticated()){
        res.redirect("secret")
    }else{
        res.render("home")
    }

})

app.post("/submit",function(req,res){
    var secretText = req.body.secret
    console.log(secretText)
    console.log(req.user)
    User.findById(req.user._id).then((foundUser)=>{
        foundUser.secret = secretText
        foundUser.save()
        res.redirect('/secret')
        // console.log(foundUser)
    })
})

app.get("/secret",function(req,res){
    User.find({secret: {$ne:null}}).then((foundUser,err) => {
        if(err){
            console.log(err)
        }else{
            res.render("secrets",{userswithSecret:foundUser})
            console.log("done")
        }
})
})


app.get("/submit",function(req,res){
    if(req.isAuthenticated()){
        res.render("submit")
    }else{
        res.render("home")
    }
})


app.post("/register",function(req,res){
    User.register({username: req.body.username},req.body.password,function(err,user){
      if(err){
        console.log(err)
        res.redirect("/register")
      }else{
        passport.authenticate("local")(req,res,function(){
            res.redirect("/secret")
        })
      }  
    })
})

app.post

app.get("/secret",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets")
    }else{
        res.redirect("login")
    }
})


app.post("/login",function(req,res){

    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user,function(err){
        if(err){
            console.log(err)
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secret")
            })
        }
    })

})

app.get("/logout",function(req,res){
    req.logout(function(err){
        if(err){
            console.log(err)
        }else{
            res.redirect("/")
        }
    })
})

app.listen(3000,function(){
    console.log('Server started!')
})