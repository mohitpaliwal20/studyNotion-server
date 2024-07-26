const Section = require("../models/Section")
const Course = require("../models/Course")

exports.createSection = async (req,res) => {
    try {
        //data fetch
        const {sectionName,courseId} = req.body;
        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"missing properties",
            });
        }
        //create section
        const newSection = await Section.create({sectionName});
        //update course with section objectid
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
                                                             {
                                                                $push:{
                                                                    courseContent: newSection._id,
                                                                }
                                                             },
                                                             {new:true},
                                                            ); //ye vali populate mene man se likkhi hai
        // home work: use populate to replace scetions/sub-sections both in the updated course details

        //return 
         return res.status(200).json({
            success:true,
            message:"section created successfully",
            updatedCourseDetails,
         })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"unable to create section",
        })
    }
};

//update section
exports.updateSection = async (req,res) => {
    try {
        //fetch data
        const {sectionName,sectionId} = req.body;

        //validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"missing properties",
            });
        }
        //update data
        const section = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
        //return 
        return res.status(200).json({
            success:true,
            message:"seciton updated successfullly",
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"unable to update section",
            error:error.message,
        })
    }
}

//delete section
exports.deleteSection = async (req,res) => {
    try {
        //get idbassuming that we are sending id in params
        // console.log(sectionId);
        const {sectionId,courseId} = req.body;
        //delete 
        await Section.findByIdAndDelete(sectionId);
        await Course.findByIdAndUpdate(courseId,
            {
                $pull:{
                    courseContent:sectionId,
                }
            }
        );
        //return
        return res.status(200).json({
            success:true,
            message:"section deleted successfully",
    })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"unable to delete section,please try again",
            error:error.message,
        })
    }
}
