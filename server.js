const express = require("express");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const cors = require("cors");
const usersRouter = require("./routes/usersRouter");
require("dotenv").config();
// const connectDB = require("./utils/connectDB"); // ✅ Import without calling
const { errorHandler } = require("./middlewares/errorMiddleware");
const googleAIRouter = require("./routes/geminiAIRouter");
const stripeRouter = require("./routes/stripeRouter");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 8090;

/*
! Explanation CRON JOB
-> The Cron Pattern "0 0 * * * *":
This string is a standard way to define recurring time intervals. The pattern has six parts: second minute hour day_of_month month day_of_week.
 -----> 0: the 0th second
0: the 0th minute
2: the 2nd hour (2:00 AM)
2: on the 2nd day of the month
4: the 4th month (April)
3: the 3rd day of the week (Wednesday, assuming Sunday is 0 or 7, and Monday is 1. Some systems use 0-6 or 1-7 for day of week). Let's assume Monday=1, so 3 means Wednesday.
  0: Specifies the second (the 0th second).
  0: Specifies the minute (the 0th minute).
  *: Specifies every hour.
  *: Specifies every day of the month.
  *: Specifies every month.
  *: Specifies every day of the week.


    ->

    */





// this code sets up a scheduled task that runs every day at midnight. Its purpose is to find all users whose free trial period has expired and automatically switch them to a 'Free' subscription plan by updating their trialActive, subscriptionPlan, and monthlyRequestCount fields in the database.
cron.schedule("0 0 * * * *", async () => {
    try {
      //get the current date
      const today = new Date();
      await User.updateMany({
          trialActive: true,
          trialExpires: {$lt:today} // trialExpires is less than ($lt) the today's date. This effectively selects users whose trial expiration date has passed.
      },{
          trialActive: false,
          subscriptionPlan: 'Free',
          monthlyRequestCount: 5
        }
      );

    } catch (error) {
      console.log(error);
    }
  });


  //Cron for the Free plan: run at the end of every month
cron.schedule("0 0 1 * * *", async () => {
    try {
      //get the current date
      const today = new Date();
      await User.updateMany(
        {
          subscriptionPlan: "Free",
          nextBillingDate: { $lt: today },
        },
        {
          monthlyRequestCount: 0,
        }
      );
    } catch (error) {
      console.log(error);
    }
  });


  //Cron for the Basic plan: run at the end of every month
cron.schedule("0 0 1 * * *", async () => {
    try {
      //get the current date
      const today = new Date();
      await User.updateMany(
        {
          subscriptionPlan: "Basic",
          nextBillingDate: { $lt: today },
        },
        {
          monthlyRequestCount: 0,
        }
      );
    } catch (error) {
      console.log(error);
    }
  });

  //Cron for the Premium plan: run at the end of every month
  cron.schedule("0 0 1 * * *", async () => {
    try {
      //get the current date
      const today = new Date();
      await User.updateMany(
        {
          subscriptionPlan: "Premium",
          nextBillingDate: { $lt: today },
        },
        {
          monthlyRequestCount: 0,
        }
      );
    } catch (error) {
      console.log(error);
    }
  });
  //Cron paid plan

// ✅ Correct way to call connectDB once
// connectDB();
require("./utils/connectDB")();

//---- Middlewares ----
app.use(express.json());
app.use(cookieParser()); // parse the cookie automatically.
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true
};

app.use(cors(corsOptions));
//---- Routes ----
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/google", googleAIRouter);
app.use("/api/v1/stripe", stripeRouter);
//--- Error handler middleware ----
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
