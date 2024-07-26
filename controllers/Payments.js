const {instance} =  require("../config/razorpay")
const Course = require("../models/Course")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose")
// course enrollement vala mail template import karna bacha hai

//capture the payment and initiate the razorpay order 
exports.capturePayment = async (req,res) => {
        //get courseid and userid
        const {course_id}=req.body;
        const userId = req.user.id;
        //validatuion
        if(!course_id){
            return res.json({
                success:false,
                message:"please provide valid course id",
            })
        };
        //valid courseDetails
        let course;
        try {
            course = await Course.findById(course_id);
            if(!course){
                return res.json({
                    success:false,
                    message:"Could nt find course detail",
                });
            }
            //user alredy purchased the same course 
            // here userid is in string form so we will convert it into object id so that we can use it 
            // to compare 
            const uid = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)){
                return res.status(200).json({
                    success:false,
                    message:"Student is alredy enrolled",
                });
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({
            success:false,
            message:error.message,
          })
        }
        //create order
        const amount = course.price;
        const currency = "INR";

        const options = {
            amount:amount*100,
            currency,
            receipt:Math.random(Date.now()).toString(),
            notes:{
                courseId: course_id,
                userId,
            }
        };

        try {
            //initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);
            //return response
            return res.status(200).json({
                success:true,
                courseName:course.courseName,
                courseDescription:course.courseDescription,
                thumbnail:course.thumbnail,
                orderId:paymentResponse.id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount,
            })
        } catch (error) {
            console.log(error);
            res.json({
                success:false,
                message:"could not initiate response",
            })
        } 
};

//verify signature of razorpay and server
exports.verifySignature = async (req,res) => {
    const webhookSecret = "12345678";

    const signature = req.headers["x-razorpay-signature"];
     
    const shasum = crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body)); 
    const digest = shasum.digest("hex");

    if(signature === digest){
        console.log("payment is authorized");

        const {courseId,userId} = req.body.paylad.payment.entity.notes;
        try {
            //fullfill action
            //find course and enrol student in it
            const enrolledCourse =  await Course.findOneAndUpdate({_id:courseId},
                                                                   {
                                                                     $push:{
                                                                        studentsEnrolled:userId,
                                                                     }
                                                                   },
                                                                   {new:true},
                                                                   );
            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:"course not found",
                })
            }
            console.log(enrolledCourse);
            const enrolledStudent = await User.findOneAndUpdate(
                                                            {_id:userId},
                                                            {
                                                                $push:{
                                                                    courses:courseId,
                                                                }
                                                            },
                                                            {new:true},
                                                           );

            console.log(enrolledStudent);
            //mail send karo
            const emailResponse = await  mailSender(enrolledStudent.email,"course purchased successfuly","you are into onboarded into course");
            return res.status(200).json({
                success:true,
                message:"signature verified",
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success:false,
                message:error.message,
            })
        }
        

    }else{
        return res.status(400).json({
            success:false,
            message:"invalid request",
        });    
    }
};
