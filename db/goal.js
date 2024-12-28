const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const GoalSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  value: { type: String, required: false },
  reached: { type: Boolean, required: true },
  quantifiableGoal: { type: Number, required: false },
  unquantifiableGoal: { type: String, required: false },
});

const Goal = mongoose.model("Goal", GoalSchema);

module.exports = Goal;
