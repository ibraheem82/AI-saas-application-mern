const express = require("express");

const isAuthenticated = require("../middlewares/isAuthenticated");
const { googleAIController } = require("../controllers/googleAIContoller");
const checkApiRequestLimit = require("../middlewares/checkApiRequestLimit");
// const checkApiRequestLimit = require("../middlewares/checkApiRequestLimit");

const googleAIRouter = express.Router();

googleAIRouter.post(
  "/generate-content",
  isAuthenticated,
  checkApiRequestLimit,
  googleAIController
);

module.exports = googleAIRouter;
