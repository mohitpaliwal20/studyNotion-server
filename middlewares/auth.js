const jwt = require("jsonwebtoken");
const User = require("../models/User");

require("dotenv").config();

//auth
exports.auth = async (req, res, next) => {
  try {
    const token =
      req.body.token ||
      req.cookies.token ||
      req.header("Authorisation").replace("Bearer ", "");
    
    if(!token){
        return res.status(401).json({
            success:false,
            message:"token is missing",
        })
    }
    //verify token
    try {
        const decode = await jwt.verify(token,process.env.JWT_SECRET);
        console.log(decode)
        req.user=decode;
    } catch (error) {
        return res.status(401).json({
            success:false,
            message:"token is ivalid",
        });
    }  
    next();
    
  } catch (error) {
    return res.status(401).json({
        success:false,
        message:"something went wrong while validating the token",
    });
  }
};
//isStudent
exports.isStudent = async (req,res,next) => {
    try {
        if(req.user.accountType  !== "Student"){
            return res.status(401).json({
                success:false,
                message:"this is a protected route for students only",
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified,try again"
        })
    }
}
//isInstructor
exports.isInstructor = async (req,res,next) => {
    try {
        if(req.user.accountType  !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"this is a protected route for Instructor only",
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified,try again"
        })
    }
}
//isAdmin
exports.isAdmin = async (req,res,next) => {
    try {
        console.log("print",req.user.accountType);
        if(req.user.accountType  !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"this is a protected route for Admin only",
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified,try again"
        })
    }
}
