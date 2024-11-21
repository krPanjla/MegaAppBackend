import {asyncHandler} from "../util/asyncHandler.js"
import { ApiError } from "../util/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../util/cloudinary.js"
import {ApiResponse} from "../util/ApiResponse.js"

const userController = asyncHandler( async(req, res)=>{


    // get user details from frontend
    const {fullname, email, username, password} = req.body 
    
    // validation - not empty
    const isNull = [fullname, email, username, password].some((item) => item?.trim() === "")
    if(isNull){
        throw  new ApiError(400, "All fields are required")
    }

    // check if user already exists: username, email
   const existedUser =  await User.findOne({
        $or:[{username, email}]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
console.log(req.files)
    // check for images, check for avatar
    const avatarUrl = req.files?.avatar[0]?.path;
    const coverImageUrl = req.files?.coverImage?.[0]?.path;

    console.log(avatarUrl, coverImageUrl)

    if(!avatarUrl || !coverImageUrl){
        throw new ApiError(400, "Avatar image and coverImage is required")
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarUrl)
    const coverImage = await uploadOnCloudinary(coverImageUrl)

    // create user object - create entry in db
    const user = await User.create({
        fullname,
        email,
        username : username.toLowerCase(),
        avatar : avatar.url,
        coverImage : coverImage.url,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // remove password and refresh token field from response
    // check for user creation
    // return res
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

export default userController