const Profile = require("../models/Profile")
const User = require("../models/User")

exports.updateProfile = async (req,res) => {
    try {
        //get data
        const {dateOfBirth="",about="",contactNumber,gender} = req.body;
        //get userid 
        const id = req.user.id;
        //validation
        if(!contactNumber|| !gender || !id){
            return res.status(400).json({
                success:false,
                message:"all fields are required",
            });
        }
        //find profile
        const userDetails =await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profilDetails = await Profile.findById(profileId);
        //update profile
        profilDetails.dateOfBirth=dateOfBirth;
        profilDetails.about=about;
        profilDetails.gender=gender
        profilDetails.contactNumber=contactNumber;
        await profilDetails.save();
        //return response
        return res.status(200).json({
            success:true,
            message:"profile updated successfully",
            profilDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"issue in updating the profile",
            error:error.message,
        })
    }
};


//delete account
exports.deleteAccount = async (req,res) => {
    try {
        //get id
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"user not found",
            });
        }
        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        //delete user
        //home work : uneroll user from all enrolled courses
        await User.findByIdAndDelete({_id:id});
        //return
        return res.status(200).json({
            success:true,
            message:"user delted successfully",
        })
    } catch (error) {
        return res.status(500).json({
            sucess:false,
            message:"user can not be deleted successfully",
        });
    }
}

// get all details of user
exports.getAllUserDetails = async (req,res) => {
    try {
        const id = req.user.id;
        const userDetails =  await User.findById(id).populate("additionalDetails").exec();
        return res.status(200).json({
            success:true,
            message:"user data fetched successfully",
            userDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}
