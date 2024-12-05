const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require('dotenv').config();

const mongooseUri = process.env.MONGODB_URI;

const Node = require("./db/node");

mongoose
  .connect(mongooseUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static("public"));


// Ensure the "notes" folder exists
const notesFolder = path.join(__dirname, "notes");
if (!fs.existsSync(notesFolder)) {
  fs.mkdirSync(notesFolder);
}

// Initial tree structure


// Ensure root node exists
async function ensureRootNode() {
  const rootNode = await Node.findOne({ name: "Root" });
  if (!rootNode) {
    const root = new Node({
      name: "Root",
      prestige: 0,
      notes: "root_notes.md",
      globalValues: { hours: 0 },
      versions: [
        {
          prestige: 0,
          values: {},
          status: "exchange",
          dateCreated: new Date(),
        },
      ],
      children: [],
      parent: null,
    });
    await root.save();
    console.log("Root node created");
  }
}
ensureRootNode();

async function findNodeById(nodeId) {
  try {
    const node = await Node.findOne({ _id: nodeId }).populate("children");
    if (!node) {
      throw new Error("Node not found");
    }
    return node;
  } catch (error) {
    console.error("Error finding node by UUID:", error);
    throw error;  // Re-throw the error to handle it in the calling function
  }
}


// Generate a unique ID
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

/*
// Helper function to recursively update the parent's values based on children's values
async function updateParentValues(nodeId) {
  const node = await findNodeById(nodeId);
  if (!node) return;

  const sums = {};

  for (const childId of node.children) {
    const child = await findNodeById(childId);
    if (child && child.versions.some((v) => v.status === "active")) {
      for (const [key, value] of Object.entries(child.values || {})) {
        sums[key] = (sums[key] || 0) + (value || 0);
      }
    }
    await updateParentValues(child._id);
  }

  node.values = sums;
  await node.save();

  node.values = { ...sums }; // Replace current values with the summed ones
} */



async function setValueForNode(nodeId, key, value) {
  try {
    const node = await findNodeById(nodeId);
    if (!node) {
      throw new Error('Node not found');
    }

    // Find the current version of the node based on the prestige
    const currentVersion = node.versions.find(
      (v) => v.prestige === node.prestige
    );

    if (!currentVersion) {
      throw new Error('No current version found');
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
    console.error('Error setting value for node:', error);
  }
}


app.post("/edit-value", async (req, res) => {
  const { nodeId, key, value } = req.body;
  try {
   
      setValueForNode(nodeId, key, value);
    
  } catch {
    console.log("sorry bitch")
  }


 
});


// GET /get-tree - Returns the entire tree starting from the root (parent: null)
app.get('/get-tree', async (req, res) => {
  try {
      // Find the root node (parent: null)
      const rootNode = await Node.findOne({ parent: null })
          .populate('children') // Populate direct children of the root
          .exec();

      // If no root node exists
      if (!rootNode) {
          return res.status(404).json({ message: 'Root node not found' });
      }

      // Recursively populate all children of each node
      const populateChildrenRecursive = async (node) => {
          if (node.children && node.children.length > 0) {
              // Recursively populate the children of each child
              node.children = await Node.populate(node.children, { path: 'children' });

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
      console.log(rootNode);
  } catch (error) {
      console.error("Error fetching tree:", error);
      res.status(500).json({ message: 'Server error' });
  }

});


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
  fs.writeFile(`notes/${noteName}.md`, noteContent, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Error saving note." });
    }
    res.json({ success: true });
  });
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
      },
    ],
    children: [],
    parent: parentNodeID,
  });
  await newNode.save();
  return newNode;
}
app.post("/add-node", async (req, res) => {
  const { parentId, name, schedule, reeffectTime } = req.body;
  console.log(parentId)
  try {
    // Fetch the parent node
    const parentNode = await findNodeById(parentId);
    if (!parentNode) {
      return res.status(404).json({ success: false, message: "Parent node not found" });
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
    res.status(500).json({ success: false, message: "Error adding node", error: err });
  }
});



/*

// Helper function to recursively update children's statuses based on parent's status
function updateChildrenStatus(node, newStatus) {
  node.children.forEach((child) => {
    child.status = newStatus;
    updateChildrenStatus(child, newStatus);
  });
} */

  /*
// POST /edit-status - Edits the status of a node and updates parent's values
app.post("/edit-status", (req, res) => {
  const { nodeId, status } = req.body;
  const node = findNodeById(tree, nodeId);
  if (node) {
    node.status = status;

    if (status === "trimmed") {
      updateChildrenStatus(node, "trimmed");
    } else {
      updateChildrenStatus(node, status);
    }

    updateParentValues(tree);
    res.json({ success: true, tree });
  } else {
    res.status(404).json({ success: false, message: "Node not found" });
  }
});

*/

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
  const valuesMap = currentVersion.values instanceof Map ? currentVersion.values : new Map(Object.entries(currentVersion.values));

  const newValues = new Map(); // Create a Map for new version's values

  // Update globalValues and reset newValues
  for (const [key, value] of valuesMap) {
    node.globalValues[key] = (node.globalValues[key] || 0) + value;
    newValues.set(key, 0);  // Reset the value to 0 for the new version
  }

  const newVersion = {
    prestige: node.prestige + 1,
    values: newValues,  // Store as Map
    status: "active",
    dateCreated: new Date().toISOString(),
    schedule: handleSchedule(currentVersion), // Update schedule or keep floating
    reeffectTime: currentVersion.reeffectTime, // Inherit from previous version
  };

  node.prestige++;
  node.versions.push(newVersion);

  await node.save()
    .then(() => console.log(`Node prestige updated to ${node.prestige}`))
    .catch((err) => console.error("Error saving node:", err));
}


app.post("/add-prestige", async (req, res) => {
  const { nodeId } = req.body;
  console.log(nodeId)
  const node = await findNodeById(nodeId);
  if (node) {
    await addPrestige(node);

    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: "Node not found" });
  }
});

/*

function completeNode(node) {
  // Find the current version that matches the node's prestige level
  const currentVersion = node.versions.find(
    (v) => v.prestige === node.prestige
  );

  if (!currentVersion) {
    console.error("No version found for the current prestige level.");
    return;
  }

  // Update global values by adding the current version's values to globalValues
  for (const [key, value] of Object.entries(currentVersion.values)) {
    // Add the current values to globalValues
    node.globalValues[key] = (node.globalValues[key] || 0) + value;
  }

  // Reset the current version's values to zero (or any other reset logic)
  currentVersion.values = {};
  // Mark the current version as "completed"
  currentVersion.status = "completed";
}

app.post("/complete-node", (req, res) => {
  const { nodeId } = req.body;
  const node = findNodeById(tree, nodeId);

  if (node) {
    completeNode(node);
    res.json({ success: true, tree });
  } else {
    res.status(404).json({ success: false, message: "Node not found" });
  }
});

*/

// Start the server
app.listen(port, () => {
  console.log(`Tree app server running at http://localhost:${port}`);
});
