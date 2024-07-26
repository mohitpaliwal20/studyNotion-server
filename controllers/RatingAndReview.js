const RatingAndreview = require("../models/RatingAndReview")
const Course = require("../models/Course")

//create rating 
exports.createRating = async (req,res) => {
    try {
        //get user id
        const userId =req.user.id;    
        //fetch data from body
        const {rating,review,courseId} = req.body;

        //check if user is enrolled or not
        const courseDetails = await Course.findOne({_id:courseId,
                                                   studentsEnrolled:{$elemMatch: {$eq:userId}},
                                                   });
        
        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"student is not enrolled in the course",
            });
        }
        //check user already reviewed the course 
        const alredyReviewed = await RatingAndreview.findOne({
            user:userId,
            course:courseId,
        })
        if(alredyReviewed){
            return res.status(403).json({
                success:false,
                message:"course is alredy reviewed by the user",
            });
        }
        //create rating
        const ratingReview = await RatingAndreview.create({
                                                          rating,review,
                                                          course:courseId,
                                                          user:userId,
                                                         });
        //update course with rating
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
                                      {
                                        $push:{
                                            ratingAndReviews:ratingReview._id,
                                        }
                                      },{new:true});
        console.log(updatedCourseDetails)
        //return
        return res.status(200).json({
            success:true,
            message:"rating and review created successfully",
            ratingReview,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}
//get average rating 
exports.getAverageRating = async (req,res) => {
    try {
        //get course id
        const courseId = req.body.courseId;
        //calculate average rating
        ////////////////////////////////////////
        //---> thuis code is written by me to calculate average rating using chatgpt
        
        // const ratings = await RatingAndreview.find({courseId});

        // if(ratings.length===0){
        //     return res.status(200).json({
        //         success:true,
        //         message:"no rating found for this course",
        //         averageRating:0,
        //     });
        // }
        // const totalRatings = ratings.reduce((acc,rating)=>acc+rating.rating,0);
        
        // const averageRating = totalRatings/ratings.length;

        // return res.status(200).json({
        //     success:true,
        //     averageRating,
        // })
        ////////////////////////////////////////
        const result = await RatingAndreview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"},
                }
            } 
        ])
        //return rating
        if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            })
        }
        //if no rating exits
        return res.status(200).json({
            success:false,
            message:"average rating is zero,no rating is given till now",
            averageRating:0,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}
//get all rating and review for a course 
exports.getAllRatingForCourse = async (req,res) => {
    try {
        const courseId = req.body.courseId;

        const allRating = await RatingAndreview.find({courseId})
                                                .sort({rating:"desc"})
                                                .populate({
                                                    path:"user",
                                                    select:"firstName lastName email image",
                                                })
                                                .populate({
                                                    path:"course",
                                                    select:"courseName",
                                                })
                                                .exec();
        return res.status(200).json({
            success:true,
            message:"all reviews for this course are fetched successfully",
            data:allRating,
        });          
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

// getrating and review for all the courses
exports.getAllRating =async (req,res) => {
    try {
        const allReviews = await RatingAndreview.find({})
                                 .sort({rating:"desc"})
                                 .populate({
                                    path:"user",
                                    select:"firstName lastName email image",
                                 })
                                 .populate({
                                    path:"course",
                                    select:"courseName",
                                 })
                                 .exec();
    
        return res.status(200).json({
            success:true,
            message:"all reviews fetched successfully",
            data:allReviews,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}
