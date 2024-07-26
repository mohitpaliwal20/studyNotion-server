const Category = require("../models/Category")
//create tag handler function
exports.createCategory = async(req,res) => {
    try {
        //fetch data
        const {name,description} = req.body;
        //validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"all fields are required",
            })
        }
        //extra part starts
        ///////////////////////////////////////////////////////
        //---> this is created by me it is extra
        // const categoryExist = Category.findOne({name});
        // if(categoryExist){
        //     return res.status(401).json({
        //         success:false,
        //         message:"category alredy exist in db",
        //     });
        // }
        //extra part ends
        //////////////////////////////////////////////////////////
        //create entry in db
        const categoryDetails = await Category.create({
            name:name,
            description:description,
        })
        console.log(categoryDetails)
        //return response
        return res.status(200).json({
            success:true,
            message:"category created Successfully",
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

//get all tags
exports.showAllCategory = async (req,res) => {
    try {
        const allCategorys = await Category.find({},{name:true,description:true});

        res.status(200).json({
            success:true,
            message:"All tags returned successfully",
            allCategorys,
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

// category page details 
exports.categoryPageDetails = async (req,res) => {
    try {
        //get category id 
        const {categoryId} = req.body
        // gte courses for spcecified category id
        const selectedCategory = await Category.findById(categoryId)
                                               .populate("courses")
                                               .exec();
        //validation
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:"data not found",
            });
        }
        //get courses for different categories
        const differentCategories = await find({
            _id:{$ne:categoryId},
        }).populate("courses").exec();
        //get top selling courses ye homework hai

        //return
        return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategories,
            },
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}
