import express from 'express'
import connectDB from './db/db.js'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.route.js'

dotenv.config({
  path: './.env'
})

const app = express()
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


app.use("/api/auth", authRoutes);

  connectDB()
.then(() => {
  app.listen(port, () => {
    console.log(`Server is runnig at port : ${port}`);
  })
})
.catch((err) => {
  console.log("MongoDB connection Failed !!", err);
})

