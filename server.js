const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

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
let tree = {
  id: "Root",
  name: "Root",
  prestige: 0,
  notes: "root_notes.md", // Root notes file
  globalValues: { hours: 0 },
  versions: [
    {
      prestige: 0,
      values: {},
      status: "exchange",
      dateCreated: new Date().toISOString(),
      schedule: null,
      reeffectTime: 0,
    },
  ],
  children: [],
};

// Helper function to find a node by its ID (recursively)
function findNodeById(node, nodeId) {
  if (node.id === nodeId) {
    return node;
  }
  for (let child of node.children) {
    const found = findNodeById(child, nodeId);
    if (found) return found;
  }
  return null;
}

// Generate a unique ID
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Helper function to recursively update the parent's values based on children's values
function updateParentValues(node) {
  const sums = {};

  node.children.forEach((child) => {
    if (child.status === "active") {
      for (const [key, value] of Object.entries(child.values)) {
        sums[key] = (sums[key] || 0) + (value || 0); // Sum across keys dynamically
      }
    }
    updateParentValues(child);
  });

  node.values = { ...sums }; // Replace current values with the summed ones
}

// Helper function to set a custom value for a node and propagate it to parent

function setValueForNode(node, key, value) {
  // Find the highest prestige version
  const currentPrestige = node.prestige; // Current prestige level
  const currentVersion = node.versions.find(
    (v) => v.prestige === currentPrestige
  );
  // Check if currentVersion exists
  if (!currentVersion) {
    // If there is no current version, return
    return;
  }

  // Ensure the values object exists for the current version
  if (!currentVersion.values) {
    currentVersion.values = {}; // Initialize if it's undefined
  }

  // Set the value for the current version
  currentVersion.values[key] = value;

  // Recalculate values for the entire tree
  updateParentValues(tree);
}

function addPrestige(node) {
  // Find the current version that matches the node's prestige level
  const currentVersion = node.versions.find(
    (v) => v.prestige === node.prestige
  );

  // If no matching version is found, return an error (this is just for safety)
  if (!currentVersion) {
    console.error("Error: No version found for the current prestige level.");
    return;
  }

  // Initialize new values for the next prestige
  const newValues = {};

  // Update global values by adding the current version's values to globalValues
  for (const [key, value] of Object.entries(currentVersion.values)) {
    // Add the current values to globalValues
    node.globalValues[key] = (node.globalValues[key] || 0) + value;

    // Keep the keys from the current values but reset the values to 0
    newValues[key] = 0;
  }

  // Store the new version for the next prestige level with reset values
  const newVersion = {
    prestige: node.prestige + 1,
    values: newValues, // Reset values to 0 for the new prestige
    status: "active",
  };

  // Increment the node's prestige level and add the new version to the versions array
  node.prestige++;
  node.versions.push(newVersion);

  // Set the node's current values to the reset values (new generation)
  node.values = { ...newValues };
}

// GET /get-tree - Returns the current tree structure
app.get("/get-tree", (req, res) => {
  res.json(tree);
});

// Create a new notes file
function createNotesFile(id) {
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
function createNewNode(name, schedule, reeffectTime) {
  const id = generateId();
  const notesFileName = createNotesFile(id); // Generate a notes file for the node

  return {
    id: id,
    name: name,
    prestige: 0,
    notes: notesFileName, // Link the notes file to the node
    globalValues: {},
    versions: [
      {
        prestige: 0,
        values: {},
        status: "active",
        dateCreated: new Date().toISOString(),
        schedule: schedule ? new Date(schedule).toISOString() : null,
        reeffectTime: reeffectTime || 0,
      },
    ],
    children: [],
  };
}

// POST /add-node - Adds a new node under a parent node
app.post("/add-node", (req, res) => {
  const { parentId, name, schedule, reeffectTime } = req.body;
  const parentNode = findNodeById(tree, parentId);
  if (parentNode) {
    const newNode = createNewNode(name, schedule, reeffectTime);
    parentNode.children.push(newNode);
    res.json({ success: true, newNode });
  } else {
    res.status(404).json({ success: false, message: "Parent node not found" });
  }
});

app.post("/add-value", (req, res) => {
  const { parentId, key, value } = req.body;
  const parentNode = findNodeById(tree, parentId);
  if (parentNode) {
    setValueForNode(parentNode, key, value);
    res.json({ success: true, tree });
  } else {
    res.status(404).json({ success: false, message: "Node not found" });
  }
});

app.post("/edit-value", (req, res) => {
  const { nodeId, key, value } = req.body;
  const node = findNodeById(tree, nodeId);
  if (node) {
    setValueForNode(node, key, value); // Use the updated function
    res.json({ success: true, tree });
  } else {
    res.status(404).json({ success: false, message: "Node not found" });
  }
});

// Helper function to recursively update children's statuses based on parent's status
function updateChildrenStatus(node, newStatus) {
  node.children.forEach((child) => {
    child.status = newStatus;
    updateChildrenStatus(child, newStatus);
  });
}

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

// POST /delete-node - Marks a node as trimmed instead of deleting it
app.post("/delete-node", (req, res) => {
  const { nodeId } = req.body;
  const node = findNodeById(tree, nodeId);
  if (node) {
    node.status = "trimmed";
    updateParentValues(tree);
    res.json({ success: true, message: "Node trimmed", tree });
  } else {
    res.status(404).json({ success: false, message: "Node not found" });
  }
});

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

function addPrestige(node) {
  const currentVersion = node.versions.find(
    (v) => v.prestige === node.prestige
  );

  if (!currentVersion) {
    console.error("No version found for the current prestige level.");
    return;
  }

  currentVersion.status = "completed";

  const newValues = {};
  for (const [key, value] of Object.entries(currentVersion.values)) {
    node.globalValues[key] = (node.globalValues[key] || 0) + value;
    newValues[key] = 0;
  }

  const newVersion = {
    prestige: node.prestige + 1,
    values: newValues,
    status: "active",
    dateCreated: new Date().toISOString(),
    schedule: handleSchedule(currentVersion), // Update schedule or keep floating
    reeffectTime: currentVersion.reeffectTime, // Inherit from previous version
  };

  node.prestige++;
  node.versions.push(newVersion);
  node.values = { ...newValues };
}

app.post("/add-prestige", (req, res) => {
  const { nodeId } = req.body;
  const node = findNodeById(tree, nodeId);
  if (node) {
    addPrestige(node);
    res.json({ success: true, tree });
  } else {
    res.status(404).json({ success: false, message: "Node not found" });
  }
});

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

// Start the server
app.listen(port, () => {
  console.log(`Tree app server running at http://localhost:${port}`);
});
