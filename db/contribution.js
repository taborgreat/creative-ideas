const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Define the Contribution schema
const ContributionSchema = new mongoose.Schema({
  _id: {
    type: String, // UUID as the ID for contributions
    default: uuidv4,
  },
  userId: {
    type: String,
    ref: "User",
    required: true, // Reference to the user contributing
  },
  nodeId: {
    type: String,
    ref: "Node",
    required: true, // Reference to the node being contributed to
  },
  action: {
    type: String,
    enum: [
      "create",
      "statusChange",
      "editValue",
      "prestige",
      "trade",
      "delete",
      "invite",
      "editSchedule",
      "editGoal",
    ],
    required: true, // Action taken in the contribution
  },
  status: {
    type: String,
    enum: ["complete", "inProgress", "trimmed", "divider"],
    default: null, // Nullable status for the contribution
  },
  valueEdited: {
    type: Map,
    of: Number,
    default: null, // Nullable map for values edited
  },
  tradeId: {
    type: String,
    ref: "Transaction",
    default: null, // Nullable tradeId for trade-related actions
  },
  invite: {
    type: {
      action: {
        type: String,
        enum: [
          "invite",
          "acceptInvite",
          "denyInvite",
          "removeContributor",
          "switchOwner",
        ],
        default: null, // Nullable invite action
      },
      receivingId: {
        type: String,
        ref: "User", // Reference to the user receiving the invite
        default: null, // Nullable invite receiving ID
      },
    },
    default: null, // Default the entire invite object to null
  },
  scheduleEdited: {
    type: {
      date: {
        type: Date,
        default: null, // Nullable schedule edited date
      },
      reeffectTime: {
        type: Number,
        default: null, // Nullable reeffect time
      },
    },
    default: null, // Default the entire scheduleEdited object to null
  },
  goalEdited: {
    type: {
      action: {
        type: String,
        enum: ["add", "remove", "finished", "removeContributor", "switchOwner"],
        default: null, // Nullable goal action
      },
      goalId: {
        type: String,
        ref: "Goal",
        default: null, // Nullable reference to the goal edited
      },
    },
    default: null, // Default the entire goalEdited object to null
  },
  nodeVersion: {
    type: String,
    required: true, // Required node version for tracking
  },
  date: {
    type: Date,
    default: Date.now, // Automatically set the date to the current time
  },
});

// Create the Contribution model
const Contribution = mongoose.model("Contribution", ContributionSchema);

module.exports = Contribution;
