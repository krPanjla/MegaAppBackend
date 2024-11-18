import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
    {
        username :{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },

        email :{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
        },

        fullname : {
            type: String,
            required: true,
            trim: true, 
            index: true
        },

        avatar : {
            type: String,
            required: true,
        },

        coverImage : {
            type: String,
            required: true,
        },

        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],

        password:{
            type: String,
            require: [true, 'Password is required']
        },

        refreshToken :{
            type: String
        },
    },

    {
        timestamps: true
    }
)

userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)

    }else{
        return next()
    }
})

userSchema.methods.isPasswordCorrect = async function (password){
    return bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    jwt.sign(
        {
            _id : this._id,
            username : this.username,
            email :  this.email,
            fullname : this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )    
}

userSchema.methods.generateRefreshToke = function(){
    jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SCERET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )    

}

export const User = mongoose.model("User", userSchema);