const asyncHandler = require("express-async-handler");
const { calculateNextBillingDate } = require("../utils/calculateNextBillingDate");
const {
  shouldRenewSubcriptionPlan,
} = require("../utils/shouldRenewsubcriptionPlan");
const Payment = require("../models/Payment");
const User = require("../models/User");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);



/*
  * -> The PaymentIntent in Stripe is a fundamental object that represents your intent to collect a payment from a customer. It tracks the lifecycle of a payment, from its creation through authorization and capture, and handles various payment methods and authentication scenarios.


  * -> 






*/
//-----Stripe payment-----
const handlestripePayment = asyncHandler(async (req, res) => {
  const { amount, subscriptionPlan, paymentMethodId } = req.body;
  //get the user
  const user = req?.user;
  console.log(user);
  try {
    //Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100,
      currency: "usd",
      payment_method: paymentMethodId,
      confirmation_method: "manual",
      confirm: true,
      payment_method_types: ["card"],

     
      //add some data the meta object

      metadata: {
        userId: user?._id?.toString(),
        userEmail: user?.email,
        subscriptionPlan,
      },
    });
    //send the response
    console.log(paymentIntent);
    res.json({
      clientSecret: paymentIntent?.client_secret,
      paymentId: paymentIntent?.id,
      metadata: paymentIntent?.metadata,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// -----verify payment-----
const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);



    if (paymentIntent.status !== "succeeded") {
      console.log(`Payment ${paymentId} status is ${paymentIntent.status}.`);
      console.log(paymentIntent.object)
      return res.status(400).json({ status: false, message: "Payment not successful" });
    }

    const metadata = paymentIntent?.metadata;
    
    const { subscriptionPlan, userEmail, userId } = metadata;
    console.log(userId)

    const userFound = await User.findById(userId);
    console.log(userFound)

    if (!userFound) {
      console.log(`User ${userId} not found.`);
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const amount = paymentIntent?.amount / 100;
    const currency = paymentIntent?.currency;
    const reference = paymentIntent?.id;

    const newPayment = await Payment.create({
      user: userId,
      email: userEmail,
      subscriptionPlan,
      amount,
      currency,
      status: "success",
      reference,
    });

    if (!newPayment) {
      console.error(`Failed to create payment record for user ${userId}.`);
      return res.status(500).json({ status: false, message: "Failed to create payment record" });
    }

    let monthlyRequestCount = 0;
    switch (subscriptionPlan) {
      case "Basic":
        monthlyRequestCount = 50;
        break;
      case "Premium":
        monthlyRequestCount = 100;
        break;
      case "Trial":
        monthlyRequestCount = 10;
        break;
      default:
        monthlyRequestCount = 0;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        subscriptionPlan,
        trialPeriod: 0,
        nextBillingDate: calculateNextBillingDate(),
        apiRequestCount: 0,
        monthlyRequestCount,
        $addToSet: { payments: newPayment._id },
      },
      { new: true }
    );

    if (!updatedUser) {
      console.error(`Failed to update user ${userId}.`);
      return res.status(500).json({ status: false, message: "Failed to update user" });
    }

    console.log(`Payment ${paymentId} verified and user ${userId} updated.`);
    return res.json({
      status: true,
      message: "Payment verified, user updated",
      // updatedUser,
      PayIN: paymentIntent
    });
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
});

//-----Handle free subscription-----
const handleFreeSubscription = asyncHandler(async (req, res) => {
  // Get the login user
  const user = req?.user;
  console.log("free plan", user);

  //Check if user account should be renew or not
  try {
    if (shouldRenewSubcriptionPlan(user)) {
      //Update the user account
      user.subscriptionPlan = "Free";
      user.monthlyRequestCount = 5;
      user.apiRequestCount = 0;
      user.nextBillingDate = calculateNextBillingDate();

      //Create new payment and save into DB
      const newPayment = await Payment.create({
        user: user?._id,
        subscriptionPlan: "Free",
        amount: 0,
        status: "success",
        /*
        Math.random() generates a random number like 0.1234567890123456.

.toString(36) converts it to a base-36 string, e.g., "0.4fzyo82mvyr".

.substring(7) removes the first 7 characters (0. and the next 5 characters), leaving a shorter random string like "82mvyr".
        */
        reference: Math.random().toString(36).substring(7),
        monthlyRequestCount: 0,
        currency: "usd",
      });
      user.payments.push(newPayment?._id);
      //save the user
      await user.save();
      //send the response
      res.json({
        status: "success",
        message: "Subscription plan updated successfully",
        user,
      });
    } else {
      return res.status(403).json({ error: "Subcription renewal not due yet" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

module.exports = { handlestripePayment, handleFreeSubscription, verifyPayment};