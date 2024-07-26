const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

//resetpasswordtoken
exports.resetPasswordToken = async (req, res) => {
  try {
    //get email from request body
    const email = req.body.email;
    //check user for this email,vaalidation
    const user = await User.findOne({ email });
    if (!user) {
      return res.jason({
        success: false,
        message: "your emial is not registered wiht us",
      });
    }
    // generate token
    const token = crypto.randomUUID();
    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );
    //craete url
    const url = `http://localhost:3000/update-password/${token}`;
    //send emial conatining url
    await mailSender(
      email,
      "Passwrod reset link",
      `Password reset link ${url}`
    );
    //return response
    return res.json({
      success: true,
      message: "email sent successfully , pleaser check yout email",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "something went wrong while sending reset password link",
    });
  }
};

//resetpassword
exports.resetPassword = async (req, res) => {
  try {
    //fetch data
    const { password, confirmPassword, token } = req.body;
    //validation
    if (password != confirmPassword) {
      return res.json({
        success: false,
        message: "password not matching with confirm password",
      });
    }
    //get userdetails from db using token
    const userDetails = await User.findOne({ token: token });
    console.log("mohit")
    console.log(userDetails)

    //token validity and time
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token is invalid",
      });
    }
    
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "token is expired please regenerate your link",
      });
    }
    
    //hash paswword
    const hashedPassword = await bcrypt.hash(password, 10);
   
    //upodate password in db
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );
    console.log("pal")
    //return resposne
    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    return res.status(500).json({
        success:false,
        message:"something sent wrong while sending reset password mail",
    })
  }
};
