const AppError = require("../util/appError")
const handleCastErrorDb = err => {
    return new AppError(`invalid ${err.path}: ${err.value}.`,400)
}

module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || "error"

   
    if(err.name == "CastError") err = handleCastErrorDb(err)
    if(err.name === "ValidationError") {
        const validationType = err.message.split(":")[0]
        const errMessage = err.message.replace(`${validationType}: `)
        
        const msg = errMessage.split(",").map(msg => {
            return msg.split(": ")[1]
        });
        err.message = msg
    }

    if(err.isOperational){
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message
        })

    }else{
        res.status(500).json({
            status:err.status,
            message:err.message
            // status:"error",
            // message:"Something went wrong"
        }) 
    }
    
}