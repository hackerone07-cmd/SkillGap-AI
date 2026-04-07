import {Router} from 'express';
import {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    
    } from '../controllers/auth.controller.js';

import { authUser } from '../middlewares/auth.middlewares.js';

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */

authRouter.post('/register',registerUserController);

/** 
 * @route POST /api/auth/login
 * @description login a user
 * @access Public
 */
authRouter.post('/login',loginUserController);


/**
 * @route GET /api/auth/login
 * @description clear token from user cookie and add token in the blacklist
 * @access Public
 */
authRouter.post('/logout',authUser,logoutUserController)

/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details  
 * @access Private
 */
authRouter.get("/get-me",authUser,getMeController)




export default authRouter;