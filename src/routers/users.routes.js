import { Router } from "express";
import {login, logoutUser, userRegistration} from "../controllers/user.controller.js";
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

export default router
