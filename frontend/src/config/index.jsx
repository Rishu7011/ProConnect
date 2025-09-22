const {default:axios} = require("axios")

export const Base_URL = "https://proconnect-vzhm.onrender.com"

export const clientServer = axios.create({
    baseURL:Base_URL
})