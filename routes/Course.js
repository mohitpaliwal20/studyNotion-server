const express = require("express");
const router = express.Router();

const {createCourse,showAllCourses,getCourseDetails} = require("../controllers/Course");
const {createCategory,showAllCategory,categoryPageDetails} = require("../controllers/Category")
const {createSection,updateSection,deleteSection} = require("../controllers/Section")
const {createSubSection} = require("../controllers/SubSection")
const {createRating,getAverageRating,getAllRatingForCourse,getAllRating} = require("../controllers/RatingAndReview")
const {auth,isStudent,isInstructor,isAdmin} = require("../middlewares/auth");

////////////////////
//------>course routes<----------------------------//
router.post("/createCourse",auth,isInstructor,createCourse);
router.get("/showAllCourses",showAllCourses);
router.get("/getCourseDetails",getCourseDetails);

//------------->category routes <----------------//
router.post("/createCategory",auth,isAdmin,createCategory);
router.get("/showAllCategory",showAllCategory);
router.get("/categoryPageDetails",categoryPageDetails);

//--------------->section routes <------------------//
router.post("/createSection",auth,isInstructor,createSection);
router.post("/updateSection",auth,isInstructor,updateSection);
router.post("/deleteSection",auth,isInstructor,deleteSection);

//-------------->subsection routes <-------------------//
router.post("/createSubSection",auth , isInstructor , createSubSection);

//---------------------->create rating <---------------------//
router.post("/createRating",auth, isStudent , createRating);
router.get("/getAverageRating",getAverageRating);
router.get("/getAllRatingForCourse",getAllRatingForCourse);
router.get("/getAllRating",getAllRating);

module.exports = router;
