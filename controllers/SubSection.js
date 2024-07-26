const SubSection = require("../models/SubSection")
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

require("dotenv").config();

// create subsection

exports.createSubSection = async (req,res) => {
    try {
        // fetch data
        const {sectionId,title,description,timeDuration,} = req.body;
        // fetch file 
        const video = req.files.videoFile;
        //vlidation
        if(!sectionId || !title || !description || !timeDuration || !video){
            return res.status(400).json({
                success:false,
                message:"all fileds are required",
            });
        }
        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        // create subsectionm
        const SubSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })
        //update section with the subsection id
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                                                               {
                                                                $push:{
                                                                    subSection:SubSectionDetails._id,
                                                                }
                                                               },
                                                               {new:true}
                                                               ).populate("subSection").exec();// yaha populate 
                                                                                               //mene khud kiya hai
    // return 
    return res.status(200).json({
        success:true,
        message:"sub section created successfully",
        updatedSection,
    })    
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"not able to add the subsection",
            error:error.message,
        })
    }
};

// home work: craete update subsection
// exports.updateSubSection = async (req,res) => {
//     try {
//         //fetch data
//         const {subSectionid,title,description,timeDuration} = req.body;
//         const video = req.files.videoFile;
//         //validate
//         if(!subSectionid|| !title || !description || !timeDuration || !video){
//             return res.status(400).json({
//                 success:false,
//                 message:"all fields are required",
//             });
//         }
//         //update
//         //return
//     } catch (error) {
        
//     }
// }

//create delete subsection