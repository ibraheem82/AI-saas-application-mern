const express = require("express");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { handlestripePayment, handleFreeSubscription } = require("../controllers/handleStripePayment");

const stripeRouter = express.Router();


stripeRouter.post("/checkout", isAuthenticated, handlestripePayment);
stripeRouter.post("/free-plan", isAuthenticated, handleFreeSubscription);




module.exports = stripeRouter;