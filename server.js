const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static("public"));


const mongooseUri = process.env.MONGODB_URI;

const Node = require("./db/node");

mongoose
  .connect(mongooseUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));


// Ensure the "notes" folder exists
const notesFolder = path.join(__dirname, "notes");
if (!fs.existsSync(notesFolder)) {
  fs.mkdirSync(notesFolder);
}

// Generate a unique ID for file id in node (ideally use node id but its created after note assignment)
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}


// Create a new notes file
function createNotesFile() {
  const id = generateId(); // Generate the UUID
  const fileName = `${id}.md`;
  const filePath = path.join(notesFolder, fileName);
  fs.writeFileSync(filePath, `# Notes for node ${id}\n\n`, { flag: "w" });
  return fileName;
}

app.get("/get-note/:noteName", (req, res) => {
  const noteName = req.params.noteName;
  const notePath = path.join(notesFolder, noteName);

  if (fs.existsSync(notePath)) {
    res.sendFile(notePath);
  } else {
    res.status(404).send("Note not found");
  }
});

app.post("/save-note/:noteName", (req, res) => {
  const noteName = req.params.noteName;
  const noteContent = req.body.content;

  // Save the content to the .md file
  fs.writeFile(`notes/${noteName}`, noteContent, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Error saving note." });
    }
    res.json({ success: true });
  });
});


async function findNodeById(nodeId) {
  try {
    const node = await Node.findOne({ _id: nodeId }).populate("children");
    if (!node) {
      throw new Error("Node not found");
    }
    return node;
  } catch (error) {
    console.error("Error finding node by UUID:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}



async function setValueForNode(nodeId, key, value) {
  try {
    const node = await findNodeById(nodeId);
    if (!node) {
      throw new Error("Node not found");
    }

    // Find the current version of the node based on the prestige
    const currentVersion = node.versions.find(
      (v) => v.prestige === node.prestige
    );

    if (!currentVersion) {
      throw new Error("No current version found");
    }

    // Ensure that the 'values' map is updated properly
    if (currentVersion.values) {
      currentVersion.values.set(key, value);
    } else {
      // If there are no existing values, create a new Map
      currentVersion.values = new Map();
      currentVersion.values.set(key, value);
    }

    // Optionally save the node after modification if your system supports persistence

    node.save();
    return currentVersion;
  } catch (error) {
    console.error("Error setting value for node:", error);
  }
}

app.post("/edit-value", async (req, res) => {
  const { nodeId, key, value } = req.body;
  try {
    await setValueForNode(nodeId, key, value);
  } catch {
    console.log("sorry bitch");
  }
});

// GET /get-tree - Returns the entire tree starting from the root (parent: null)
app.get("/get-tree", async (req, res) => {
  try {
    // Find the root node (parent: null)
    const rootNode = await Node.findOne({ parent: null })
      .populate("children") // Populate direct children of the root
      .exec();

    // If no root node exists
    if (!rootNode) {
      return res.status(404).json({ message: "Root node not found" });
    }

    // Recursively populate all children of each node
    const populateChildrenRecursive = async (node) => {
      if (node.children && node.children.length > 0) {
        // Recursively populate the children of each child
        node.children = await Node.populate(node.children, {
          path: "children",
        });

        // Recursively populate each of the child nodes
        for (const child of node.children) {
          await populateChildrenRecursive(child);
        }
      }
    };

    // Start with the root node and populate recursively
    await populateChildrenRecursive(rootNode);

    // Send the complete tree back as a JSON response
    res.json(rootNode);
  } catch (error) {
    console.error("Error fetching tree:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Create a new node with required properties
async function createNewNode(name, schedule, reeffectTime, parentNodeID) {
  const notesFileName = createNotesFile();

  const newNode = new Node({
    name,
    prestige: 0,
    notes: notesFileName,
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
    parent: parentNodeID,
  });
  await newNode.save();
  return newNode;
}
app.post("/add-node", async (req, res) => {
  const { parentId, name, schedule, reeffectTime } = req.body; //make it so just send in object and get values from that so you can have values and goals
  console.log(parentId);
  try {
    // Fetch the parent node
    const parentNode = await findNodeById(parentId);
    if (!parentNode) {
      return res
        .status(404)
        .json({ success: false, message: "Parent node not found" });
    }

    // Create the new node
    const newNode = await createNewNode(name, schedule, reeffectTime, parentId);
    // Add the new node's ID to the parent's children array
    parentNode.children.push(newNode._id);

    // Save the updated parent node
    await parentNode.save();

    // Return the newly created node as a response
    res.json({ success: true, newNode });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error adding node", error: err });
  }
});

app.post("/add-nodes-tree", async (req, res) => {
  const { parentId, nodeTree } = req.body;

  if (!parentId || !nodeTree) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid request data" });
  }

  try {
    // Ensure the parent node exists
    const parentNode = await findNodeById(parentId);
    if (!parentNode) {
      return res
        .status(404)
        .json({ success: false, message: "Parent node not found" });
    }

    // Recursive function to create nodes and collect their IDs
    async function createNodesRecursive(nodeData, parentId) {
      const { name, schedule, reeffectTime, children = [] } = nodeData;

      // Create a new node
      const newNode = await createNewNode(
        name,
        schedule,
        reeffectTime,
        parentId
      );

      // Process children recursively and update their IDs in the new node
      for (const childData of children) {
        const childId = await createNodesRecursive(childData, newNode._id);
        newNode.children.push(childId); // Update the children array of the current node
      }

      await newNode.save(); // Save the node with its updated children

      return newNode._id; // Return the new node's ID
    }

    // Create the tree starting from the provided parent ID
    const newChildId = await createNodesRecursive(nodeTree, parentId);

    // Update the parent node with the new child reference
    parentNode.children.push(newChildId);
    await parentNode.save();

    res.json({ success: true, message: "Nodes added successfully" });
  } catch (err) {
    console.error("Error adding nodes tree:", err);
    res.status(500).json({
      success: false,
      message: "Error adding nodes tree",
      error: err.message,
    });
  }
});



// POST /edit-status - Edits the status of a node and all its child nodes
app.post("/edit-status", async (req, res) => {
  const { nodeId, status } = req.body;
  console.log(status)
  try {
    const node = await findNodeById(nodeId);
    if (!node) {
      return res
        .status(404)
        .json({ success: false, message: "Node not found" });
    }

    const currentVersion = node.versions.find(
      (v) => v.prestige === node.prestige
    );
    if (!currentVersion) {
      console.error("No version found for the current prestige level.");
      return res
        .status(500)
        .json({ success: false, message: "No version found" });
    }
    
    // Update the status of the node and all its children
    await updateNodeStatusRecursively(node, status);

    // Return success message
    res.json({
      success: true,
      message: `Status updated to ${status} for node and all its children`,
    });
  } catch (error) {
    console.error("Error updating node status:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating node status" });
  }
});



// Helper function to recursively update status for the node and its children
async function updateNodeStatusRecursively(node, status) {
  // If the status is "exchange", update the parent node and skip child updates
  if (status === "exchange") {

    // Update the parent node status without modifying the children
    const currentVersion = node.versions.find((v) => v.prestige === node.prestige);
    if (currentVersion) {
      currentVersion.status = status;
      await node.save(); // Save the updated node
    }
  } else {
    // If the status is "active", "trimmed", or "completed", process children
    if (["active", "trimmed", "completed"].includes(status)) {
      // Iterate over children nodes and update them
      for (const childId of node.children) {
        const childNode = await findNodeById(childId);


        // Check if the latest generation (most recent version) has the status "exchange"
        const latestVersion = childNode.versions.find((v) => v.prestige === childNode.prestige);
        if (latestVersion && latestVersion.status === "exchange") {
          continue; // Skip this child node and move to the next
        }

        // Recursively update the child node's status
        if (childNode) {
          console.log(`Updating child node ${childNode._id} with status ${status}`);
          await updateNodeStatusRecursively(childNode, status); // Recursive call for child node
        }
      }
    }
  }

  // Update the parent node status after processing all children
  const currentVersion = node.versions.find((v) => v.prestige === node.prestige);
  if (currentVersion) {
    currentVersion.status = status;
    await node.save(); // Save the updated node
  }
  console.log(`Parent node ${node._id} updated with status ${status}.`);
}




function handleSchedule(nodeVersion) {
  // Check if the node is floating or has a set date
  if (nodeVersion.schedule === null) {
    // Floating schedule, no change needed
    return nodeVersion.schedule;
  } else {
    // If schedule is set, update it with the reeffect time in hours
    const currentSchedule = new Date(nodeVersion.schedule);
    const updatedSchedule = new Date(
      currentSchedule.getTime() + nodeVersion.reeffectTime * 60 * 60 * 1000
    );
    return updatedSchedule.toISOString();
  }
}

async function addPrestige(node) {
  const currentVersion = node.versions.find(
    (v) => v.prestige === node.prestige
  );

  if (!currentVersion) {
    console.error("No version found for the current prestige level.");
    return;
  }

  currentVersion.status = "completed";

  // Ensure currentVersion.values is a Map, or convert it if it's an object
  const valuesMap =
    currentVersion.values instanceof Map
      ? currentVersion.values
      : new Map(Object.entries(currentVersion.values));

  const newValues = new Map(); // Create a Map for new version's values

  // Update globalValues and reset newValues
  for (const [key, value] of valuesMap) {
    node.globalValues[key] = (node.globalValues[key] || 0) + value;
    newValues.set(key, 0); // Reset the value to 0 for the new version
  }

  const newVersion = {
    prestige: node.prestige + 1,
    values: newValues, // Store as Map
    status: "active",
    dateCreated: new Date().toISOString(),
    schedule: handleSchedule(currentVersion), // Update schedule or keep floating
    reeffectTime: currentVersion.reeffectTime, // Inherit from previous version
  };

  // Add the "===================" in the notes file
  const noteFilePath = path.join(notesFolder, node.notes);
  const prestigeData = `\n\nPrestige: ${
    node.prestige
  }\nDate: ${new Date().toISOString()}\n=================================\n\n`;

  try {
    fs.appendFileSync(noteFilePath, prestigeData, "utf8");
    console.log("Prestige data added to notes.");
  } catch (error) {
    console.error("Error appending to notes file:", error);
  }

  node.prestige++;
  node.versions.push(newVersion);

  await node
    .save()
    .then(() => console.log(`Node prestige updated to ${node.prestige}`))
    .catch((err) => console.error("Error saving node:", err));
}

app.post("/add-prestige", async (req, res) => {
  const { nodeId } = req.body;
  console.log(nodeId);
  const node = await findNodeById(nodeId);
  if (node) {
    await addPrestige(node);

    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: "Node not found" });
  }
});

app.post("/delete-node", async (req, res) => {
  const { nodeId } = req.body; // Get the node ID from the URL

  try {
    const nodeToDelete = await Node.findById(nodeId);

    if (!nodeToDelete) {
      return res
        .status(404)
        .json({ success: false, message: "Node not found" });
    }

    // Delete the node from the database
    await Node.findByIdAndDelete(nodeId);

    res.json({ success: true, message: "Node deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Tree app server running at http://localhost:${port}`);
});
