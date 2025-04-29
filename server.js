const express = require("express");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const usersRouter = require("./routes/usersRouter");
require("dotenv").config();
// const connectDB = require("./utils/connectDB"); // ✅ Import without calling
const { errorHandler } = require("./middlewares/errorMiddleware");
const googleAIRouter = require("./routes/geminiAIRouter");
const stripeRouter = require("./routes/stripeRouter");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 8090;

//Cron for the trial period : run every single
cron.schedule("0 0 * * * *", async () => {
    console.log("This task runs every second");
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

//---- Routes ----
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/google", googleAIRouter);
app.use("/api/v1/stripe", stripeRouter);
//--- Error handler middleware ----
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
