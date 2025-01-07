const Node = require("../db/models/node");
const User = require("../db/models/user");
const { findNodeById, logContribution } = require("../db/utils");

async function createNewNode(
  name,
  schedule,
  reeffectTime,
  parentNodeID,
  isRoot = false,
  userId
) {
  const newNode = new Node({
    name,
    prestige: 0,
    versions: [
      {
        prestige: 0,
        values: {},
        status: "active",
        dateCreated: new Date(),
        schedule: schedule ? new Date(schedule) : null,
        reeffectTime: reeffectTime || 0,
        goals: [],
      },
    ],
    children: [],
    parent: parentNodeID && parentNodeID !== null ? parentNodeID : null,
    rootOwner: isRoot ? userId : null,
    contributors: [],
  });

  await newNode.save();
  return newNode;
}

async function addNode(req, res) {
  const { parentId, name, schedule, reeffectTime, isRoot } = req.body;
  const userId = req.userId;

  try {
    if (isRoot && parentId !== null) {
      const parentNode = await findNodeById(parentId);
      if (!parentNode) {
        return res
          .status(404)
          .json({ success: false, message: "Parent node not found" });
      }
    }

    const newNode = await createNewNode(
      name,
      schedule,
      reeffectTime,
      parentId,
      isRoot,
      userId
    );

    if (isRoot) {
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      user.roots.push(newNode._id);
      await user.save();
    } else if (parentId !== null) {
      const parentNode = await findNodeById(parentId);
      if (!parentNode) {
        return res
          .status(404)
          .json({ success: false, message: "Parent node not found" });
      }
      parentNode.children.push(newNode._id);
      await parentNode.save();
    }

    await logContribution({
      userId,
      nodeId: newNode._id,
      action: "create",
      nodeVersion: "0",
    });

    res.json({ success: true, newNode });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error adding node",
        error: err.message,
      });
  }
}

async function addNodesTree(req, res) {
  const { parentId, nodeTree } = req.body;

  if (!parentId || !nodeTree) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid request data" });
  }

  try {
    const parentNode = await findNodeById(parentId);
    if (!parentNode) {
      return res
        .status(404)
        .json({ success: false, message: "Parent node not found" });
    }

    async function createNodesRecursive(nodeData, parentId) {
      const { name, schedule, reeffectTime, children = [] } = nodeData;

      const newNode = await createNewNode(
        name,
        schedule,
        reeffectTime,
        parentId
      );

      for (const childData of children) {
        const childId = await createNodesRecursive(childData, newNode._id);
        newNode.children.push(childId);
      }

      await newNode.save();
      return newNode._id;
    }

    const newChildId = await createNodesRecursive(nodeTree, parentId);
    parentNode.children.push(newChildId);
    await parentNode.save();

    res.json({ success: true, message: "Nodes added successfully" });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error adding nodes tree",
        error: err.message,
      });
  }
}

async function deleteNode(req, res) {
  const { nodeId } = req.body;

  try {
    const nodeToDelete = await Node.findById(nodeId);

    if (!nodeToDelete) {
      return res
        .status(404)
        .json({ success: false, message: "Node not found" });
    }

    await Node.findByIdAndDelete(nodeId);

    res.json({ success: true, message: "Node deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
}

module.exports = {
  addNode,
  deleteNode,
};
