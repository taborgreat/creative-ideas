const Node = require("../db/models/node");
const Transaction = require("../db/models/transaction");
const { logContribution } = require("../db/utils");

const getTransactions = async (req, res) => {
  const { nodeId } = req.body;
  if (!nodeId) {
    return res.status(400).json({ message: "nodeId is required." });
  }
  try {
    const transactions = await Transaction.find({
      $or: [{ nodeAId: nodeId }, { nodeBId: nodeId }],
    })
      .populate("nodeAId")
      .populate("nodeBId")
      .populate("versionAIndex")
      .populate("versionBIndex")
      .populate("valuesTraded.nodeA")
      .populate("valuesTraded.nodeB")
      .exec();

    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ message: "Server error, could not fetch transactions." });
  }
};

const tradeValuesBetweenNodes = async (nodeAId, versionAIndex, valuesA, nodeBId, versionBIndex, valuesB, userId) => {
 

  const nodeA = await Node.findById(nodeAId);
  const nodeB = await Node.findById(nodeBId);

  if (!nodeA || !nodeB) {
    throw new Error("One or both nodes not found.");
  }

  const versionA = nodeA.versions[versionAIndex];
  const versionB = nodeB.versions[versionBIndex];

  if (!versionA || !versionB) {
    throw new Error("One or both versions not found.");
  }

  for (const [key, value] of Object.entries(valuesA)) {
 

    if ((versionA.values.get(key) || 0) < value) {
      throw new Error(`Node A's version ${versionAIndex} has insufficient ${key}.`);
    }

    // Correctly update values for Map
    versionA.values.set(key, (versionA.values.get(key) || 0) - value);
    versionB.values.set(key, (versionB.values.get(key) || 0) + value);
  }

  for (const [key, value] of Object.entries(valuesB)) {


    if ((versionB.values.get(key) || 0) < value) {
      throw new Error(`Node B's version ${versionBIndex} has insufficient ${key}.`);
    }

    // Correctly update values for Map
    versionB.values.set(key, (versionB.values.get(key) || 0) - value);
    versionA.values.set(key, (versionA.values.get(key) || 0) + value);
  }

  await nodeA.save();
  await nodeB.save();

  // Create and save the transaction
  const transaction = new Transaction({
    nodeAId,
    nodeBId,
    versionAIndex,
    versionBIndex,
    valuesTraded: { nodeA: valuesA, nodeB: valuesB },
  });

  await transaction.save();

  // Log contribution, ensuring transaction._id is properly passed
  await logContribution({
    userId: userId,
    nodeId: nodeAId,
    action: "transaction",
    tradeId: transaction._id, // Ensure transaction is saved before referencing _id
    nodeVersion: versionAIndex
  });
};


const tradeValues = async (req, res) => {
  const { nodeAId, versionAIndex, valuesA, nodeBId, versionBIndex, valuesB } = req.body;
  const userId = req.userId;

  if (!nodeAId || versionAIndex === undefined || !valuesA || !nodeBId || versionBIndex === undefined || !valuesB) {
    return res.status(400).json({ message: "Invalid request body. Ensure all required fields are provided." });
  }

  try {
    await tradeValuesBetweenNodes(nodeAId, versionAIndex, valuesA, nodeBId, versionBIndex, valuesB, userId);
    return res.status(200).json({ message: "Trade completed successfully." });
  } catch (error) {
    console.error("Error during trade:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getTransactions, tradeValues };
