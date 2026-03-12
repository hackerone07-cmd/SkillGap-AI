import express from 'express';
import cookieParser from 'cookie-parser';
// import all the routers here
import authRouter from './routes/auth.route.js';
const app = express();
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// using all the routers here
app.use('/api/auth',authRouter);

/* GLOBAL ERROR HANDLER — MUST BE LAST */
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
  });
});

export default app; 