import { Router } from "express";
import userController from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

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

    , userController)

export default router
