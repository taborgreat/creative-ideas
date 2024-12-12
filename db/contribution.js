const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ContributionSchema = new mongoose.Schema({
  _id: {
    type: String, // Change to String to store UUID
    default: uuidv4, // Generate UUID by default
  },
  userId: { type: String, ref: "User", required: true }, // Reference to the user
  nodeId: { type: String, ref: "Node", required: true }, // Reference to the node
  action: { type: String, enum: ["create", "statusChange", "editValue", "prestige", "trade", "delete"], required: true },
  status: { 
    type: String, 
    enum: ["complete", "inProgress", "trimmed", "divider"],
    default: null, // Allow null for status
  },
  valueEdited: { 
    type: Map, 
    of: Number,
    default: null, // Allow null or empty map for valueEdited
  },
  tradeId: { 
    type: String, 
    ref: "Transaction", 
    default: null, // Allow null for tradeId
  },
  nodeVersion: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

// Create the Contribution model
const Contribution = mongoose.model("Contribution", ContributionSchema);
module.exports = Contribution;
