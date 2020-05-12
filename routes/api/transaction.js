const express = require("express");
const router = express.Router();
const {buyAirtime,buyData,cableTV,fundWallet,dataBundles,
    cableTVVerification,electricityBill,meterVerify,rechargePin} = require('../../controllers/transaction')
const auth = require("../../middleware/auth")

router.route("/buy-airtime").post(buyAirtime)
router.route("/buy-data").post(buyData)
router.route("/data-bundle").get(dataBundles)
router.route("/fund-wallet").post(auth,fundWallet)
router.route("/cable-tv").post(cableTV)
router.route("/electricity-bill").post(electricityBill)
router.route("/electricity-bill/verify").post(meterVerify)
router.route("/cable-tv/verify").post(cableTVVerification)
router.route("/recharge-pin").post(rechargePin)

module.exports = router;  