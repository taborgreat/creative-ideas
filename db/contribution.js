const mongoose = require("mongoose");

const ContributionSchema = new mongoose.Schema({
  userId: { type: String, ref: "User", required: true }, // Reference to the user
  node: { type: String, ref: "Node", required: true },
  action: { type: String, enum: ["create", "statusChange", "editValue", "prestige", "trade", "delete"], required: true },
  status: { type: String, enum: ["complete", "inProgress", "trimmed", "divider"] },
  valueEdited: { type: Map, of: Number },
  tradeId: { type: String },
  nodeVersion: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

// Create the Contribution model
const Contribution = mongoose.model("Contribution", ContributionSchema);
module.exports = Contribution;


