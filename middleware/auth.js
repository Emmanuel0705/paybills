const jwt = require("jsonwebtoken");
const AppError = require("../util/appError")
const catchAsync = require("../util/catchAsync")
const {promisify} = require("util")
const User = require("../model/User")


module.exports =  catchAsync(async (req,res,next) => {
    
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1]
    }
    //check if token found
    if(!token){
        return next(new AppError("no token found",401))
    }
    
    //check if token is valid
    const decode = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
    const currentUser = await User.findById(decode.id)
   
    //check if user with this token still exist
    if(!currentUser){
        return next(new AppError("This user is no longer exist",404))
    }
    //check if this user has'nt change password
    if(currentUser.changePasswordAfter(decode.iat)){
        return next(new AppError("You recently changed your password, pls re-login to continue",404))
    }
    req.user = currentUser
    next()    
})