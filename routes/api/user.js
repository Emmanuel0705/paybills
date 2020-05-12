const express = require("express");
const router = express.Router();
const {check} = require("express-validator")
const auth = require('../../middleware/auth')
const {getUser,loginUser,allUsers,registerUser} = require("../../controllers/user")

router.route("/").post(registerUser)
router.route("/auth").get(auth,getUser).post(loginUser)
router.route("/all").get(allUsers)

module.exports = router