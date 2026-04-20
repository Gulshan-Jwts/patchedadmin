const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  receivingPhone: String,
  payingPhone: String,
  referrer: { type: mongoose.Schema.ObjectId, ref: "User" },
  wallet: { type: Number, default: 0 },
  plan: {
    active: { type: Number, default: 1 },
    since: Date,
    pending: { type: Number, default: 0 },
  },
  today: {
    date: Date,
    quota: Number,
  },
  withdraw: { amount: { type: Number, default: 0 }, source: String },
  pendingWithdraw: Number,
  earned: Number,
  limit: { type: Number, default: 490 },
  history: [
    {
      source: String,
      isPending: { type: Boolean, default: true },
      isCredited: { type: Boolean, default: false },
      description: String,
      data: Number,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  messages: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      text: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", async function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
