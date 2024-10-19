const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory tree data structure
let tree = {
  id: 'root',
  name: 'Root',
  values: {}, // Initialize as an empty object
  children: []
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

// Helper function to delete a node by its ID (recursively)
function deleteNodeById(node, nodeId) {
  node.children = node.children.filter(child => child.id !== nodeId);
  node.children.forEach(child => deleteNodeById(child, nodeId));
}

// Generate a unique ID
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Helper function to recursively update the parent's values based on children's values
function updateParentValues(node) {
  const sums = {};
  node.children.forEach(child => {
    for (const [key, value] of Object.entries(child.values)) {
      sums[key] = (sums[key] || 0) + (value || 0); // Sum up values
    }
  });
  // Update parent's values
  node.values = { ...node.values, ...sums };
  
  // Recursively update for each child
  node.children.forEach(child => updateParentValues(child));
}

// Helper function to set a custom value for a node and its children
function setValueForNode(node, key, value) {
  node.values[key] = value; // Set the custom value for this node
  updateParentValues(node); // Update parent's values
}

// GET /get-tree - Returns the current tree structure
app.get('/get-tree', (req, res) => {
  res.json(tree);
});

// POST /add-node - Adds a new node under a parent node
app.post('/add-node', (req, res) => {
  const { parentId, name } = req.body;
  const parentNode = findNodeById(tree, parentId);
  if (parentNode) {
    const newNode = {
      id: generateId(),
      name: name,
      values: { ...parentNode.values }, // Inherit values from parent
      children: []
    };
    parentNode.children.push(newNode);
    res.json({ success: true, newNode });
  } else {
    res.status(404).json({ success: false, message: 'Parent node not found' });
  }
});

// POST /add-value - Sets a custom value for a node and updates parent's values
app.post('/add-value', (req, res) => {
  const { parentId, key, value } = req.body; // Expecting key and value
  const parentNode = findNodeById(tree, parentId);
  if (parentNode) {
    setValueForNode(parentNode, key, value);
    res.json({ success: true, tree }); // Return the updated tree
  } else {
    res.status(404).json({ success: false, message: 'Node not found' });
  }
});

// POST /edit-value - Edits a specific value for a node and updates parent's values
app.post('/edit-value', (req, res) => {
  const { nodeId, key, value } = req.body; // Expecting nodeId, key, and value
  const node = findNodeById(tree, nodeId);
  if (node) {
    node.values[key] = value; // Update the value
    updateParentValues(node); // Ensure parent's values are updated
    res.json({ success: true, tree }); // Return the updated tree
  } else {
    res.status(404).json({ success: false, message: 'Node not found' });
  }
});

// POST /delete-node - Deletes a node and all its children
app.post('/delete-node', (req, res) => {
  const { nodeId } = req.body;
  if (tree.id === nodeId) {
    res.status(400).json({ success: false, message: 'Cannot delete the root node' });
  } else {
    deleteNodeById(tree, nodeId);
    res.json({ success: true });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Tree app server running at http://localhost:${port}`);
});
