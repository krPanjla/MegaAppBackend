import { Router } from "express";
import {watchHistory, getUserChannelProfile, updateUserCoverImage, updateUserAvatar, getCurrentUser, updateUserDetails, changePassword, login, logoutUser, userRegistration} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJwtToken from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";

const router = Router();

router.route("/registration").post(
    upload.fields(
        [{
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
        ]
    )

    , userRegistration)

router.route("/login").post(login)
router.route("/logout").post(verifyJwtToken, logoutUser)
router.route("/refresh-tokens").post(refreshAccessToken)
router.route("/change-password").patch(verifyJwtToken, changePassword)
router.route("/getCurrentUser").get(verifyJwtToken ,getCurrentUser)
router.route("/update-userDetails").patch(verifyJwtToken, updateUserDetails)
router.route("/update-Avatar").patch(verifyJwtToken, upload.single("avatar"), updateUserAvatar)
router.route("/update-coverImage").patch(verifyJwtToken ,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyJwtToken, getUserChannelProfile)
router.route("/watchHistory").get(verifyJwtToken, watchHistory)

export default router
