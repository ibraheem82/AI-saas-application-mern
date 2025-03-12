const asyncHandler = require("express-async-handler");
const axios = require("axios");
const ContentHistory = require("../models/ContentHistory");
const User = require("../models/User");

//----GoogleAI Controller----


const googleAIController = asyncHandler(async (req, res) => {
    const { prompt } = req.body;
    console.log(prompt);
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `${prompt}. Do not include any links or URLs in your response.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2000,
            stopSequences: [],
          },
          safetySettings: [], 
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      //send the response
      
      //   console.log(response.data.candidates[0].content.parts[0]);
    //   let content = response;
      let content = response?.data?.candidates[0]?.content?.parts[0]?.text?.trim();

      
      // Remove Links with regex
      // const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
      // content = content.replace(urlRegex, "");
      
      
      //Create the history
      // The create() method is used to insert a new document (record) into the collection
      const newContent = await ContentHistory.create({
        user: req?.user?._id,
        content,
      });
      //Push the content into the user
      const userFound = await User.findById(req?.user?.id);
      userFound.contentHistory.push(newContent?._id);
        //Update the api Request count
        userFound.apiRequestCount += 1;
        await userFound.save();
        res.status(200).json(content);
    } catch (error) {
      throw new Error(error);
    }
  });
module.exports = {
    googleAIController,
};
