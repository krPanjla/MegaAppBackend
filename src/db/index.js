import mongoose from "mongoose";

const connectDB = async () => {

    try {
        const connnectionInstance = await mongoose.connect(process.env.MongoDB_URI);
        console.log("You are connect to MongoDB having host : "+ connnectionInstance.connection.host)
        
    } catch (error) {
        console.log("Unable to connected to Database : " + error) 
        throw error
    }

}

export default connectDB

