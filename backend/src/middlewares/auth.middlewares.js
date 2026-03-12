import jwt, { decode } from "jsonwebtoken"
import tokenBlacklistModel from "../models/blackList.model.js"
import { ApiError } from "../utils/apiError.js"

async function authUser(req,res,next){
     const token = req.cookies.token

     if(!token){
         return res.status(401).json({message: "token not provided." })
     }
     const isTokenBlacklist = await tokenBlacklistModel.findOne({
        token
     })

     if(isTokenBlacklist){
        throw new ApiError(401,"token is invalid")
     }
    try {
         const decoded = jwt.verify(token, process.env.JWT_SECRET)

         req.user = decoded

         next();
    } catch (error) {
        return res.status(401).json({message: "Invalid token"})
    }
}


export {
   authUser,
}