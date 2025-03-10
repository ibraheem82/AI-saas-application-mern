const express = require("express");
const { register, login, logout, userProfile } = require("../controllers/usersControllers");

const usersRouter = express.Router();


usersRouter.post("/register", register);
usersRouter.post("/login", login);
usersRouter.post("/logout", logout);
usersRouter.get("/profile", userProfile);




module.exports = usersRouter;