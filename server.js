const express = require("express");
const usersRouter = require("./routes/usersRouter");
require("dotenv").config();
// const connectDB = require("./utils/connectDB"); // ✅ Import without calling
const { errorHandler } = require("./middlewares/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 8090;

// ✅ Correct way to call connectDB once
// connectDB();
require("./utils/connectDB")();

//---- Middlewares ----
app.use(express.json());

//---- Routes ----
app.use("/api/v1/users", usersRouter);
//--- Error handler middleware ----
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
