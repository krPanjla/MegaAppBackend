import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser'

//Setting up server
const app = express();

//Setting some middlewares

var corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credendials: true
  }
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use(express.static("public"))
app.use(express.urlencoded({extended:true, limit:"16kb"}))

//routes import
import router from './routers/users.routes.js';
import subscriptionRouter from "./routers/subscription.router.js"


//routes declaration
app.use("/api/v1/users", router)
app.use("/api/v1/subscriptions", subscriptionRouter)


export {app}
