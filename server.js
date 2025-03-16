const express = require("express");
const cookieParser = require("cookie-parser");
const usersRouter = require("./routes/usersRouter");
require("dotenv").config();
// const connectDB = require("./utils/connectDB"); // ✅ Import without calling
const { errorHandler } = require("./middlewares/errorMiddleware");
const googleAIRouter = require("./routes/geminiAIRouter");
const stripeRouter = require("./routes/stripeRouter");

const app = express();
const PORT = process.env.PORT || 8090;

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
