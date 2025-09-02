const {default:axios} = require("axios")

export const Base_URL = "http://localhost:9090/"

export const clientServer = axios.create({
    baseURL:Base_URL
})