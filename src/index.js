import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from 'express';

//Loading environment variables
dotenv.config({path:'./env'})

//Setting up server
const app = express();

app.listen(process.env.PORT, ()=>{
    console.log(`Server is Up and Running on PORT ${process.env.PORT}....`)
})



connectDB();



