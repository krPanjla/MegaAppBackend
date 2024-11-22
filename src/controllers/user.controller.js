import { asyncHandler } from "../util/asyncHandler.js"
import { ApiError } from "../util/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../util/cloudinary.js"
import { ApiResponse } from "../util/ApiResponse.js"
import jwt from "jsonwebtoken"


const options = {
    httpOnly: true,
    secure: true
}

const generateTokens = async (user) => {

    //const user = await User.findById(userId)
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const userRegistration = asyncHandler(async (req, res) => {


    // get user details from frontend
    const { fullname, email, username, password } = req.body

    // validation - not empty
    const isNull = [fullname, email, username, password].some((item) => item?.trim() === "")
    if (isNull) {
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists: username, email
    const existedUser = await User.findOne({
        $or: [{ username, email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    console.log(req.files)
    // check for images, check for avatar
    const avatarUrl = req.files?.avatar[0]?.path;
    const coverImageUrl = req.files?.coverImage?.[0]?.path;


    if (!avatarUrl || !coverImageUrl) {
        throw new ApiError(400, "Avatar image and coverImage is required")
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarUrl)
    const coverImage = await uploadOnCloudinary(coverImageUrl)

    // create user object - create entry in db
    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage.url,
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

const login = asyncHandler(async (req, res) => {
    const { username, email, password: userPassword } = req.body

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required")
    }

    if (!userPassword) {
        throw new ApiError(400, "Password is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(!user){
        throw new ApiError(400, "User doesn't exists")
    }

    if (!(await user.isPasswordCorrect(userPassword))) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateTokens(user);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


    res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    userInfo: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully")
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findOneAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        })

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incommingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    console.log(incommingRefreshToken)

    if (!incommingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SCERET)

    if (!decodedToken) {
        throw new ApiError(401, "Invalid refresh token")
    }

    const user = await User.findById(decodedToken._id);

    console.log(user.refreshToken)

    if (!user) {
        throw new ApiError(401, "Invalid refresh token")
    }

    if (incommingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used")

    }

    const { accessToken, refreshToken } = await generateTokens(user)

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken: refreshToken },
                "Access token refreshed"
            )
        )


})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    //const user = await User.findById(req.user?._id)
    const user = await req.user
    if (!user) {
        throw new ApiResponse(400, "Unauthorized")
    }
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    user.save({ validateBeforeSave: false })

    res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password changed successfully")
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ))
})

const updateUserDetails = asyncHandler(async (req, res) => {

    const { fullname, email } = req.body;

    if (!fullname || !email) {
        throw new ApiError(400, "Please provide the required data")
    }

    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(400, "Unauthorized")
    }

    const user = await User.findOneAndUpdate(
        userId,
        {
            $set: {
                fullname: fullname,
                email: email
            }
        },
        { new: true }
    ).select("-password")

    res
        .status(200)
        .json(new ApiResponse(200,
            user,
            "Account details updated successfully"
        ))

})

const updateUserAvatar = asyncHandler(async (req, res) => {

    const localAvatarPath = req.file?.path

    if (!localAvatarPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatarUrl = await uploadOnCloudinary(localAvatarPath)

    const user = await User.findOneAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatarUrl.url

            }
        },
    )

    const publicIdwithExtention = user.avatar.split("/");
    const public_id = publicIdwithExtention[publicIdwithExtention.length-1]
    
    const result = await deleteFromCloudinary(public_id.split(".")[0])
    const updatedUser = await User.findById(user._id).select("--password")

    res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Avatar image updated successfully"))

})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const localCoverImagePath = req.file?.path

    if (!localCoverImagePath) {
        throw new ApiError(400, "Cover Image file is required");
    }

    const coverImageUrl = await uploadOnCloudinary(localCoverImagePath)

    const user = await User.findOneAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImageUrl.url

            }
        },
    )

    const publicIdwithExtention = user.coverImage.split("/");
    const public_id = publicIdwithExtention[publicIdwithExtention.length-1]
    
    const result = await deleteFromCloudinary(public_id.split(".")[0])
    const updatedUser = await User.findById(user._id).select("--password")

    res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Avatar image updated successfully"))

})


export {
    userRegistration,
    login,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage
}