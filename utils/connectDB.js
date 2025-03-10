const mongoose = require("mongoose");
//PASS: 
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URL
    );
    console.log(`Mongodb connected ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
