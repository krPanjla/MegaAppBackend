import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//Upload a file

const uploadOnCloudinary = async (filePath) => {

    try {
        if (!filePath) return null
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto"
        });

        //console.log("file is uploaded on cloudinary ", uploadResult.url);

        fs.unlinkSync(filePath)
        return uploadResult

    } catch (error) {

        fs.unlinkSync(filePath)
        console.log("Failed to upload file ", error)
        return null

    }

}


//Delete a file

const deleteFromCloudinary = async (public_id) => {
    try {
        if (!public_id) return null
        const deletedResult = await cloudinary.uploader.destroy(public_id);
        return deletedResult

    } catch (error) {
        console.log("Failed to delete file ", error)
        return null

    }


}

export { uploadOnCloudinary, deleteFromCloudinary }