const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    nodeAId: { type: String, ref: "Node", required: true }, // First node in the transaction
    nodeBId: { type: String, ref: "Node", required: true }, // Second node in the transaction
    versionAIndex: { type: Number, required: true }, // Version index of Node A involved in the transaction
    versionBIndex: { type: Number, required: true }, // Version index of Node B involved in the transaction
    valuesTraded: { 
      nodeA: { type: Map, of: Number, required: true }, // Values contributed by Node A
      nodeB: { type: Map, of: Number, required: true }, // Values contributed by Node B
    },
    date: { type: Date, default: Date.now }, // Timestamp of the transaction
  });
  
  const Transaction = mongoose.model("Transaction", TransactionSchema);
  module.exports = Transaction;