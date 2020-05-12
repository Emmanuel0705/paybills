
const {validationResult} = require("express-validator")
const catchAsync = require("../util/catchAsync")
const AppError = require("../util/appError")
const User = require("../model/User")
const axios = require("axios");
const cryto = require("crypto")
const paystack = require("../paystack")
const Transaction = require('../model/Transaction')

//filter req object
const filterObj = (obj, ...allowFields) => {
    const newObj = {}
     Object.keys(obj).forEach(el => {
        if(allowFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj
}
exports.dataBundles = catchAsync(async (req,res,next) => {
  
  const val = await axios(`https://www.nellobytesystems.com/APIDatabundlePlansV1.asp`)

  res.json(val.data)
   
})
exports.buyAirtime = catchAsync(async (req,res,next) => {
  const order_id = cryto.randomBytes(12).toString("hex")
  const {phone,amount,network} = req.body
  if(!phone || !amount || !network){
    return res.json({status:"fail",message:"Incorrect Details"})
  }
  const val = await axios(`https://www.nellobytesystems.com/APIAirtimeV1.asp?UserID=${process.env
  .USER_ID}&APIKey=${process.env
    .API_KEY}&MobileNetwork=${network}&Amount=${amount}&MobileNumber=${phone}&orderID=${order_id}`)

  res.json(val.data)
   
})
exports.fundWallet = catchAsync(async (req,res,next) => {
  const ref = req.body.ref
  const transactionVerified = await Transaction.findOne({ref})
  if(transactionVerified){
    return res.json({status:"error",message:"payment has already been verified"})
  }
  const key = process.env.PAYSTACK_KEY
  paystack(key).transaction.verify(ref, async (error, body) => {
    if(error) return res.json({status:"error",message:error.message})
    // if(body.data.domain != 'test') console.log(body.data.amount)
    if(body.data) {
      const transactionData = {
        user:req.user.id,
        type:"Wallet Funding",
        amount: String(body.data.amount).slice(0,-2),
        status: body.data.status,
        ref:body.data.reference
      }
      if(body.data.status === 'success'){
        const transaction = new Transaction(transactionData)
        await transaction.save()
        const user= await User.findById(req.user.id)
        const newWallet = parseInt(user.wallet) + parseInt(transactionData.amount)
        const updateWallet = await User.findOneAndUpdate(
         {_id:req.user.id},{ $set:{wallet: newWallet}},{returnNewDocument:true})
        return res.json({status:'success',message:"Payment Made Successfully"})
      }
       return res.json({status:"fail",message:"Payment Failed! Kindly contact our customer care if you have any complain "})
    }

  });
})

exports.buyData = catchAsync(async (req,res,next) => {
  const order_id = cryto.randomBytes(12).toString("hex")
  
  const {phone,amount,network} = req.body
  if(!phone || !amount || !network){
    return res.json({status:"fail",message:"Incorrect Details"})
  }
  const val = await axios(`https://www.nellobytesystems.com/APIDatabundleV1.asp?UserID=${process.env
  .USER_ID}&APIKey=${process.env
    .API_KEY}&MobileNetwork=${network}&DataPlan=${amount}&MobileNumber=${phone}&orderID=${order_id}`)
  res.json(val.data)
   
  
})
exports.cableTV = catchAsync(async (req,res,next) => {
  const order_id = cryto.randomBytes(12).toString("hex")
  const {cable,cardNo,package} = req.body
  if(!cardNo || !cable || !package){
    return res.json({status:"fail",message:"Pls provide full Details of your transaction..."})
  }
  const val = await axios(`https://www.nellobytesystems.com/APICableTVV1.asp?UserID=${process.env
  .USER_ID}&APIKey=${process.env
    .API_KEY}&CableTV=${cable}&Package=${package}&SmartCardNo=${cardNo}&orderID=${order_id}`)
    if(val.data.status === "INSUFFICIENT_APIBALANCE"){
      return res.json({status:"fail",message:"This Service is not available at the Moment, Pls try Again!"})
    }

    return res.json({status:"fail",message:"No response from this Server"})
   
})
exports.cableTVVerification = catchAsync(async (req,res,next) => {
  const {cardNo,cable} = req.body
  if(!cardNo || !cable) return res.json({status:"fail",message:"Pls provide full card Details"})
  const val = await axios(`https://www.nellobytesystems.com/APIVerifyCableTVV1.0.asp?UserID=${process.env
  .USER_ID}&APIKey=${process.env
    .API_KEY}&CableTV=${cable}&SmartCardNo=${cardNo}`)

    if(val.data.customer_name === 'INVALID_SMARTCARDNO'){
      return res.json({status:"fail",message:"Invalid Card Number"})
   }

  if(val.data.customer_name){
    return res.json({status:"success",customer_name:val.data.customer_name})
  }
  
  return res.json({status:"fail",message:"Error occur! pls try Again"})  
  
})

exports.electricityBill = catchAsync(async (req,res,next) => {
  const order_id = cryto.randomBytes(12).toString("hex")
  
  const {compNo,meterType,meterNo,amount} = req.body
  if(!compNo || !amount || !meterNo || !meterType){
    return res.json({status:"fail",message:"Pls provide full card Details"})
  }
  const val = await axios(`https://www.nellobytesystems.com/APIElectricityV1.asp?UserID=${process.env
  .USER_ID}&APIKey=${process.env
    .API_KEY}&ElectricCompany=${compNo}&MeterType=${meterType}&MeterNo=${meterNo}&Amount=${amount}&orderID=${order_id}`)
     if(val.data.status === "INSUFFICIENT_APIBALANCE"){
        return res.json({status:"fail",message:"unable To proccess your request, pls contact our customer care"})
     }
    res.json(val.data)
     
})
exports.meterVerify =  catchAsync(async (req,res,next) => {

  const {compNo,meterNo} = req.body
  if(!compNo || !meterNo){
    return res.json({status:"fail",message:"Pls provide full meter details"})
  }
  const val = await axios(`https://www.nellobytesystems.com/APIVerifyElectricityV1.asp?UserID=${process.env
  .USER_ID}&APIKey=${process.env
    .API_KEY}&ElectricCompany=${compNo}&meterno=${meterNo}`)
    if(val.data.customer_name){
      return res.json({status:"success",...val.data})
    }
    if(val.data.customer_name === ""){
      return res.json({status:'fail',message:"invalid Meter Number"})
    }
  res.json({status:'fail',message:"unable to proccess your, Request Pls try Again"})
     
})

exports.rechargePin = catchAsync(async (req,res,next) => {

  const order_id = cryto.randomBytes(12).toString("hex")
  
  const {network,quantity,value} = req.body
  if(!network || !value || !quantity){
    return res.json({status:"fail",message:"Pls provide full Details"})
  }
  const val = await axios(`https://www.nellobytesystems.com/APIEPINV1.asp?UserID=${process.env
  .USER_ID}&APIKey=${process.env
    .API_KEY}&MobileNetwork=${network}&Value=${value}&Quantity=${quantity}&orderID=${order_id}`)

    if(val.data.status === "INSUFFICIENT_APIBALANCE"){
      return res.json({status:"fail",message:"unable To proccess your request, pls contact our customer care"})
   }
  res.json(val.data)
     
})