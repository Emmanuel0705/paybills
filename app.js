const express  = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const AppError = require("./util/appError")
const globalError = require("./controllers/errorController")
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

app.use(express.json({extended:false}))
app.use(fileUpload())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "client/build")))
app.get("*",function(req,res){
    res.sendFile(path.join(__dirname,'client/build','index.html'))
})
app.use(cors())
app.get('/',(req,res) => (res.send("APP IS RUNNING")));
app.use('/api/user', require("./routes/api/user"))
app.use('/api/transaction', require("./routes/api/transaction"))
app.all("*", (req,res,next) => {
    const err = new AppError(`Cant find ${req.originalUrl} on this server`,404)
    next(err)
})
app.use(globalError)

module.exports = app