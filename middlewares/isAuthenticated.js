const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

//----IsAuthenticated middleware
const isAuthenticated = asyncHandler(async (req, res, next) => {
  if (req.cookies.token) {
    //! Verify the token
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET); //the actual login user
    //add the user to the req obj
    // If the token is valid, jwt.verify() returns the decoded payload of the token, which typically contains user-related information (e.g., user ID).
    req.user = await User.findById(decoded?.id).select("-password");
    return next();
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
});
module.exports = isAuthenticated;
