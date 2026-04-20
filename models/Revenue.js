const mongoose = require("mongoose");

const RevenueSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    from: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Revenue || mongoose.model("Revenue", RevenueSchema);
