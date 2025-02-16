const Node = require("../db/models/node");
const User = require("../db/models/user");
const { findNodeById, logContribution } = require("../db/utils");

async function createNewNode(
  name,
  schedule,
  reeffectTime,
  parentNodeID,
  isRoot = false,
  userId,
  values = {}, // Optional, defaults to an empty object
  goals = {}    // Optional, defaults to an empty array
) {
  const newNode = new Node({
    name,
    prestige: 0,
    versions: [
      {
        prestige: 0,
        values: values || {}, // Use provided values or default to an empty object
        status: "active",
        dateCreated: new Date(),
        schedule: schedule ? new Date(schedule) : null,
        reeffectTime: reeffectTime || 0,
        goals: goals || [],   // Use provided goals or default to an empty array
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

      // Validate nodeTree structure
      const isValidNode = (node) => {
        return (
          (typeof node.name === "string" || node.name === null) &&
          (typeof node.schedule === "string" || node.schedule === null) &&
          (node.schedule === null || !isNaN(Date.parse(node.schedule))) && // Allow null but ensure valid date string
          (typeof node.reeffectTime === "number" || node.reeffectTime === null || 
           typeof node.effectTime === "number" || node.effectTime === null) && // Allow null time values
          (typeof node.values === "object" || node.values === null) &&
          (typeof node.goals === "object" || node.goals === null) &&
          (Array.isArray(node.children) || node.children === null)  
        );
      };
      

  if (!isValidNode(nodeTree)) {
    return res.status(400).json({
      success: false,
      message: "Invalid nodeTree structure. Ensure it contains name, schedule, at least one of reeffectTime/effectTime, values, goals, and children."
    });
  }

    async function createNodesRecursive(nodeData, parentId) {
      const { 
        name, 
        schedule, 
        values, 
        goals, 
        children = [], 
        reeffectTime, 
        effectTime 
      } = nodeData;
      
      // Use reeffectTime if it's available, otherwise fall back to effectTime
      const timeToUse = reeffectTime !== undefined ? reeffectTime : effectTime;
      
      
      // Create the new node and link it to the parent
      const newNode = await createNewNode(
        name,
        schedule,
        timeToUse,
        parentId,  // Pass the correct parentId
        false,     // isRoot should always be false for recursive children
        req.userId,
        values || {},
        goals || []
      );

      // Recursively create child nodes and link them
      for (const childData of children) {
        const childId = await createNodesRecursive(childData, newNode._id);
        newNode.children.push(childId);
      }

      await newNode.save();
      return newNode._id;
    }

    // Start recursion with the root of the new subtree
    const newChildId = await createNodesRecursive(nodeTree, parentId);
    
    // Add the newly created child node to the parent's children
    parentNode.children.push(newChildId);
    await parentNode.save();

    res.json({ success: true, message: "Nodes added successfully" });
  } catch (err) {
    res.status(500).json({
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
  addNodesTree,
  deleteNode,
};
