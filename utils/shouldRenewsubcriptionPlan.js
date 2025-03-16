const shouldRenewSubcriptionPlan = (user) => {
    // *  the current date and time.
// 2025-03-14T06:28:14.770Z
    const today = new Date();

    // !user?.nextBillingDate - This checks if the user doesn't have a nextBillingDate property or if it's null/undefined. The ?. is the optional chaining operator that prevents errors if user is null/undefined.
    // user?.nextBillingDate <= today - This checks if the user's next billing date is today or has already passed.
    return !user?.nextBillingDate || user?.nextBillingDate <= today;
};

module.exports = { shouldRenewSubcriptionPlan };
const today = new Date();
console.log(today);
