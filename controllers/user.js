const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {validationResult} = require("express-validator")
const catchAsync = require("../util/catchAsync")
const AppError = require("../util/appError")
const User = require("../model/User")

// jwt signin function
const jwtSign = id => {
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXP})
}

//filter req object
const filterObj = (obj, ...allowFields) => {
    const newObj = {}
     Object.keys(obj).forEach(el => {
        if(allowFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj
}

//description => Login
exports.getUser  = catchAsync(async (req,res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);   
})
exports.test = catchAsync(async (req,res) => {
 
     //create cookie options
     const cookieOptions = {
         expires: new Date(Date.now() + process.env.JWT_COOKIE_EXP * 24 * 60 * 60 * 1000),
         httpOnly:true,
         secure:false
     }
     
     //set cookie to https in production
     // if(process.env.NODE_ENV === "production") cookieOptions.secure = true

     // jwt
     const token = "1234hhhhh"
     console.log(res.cookie("jwt",token,cookieOptions))
 
     //send jwt as cookie
     res.cookie("jwt",token,cookieOptions).send({token})
            
 })

//description => Login
exports.loginUser = catchAsync(async (req,res) => {
   const errors = validationResult(req);
   if(!errors.isEmpty()){
       return res.status(400).json({errors:errors.array()})
   }
    const {password,email} = req.body  
    let user = await User.findOne({email});
    if(!user){
        return res.json({status:"error",message:"Invalid Login Details"})
    }
       //decrypt password 
    const isValid = await bcrypt.compare(password,user.password)
    if(!isValid){
        return res.json({status:"error",message:"Invalid Login Details"})
    }
    //create cookie options
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXP * 24 * 60 * 60 * 1000),
        httpOnly:true,
        secure:false
    }
    
    //set cookie to https in production
    // if(process.env.NODE_ENV === "production") cookieOptions.secure = true
    
    // jwt
    const token = jwtSign(user.id)
    //send jwt as cookie
    res.cookie("jwt",token,cookieOptions).send({token})
           
})

exports.registerUser = catchAsync(async (req,res,next) => {
    const {username,email} = req.body;

    //check if username already exits
    let user = await User.findOne({username});
    if(user) return res.json({status:"error",message:"Username has already been taken by another user"})

    //check if username already exits
     user = await User.findOne({email});    
    if(user){
      return res.json({status:"error",message:"User with this email already exits"})
    }
    const Obj = filterObj(req.body, "username","email","password","confirmPassword")
    user = new User(Obj)
    await user.save();

    // jwt
    const token = jwtSign(user.id)

    //create cookie options
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXP * 24 * 60 * 60 * 1000),
        httpOnly:true,
        secure:false
    }
    
    //set cookie to https in production
    // if(process.env.NODE_ENV === "production") cookieOptions.secure = true

    //send jwt as cookie
    res.cookie("jwt",token,cookieOptions)
    return res.json({token})
})
exports.allUsers = catchAsync(async (req,res,next) => {
  
    let user = await User.find();
   
    res.json(user)
})