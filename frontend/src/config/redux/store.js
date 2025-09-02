import {configureStore} from "@reduxjs/toolkit"
import authReducer from "./reducer/authReducer/index.js"
import postReducer from "./reducer/postReducer/index.js"

/**
 * 
 * STEPS for state management
 * Submit action
 * Handle action in it's reducer
 * register here ->reducre
 */

export const store = configureStore({
    reducer:{
        auth:authReducer,
        posts:postReducer
    }
})
