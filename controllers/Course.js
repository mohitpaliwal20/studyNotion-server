const Course = require("../models/Course")
const Category = require("../models/Category")
const User = require("../models/User")
const {uploadImageToCloudinary} = require("../utils/imageUploader")

//create course handler function
exports.createCourse = async (req,res) => {
    try {
        //fetch data
        const {courseName,courseDescription,whatYouWillLearn,price,tag,category}=req.body;
        //fetch file
        //get thumbnail
        const thumbnail = req.files.thumbnailImage;
        //validation
        if(!courseName||!courseDescription || !whatYouWillLearn || !price || !tag || !category || !thumbnail){
            return res.status(400).json({
                success:false,
                message:"all fields are required",
            })
        }
        //check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        if(!instructorDetails){
            return res.status(400).json({
                success:false,
                message:"instructor details not found",
            });
        }
        console.log("Instructor Details:",instructorDetails);
        //check given tag is valid or not
        const CategoryDetails = Category.findById(category);
        if(!CategoryDetails){
            return res.status(404).json({
                succee:false,
                message:"Category details not found",
            });
        }
        //upload image on cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME)
        //create entry for new course on db
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn,
            price,
            tag,
            category,
            thumbnail:thumbnailImage.secure_url,
        })
        //add course entry in user schema
        await User.findByIdAndUpdate({_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id,
                }
            },
            {new:true},
        )
        //add course entry in tag
        await Category.findByIdAndUpdate({_id:category},
            {
                $push:{
                    course:newCourse.id,
                }
            },
            {new:true},
        )
        //return respone
        return res.status(200).json({
            success:true,
            message:"course created successfully",
            data:newCourse,
        });
    } 
    catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"failed to create course",
            error:error.message,
        })
    }
}

//get all courses
exports.showAllCourses = async (req,res) => {
    try {
        const allCourses = await Course.find({},{courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true,
        }).populate("instructor").exec();
        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched successfully",
            data:allCourses,
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"cannot fetch course data",
            error:error.message,
        })
    }
}

//gtecoursedetails
exports.getCourseDetails = async (req,res) => {
    try {
        const {courseId} = req.body;
        const courseDetails = await Course.find({_id:courseId})
                                                .populate(
                                                    {
                                                        path:"instructor",
                                                        populate:{
                                                            path:"additionalDetails",
                                                        },
                                                    }
                                                )
                                                .populate("category")
                                                // .populate("ratingAndreviews")
                                                .populate({
                                                    path:"courseContent",
                                                    populate:{
                                                        path:"subSection",
                                                    },
                                                })
                                                .exec();
        //validation
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`could not find the course with ${courseId}`,
            });
        }      
        //return 
        return res.status(200).json({
            success:true,
            message:"course details fetched successfully",
            data:courseDetails,
        });                                  
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
} 