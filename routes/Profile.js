const express = require("express");
const router = express.Router();

const {updateProfile,deleteAccount,getAllUserDetails} = require("../controllers/Profile");
const {auth , isInstructor } = require("../middlewares/auth")


router.post("/updateProfile",auth,updateProfile);
router.delete("/deleteAccount",auth,deleteAccount);
router.get("/getAllUserDetails",auth ,getAllUserDetails);


module.exports = router;