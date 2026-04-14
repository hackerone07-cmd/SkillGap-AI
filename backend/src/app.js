import express from 'express';
import cookieParser from 'cookie-parser';
// import all the routers here
import authRouter from './routes/auth.route.js';
import interviewRouter from "./routes/interview.route.js"
import cors from "cors"
import { ApiError } from './utils/ApiError.js';
const app = express();

app.set("trust proxy", 1);

const allowedOrigins = (process.env.CLIENT_URLS || "http://localhost:5173")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new ApiError(403, "CORS origin not allowed"));
  },
  credentials: true,
}))


app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});


// using all the routers here
app.use('/api/auth',authRouter);
app.use('/api/interview',interviewRouter)

/* GLOBAL ERROR HANDLER — MUST BE LAST */
app.use((err, req, res, next) => {
  // Check if it's an ApiError instance
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors || [],
      data: err.data
    });
  }

  // Handle other errors
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: [],
    data: null
  });
});

export default app; 
