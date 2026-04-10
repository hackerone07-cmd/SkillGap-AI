import express from 'express';
import cookieParser from 'cookie-parser';
// import all the routers here
import authRouter from './routes/auth.route.js';
import interviewRouter from "./routes/interview.route.js"
import cors from "cors"
const app = express();

function formatError(err) {
  let message = err.message || "Something went wrong";
  let statusCode = err.statusCode || 500;

  try {
    const parsed = JSON.parse(message);
    const apiError = parsed?.error;

    if (apiError?.message) {
      message = apiError.message;
    }

    if (apiError?.code) {
      statusCode = apiError.code;
    }
  } catch {
  }

  return { message, statusCode };
}
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:5173",
credentials:true,
}))



// using all the routers here
app.use('/api/auth',authRouter);
app.use('/api/interview',interviewRouter)

/* GLOBAL ERROR HANDLER — MUST BE LAST */
app.use((err, req, res, next) => {
  const { message, statusCode } = formatError(err);

  res.status(statusCode).json({
    success: false,
    message,
  });
});

export default app; 
