const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,"username is required"],
        trim:true,
        unique:true
    },
    wallet:{
        type:String,
        required:true,
        trim:true,
        default:0
    },
    email:{
        type:String,
        required:[true,"email is required"],
        trim:true,
        unique:[true,"email already exits"]
    },
    password:{
        type:String,
        required:[true,"password is required"],
        trim:true,
        minlength:[8,"password must not less than 8 characters"]
    },
    confirmPassword:{
        type:String,
        required:[true,"confirm password is required"],
        trim:true,
        minlength:[8,"confirm password must not less than 8 characters"],
        validate:{
            validator: function (val){
                return val === this.password
            },
            message: "Password mismatch"
        }
    },
    passwordChangedAt:Date,
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

UserSchema.pre('save', async function(next){
    //check if modified 
    if(!this.isModified("password")) {        
        return next()
    }
    
    //encrypt password 
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt)
    this.confirmPassword = undefined
    next()

})

UserSchema.methods.changePasswordAfter = function(jwtTime){
   if(this.passwordChangedAt){
       const passwordTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000,10)    
       return jwtTime < passwordTimeStamp
   }
   return false    
}

module.exports = User = mongoose.model('user',UserSchema)