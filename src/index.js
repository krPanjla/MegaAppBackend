import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

//Loading environment variables
dotenv.config({path:'./.env'})

connectDB()
.then(()=>{
    app.on("error", (err)=>{
        console.log(`Error:  ${err}`); 
        throw err;
    })
    app.listen(process.env.PORT || 8000, ()=>{

        console.log(`Server is Up and Running on PORT ${process.env.PORT}....`)
    })
})
.catch(()=>{
    console.log("MongoDB connection failed " + console.error)
    throw error;
})