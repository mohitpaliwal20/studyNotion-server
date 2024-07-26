const express = require("express");
const router = express.Router();

const {sendOTP,signUp,login,changePassword} = require("../controllers/Auth")
const {resetPasswordToken,resetPassword} = require("../controllers/ResetPassword")
// const {auth} = require("../middlewares/auth");

//-------------------->authenctication routes <------------------------//
router.post("/sendOTP",sendOTP);
router.post("/signUp",signUp)
router.post("/login",login)
router.post("changePassword",changePassword)

//-------------------> reset password routes <-------------------------------//
router.post("/reset-password-token",resetPasswordToken)
router.post("/reset-password",resetPassword)


module.exports = router;