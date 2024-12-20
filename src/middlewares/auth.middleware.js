import { User } from "../models/user.model.js";
import { asyncHandler } from "../util/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../util/ApiError.js";

const verifyJwtToken = asyncHandler(async(req, _, next)=>{
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!accessToken) {
            throw new ApiError(401, "Unauthorized request")
        }
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
                
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user
        next()
    
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")        
    }


})

export default verifyJwtToken