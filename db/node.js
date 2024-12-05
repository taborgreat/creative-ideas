// models/Node.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const NodeSchema = new mongoose.Schema({
  _id: {
    type: String, // Change to String to store UUID
    default: uuidv4, // Generate UUID by default
  },
  name: { type: String, required: true },
  prestige: { type: Number, default: 0 },
  notes: { type: String, required: true },
  globalValues: { type: Map, of: Number, default: {} },
  versions: [
    {
      prestige: { type: Number, required: true },
      values: { type: Map, of: Number, default: {} },
      status: { type: String, default: "active" },
      dateCreated: { type: Date, default: Date.now },
      schedule: { type: Date, default: null },
      reeffectTime: { type: Number, default: 0 },
    },
  ],
  children: [{ type: String, ref: "Node" }],  // Use String for children references
  parent: { type: String, ref: "Node", default: null },  // Use String for parent reference
});

const Node = mongoose.model("Node", NodeSchema);
module.exports = Node;
