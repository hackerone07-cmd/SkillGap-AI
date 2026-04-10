import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/database.js";

async function startServer() {
  try {
    await connectDB();

    // generateAiInterviewReport({ resume, jobDescription, selfDescription })
    //   .then((report) => {
    //     console.log("AI interview report generated successfully.");
    //     console.log(JSON.stringify(report, null, 2));
    //   })
    //   .catch((error) => {
    //     console.error("AI interview report generation failed:", error.message);
    //   });

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
