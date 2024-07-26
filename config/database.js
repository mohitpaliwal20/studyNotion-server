const mongoose = require("mongoose")
require("dotenv").config();

exports.Connect = ()=>{
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>console.log("db connected"))
    .catch((error)=>{
        console.log("db connection issue")
        console.error(error)
        process.exit(1)
    })
}

