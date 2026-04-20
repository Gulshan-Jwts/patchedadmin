const express = require("express");
const authMiddleware = require("../middleware/auth");
const connectMongo = require("../lib/connectMongo");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Payment = require("../models/Payment");
const Revenue = require("../models/Revenue");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.get("/", (req, res) => {
  if (!req.cookies.token) res.redirect("/login");
  res.redirect("/home");
});

// Login page
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  await connectMongo();

  const user = await Admin.findOne({ email });
  if (!user) return res.send("User not found");

  const isMatch = password === user.password;
  if (!isMatch) return res.send("Invalid password");

  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("token", token, { httpOnly: true,secure: true,
  sameSite: "none" });

  res.redirect("/home");
});

router.get("/home", authMiddleware, async (req, res) => {
  await connectMongo();
  const users = await User.find({});
  const totalUsers = users.length;
  const inactiveUsers = users.filter((user) => user.plan.active === 0).length;
  const freeUsers = users.filter((user) => user.plan.active === 1).length;
  const firstUsers = users.filter((user) => user.plan.active === 2).length;
  const secondUsers = users.filter((user) => user.plan.active === 3).length;

  res.render("home", {
    totalUsers,
    inactiveUsers,
    freeUsers,
    firstUsers,
    secondUsers,
  });
});

router.get("/topay", authMiddleware, async (req, res) => {
  await connectMongo();
  const users = await User.find({});
  const usersToPay = users.filter((user) => user.withdraw.amount > 0);
  res.render("topay", {
    usersToPay,
  });
});

router.post("/user/pay", authMiddleware, async (req, res) => {
  try {
    await connectMongo();
    const { userIds } = req.body;
    console.log(req.body);

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.json({ success: false, message: "userIds array required" });
    }

    const users = await User.find({ _id: { $in: userIds } });

    const payments = [];

    for (let user of users) {
      const withdrawAmount = user.withdraw?.amount || 0;
      const source = user.withdraw?.source || "";

      if (withdrawAmount <= 0) continue;

      if (source === "refer") {
        const referHistory = user.history
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .find((h) => h.source === "refer" && h.isPending === false && h.isCredited === false);

        console.log(referHistory);

        if (referHistory) {
          referHistory.isCredited = true;
        }
      }

      user.messages.push({
        text: `₹${withdrawAmount} amount is credited to your account.`,
      });

      const payment = new Payment({
        amount: withdrawAmount,
        to: user._id,
        description: `Payout for ${source || "withdrawal"}`,
      });

      payments.push(payment.save());

      user.withdraw.amount = 0;
      user.withdraw.source = "";

      await user.save();
    }

    await Promise.all(payments);

    res.json({
      success: true,
      message: "Payments processed successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/toconfirm", authMiddleware, async (req, res) => {
  try {
    await connectMongo();
    const users = await User.find({
      "plan.pending": { $gt: 0 },
    })
      .sort({ updatedAt: -1 })
      .lean();

    res.render("toconfirm", {
      users,
    });
  } catch (err) {
    console.error("Error loading toconfirm page:", err);
    res.status(500).send("Server Error");
  }
});

router.post("/confirm-plans", authMiddleware, async (req, res) => {
  try {
    let { userIds } = req.body;

    if (!userIds) return res.redirect("/toconfirm");

    if (!Array.isArray(userIds)) userIds = [userIds];

    await connectMongo();
    const users = await User.find({ _id: { $in: userIds } });

    for (let user of users) {
      const pendingAmount = user.plan.pending;

      user.plan.active = pendingAmount;
      user.plan.pending = 0;
      user.plan.since = new Date();
      if (user.wallet > 0) {
        user.limit += pendingAmount === 2 ? 1590 : 3000;
      }
      user.messages.push({ text: `Your plan is activated successfully.` });
      await user.save();

      if (user.referrer) {
        const referrer = await User.findById(user.referrer);
        if (referrer) {
          referrer.messages.push({
            text: "You got ₹50 for referring a user who just activated their plan.",
          });

          referrer.history.push({
            amount: 50,
            source: "refer",
            isPending: true,
            isCredited: false,
            description: `Referral bonus for ${user.name}`,
          });
          await referrer.save();
        }
      }

      await Revenue.create({
        amount: pendingAmount === 2 ? 199 : 299,
        from: user._id,
      });
    }

    res.redirect("/toconfirm");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error confirming plans");
  }
});

router.get("/logout", (req, res) => {
  res.cookie("token", "", { httpOnly: true });
  res.render("login")
});

module.exports = router;
