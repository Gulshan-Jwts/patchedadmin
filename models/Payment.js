const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    to: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
    description: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
