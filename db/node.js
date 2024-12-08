const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const GoalSchema = new mongoose.Schema({
  value: { type: String, required: false }, // The value being tracked
  reached: { type: Boolean, required: true }, // Whether the goal is reached
  quantifiableGoal: { type: Number, required: false }, // Optional numeric goal
});

const NodeSchema = new mongoose.Schema({
  _id: {
    type: String, // Change to String to store UUID
    default: uuidv4, // Generate UUID by default
  },
  name: { type: String, required: true },
  prestige: { type: Number, default: 0 },
  notes: { type: String, required: true },
  globalValues: { type: Map, of: Number, default: {} }, // Tracks global summed values
  versions: [
    {
      prestige: { type: Number, required: true },
      values: { type: Map, of: Number, default: {} }, // Individual version values
      status: { type: String, default: "active" },
      dateCreated: { type: Date, default: Date.now },
      schedule: { type: Date, default: null },
      reeffectTime: { type: Number, default: 0 },
      goals: [GoalSchema],
    },
  ],
  children: [{ type: String, ref: "Node" }], // References to child nodes
  parent: { type: String, ref: "Node", default: null }, // Reference to the parent node
});

NodeSchema.methods.updateGlobalValues = async function () {
  const Node = mongoose.model("Node"); // Avoid circular dependency

  // Step 1: Aggregate values from all versions
  const aggregatedValues = new Map();
  this.versions.forEach((version) => {
    version.values.forEach((value, key) => {
      aggregatedValues.set(key, (aggregatedValues.get(key) || 0) + value);
    });
  });

  // Step 2: Include contributions from child nodes
  const children = await Node.find({ parent: this._id });
  for (const child of children) {
    child.globalValues.forEach((value, key) => {
      aggregatedValues.set(key, (aggregatedValues.get(key) || 0) + value);
    });
  }

  // Step 3: Determine values that need to be subtracted
  const previousValues = this.globalValues || new Map();
  const valuesToSubtract = new Map();

  // Find removed values by comparing previous globalValues and aggregatedValues
  previousValues.forEach((prevValue, key) => {
    if (!aggregatedValues.has(key)) {
      valuesToSubtract.set(key, prevValue);
    } else if (aggregatedValues.get(key) < prevValue) {
      valuesToSubtract.set(key, prevValue - aggregatedValues.get(key));
    }
  });

  // Step 4: Update the current node's globalValues
  this.globalValues = aggregatedValues;

  // Step 5: Propagate updates up the parent chain recursively
  let parentNode = this;
  while (parentNode.parent) {
    parentNode = await Node.findById(parentNode.parent);
    if (parentNode) {
      // Aggregate the current node's globalValues to the parent
      aggregatedValues.forEach((value, key) => {
        parentNode.globalValues.set(key, (parentNode.globalValues.get(key) || 0) + value);
      });

      // Subtract removed values from the parent's globalValues
      valuesToSubtract.forEach((value, key) => {
        parentNode.globalValues.set(key, (parentNode.globalValues.get(key) || 0) - value);
      });

      // Save the parent node
      await parentNode.save();
    }
  }
};

NodeSchema.pre("save", async function (next) {
  if (this.isModified("versions")) {
    await this.updateGlobalValues();
  }
  next();
});



const Node = mongoose.model("Node", NodeSchema);
module.exports = Node;