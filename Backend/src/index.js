import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"

import connectDB from "./db/db.js"
import authRoutes from "./routes/auth.route.js"

dotenv.config({
    path: "./.env"
})

const app = express()
app.use(express.json())
app.use(cookieParser())

const port = process.env.PORT || 4000

app.use(express.urlencoded({extended: true}))
app.use(cors({origin:`http://localhost:${port}`, credentials: true}))

app.listen(port, ()=>{
    console.log(`App is listen on port : ${port}`)
})

app.get("/", (req,res) => {
    res.send("Chill karo! Sab hojayega...")
})

app.use("/api/v1/auth", authRoutes)

connectDB().then(() => {
    app.listen(port, ()=>{
        console.log(`App is listening on port : ${port}`)
    })
}).catch((err)=>{
    console.error("Mongodb connection error :", err)
})