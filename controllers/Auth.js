const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const Profile = require("../models/Profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailsender = require("../utils/mailSender")

require("dotenv").config();

//sendotp
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    //check if user already exist
    const checkUserPresent = await User.findOne({ email });

    //if already exist
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        mwessage: "user already registered",
      });
    }

    //generate otp
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("otp generated", otp);

    //check unique otp or not
    const result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };

    //create an entry in otp
    const otpBody = await OTP.create({
      email,
      otp,
    });
    console.log(otpBody);

    //return response succesfuly

    res.status(200).json({
      success: true,
      message: "OTP send successfully",
      otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};
//singup

exports.signUp = async (req, res) => {
  //data fetch from request body
  try {
    const {
      firstName,
      lastName,
      password,
      confirmPassword,
      email,
      accountType,
      otp,
    } = req.body;

    //validate data
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
    //2 password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmPassword does not match",
      });
    }
    //check user laredy exist or not
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "user is alredy registered",
      });
    }
    //find most recent otp for the user
    const recentOtp = await OTP.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    console.log("pal")
    console.log(recentOtp);
    console.log("mohit")
    //validate otp
    if (recentOtp.length == 0) {
      //otp not found
      return res.status(400).json({
        success: false,
        message: "opt not found",
      });
    } else if (otp != recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }
    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    //create entry in db
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      conatactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    //return res
    return res.status(200).json({
      wsuccess: true,
      message: "user is registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "user cannot be registered . Please try again",
      error,
    });
  }
};

//login

exports.login = async (req, res) => {
  try {
    //get data from body
    const { email, password } = req.body;
    //validate data
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "all fields are required",
      });
    }
    //check user existence
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "user is not registered",
      });
    }
    //generate jwt , after password matching
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;

      //create cookie and send response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 100),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "logged in successfully",
      });
    }else{
        return res.status(401).json({
            success:false,
            message:"password is incorrect",
        });
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({
        success:false,
        message:"login failure , Please try again",
    });
  }
};

//changepassword
exports.changePassword = async (req,res) => {
    try {
        //get data from req body
        //get oldpassword , newpassword,confirmpassword
        const {email,oldPassword,newPassword,confirmPassword} = req.body;
        //validation
        if(!email || !oldPassword || !newPassword || !confirmPassword){
            return res.status(403).json({
                success:false,
                message:"all fileds are mandatary",
            })
        }
        const user = await User.findOne({email})
        if(!user){
            return res.status(401).json({
                success:false,
                message:"no such user exist",
            })
        }
        if(!await bcrypt.compare(oldPassword,user.password)){
            return res.status(401).json({
                success:false,
                message:"old password does not match",
            })
        }
        if(newPassword!==confirmPassword){
            return res.status(401).json({
                success:false,
                message:"new password does not match with confirm password ",
            })
        }
        //update in db
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedDetails =  await User.findOneAndUpdate({email:email},{password:hashedPassword},{new:true});
        //send mail - password updated
        const mailResponse = await mailsender(email,"password change","the password has been changed");
 
        //return response
        return res.status(200).json({
            success:true,
            user,
            updatedDetails,
            oldPassword,
            message:"the password has been changed",
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"unable to changes password ",
        })
    }
}
