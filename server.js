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
  status: 'active',
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
    // Only consider active nodes for value calculation
    if (child.status === 'active') {
      for (const [key, value] of Object.entries(child.values)) {
        sums[key] = (sums[key] || 0) + (value || 0); // Sum values, defaulting to 0
      }
    }
    updateParentValues(child); // Recursively update for each child
  });

  // Update parent's values based on the summed children's values
  node.values = { ...node.values, ...sums };
}

// Helper function to set a custom value for a node and propagate it to parent
function setValueForNode(node, key, value) {
  node.values[key] = value; // Set the custom value for this node
  updateParentValues(tree); // Update parent's values based on the change
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
      values: {}, // Initialize values as empty for the new child
      children: [],
      status: 'active' // Set default status to active
    };

    // Propagate default values for the new child to be 0
    for (const key in parentNode.values) {
      newNode.values[key] = 0; // Set inherited value to 0 for children
    }

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
    setValueForNode(parentNode, key, value); // Set the value and propagate
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
    updateParentValues(tree); // Ensure parent's values are updated
    res.json({ success: true, tree }); // Return the updated tree
  } else {
    res.status(404).json({ success: false, message: 'Node not found' });
  }
});

// Helper function to recursively update the children's statuses based on parent's status
function updateChildrenStatus(node, newStatus) {
  node.children.forEach(child => {
    child.status = newStatus; // Update the child's status
    updateChildrenStatus(child, newStatus); // Recursively update for each child
  });
}

// POST /edit-status - Edits the status of a node and updates parent's values
app.post('/edit-status', (req, res) => {
  const { nodeId, status } = req.body; // Expecting nodeId and status
  const node = findNodeById(tree, nodeId);
  if (node) {
    node.status = status; // Update the status of the current node
    
    // If the new status is "trimmed," also trim all children
    if (status === 'trimmed') {
      updateChildrenStatus(node, 'trimmed');
    } else {
      // For other statuses, update all children to match the parent's new status
      updateChildrenStatus(node, status);
    }

    updateParentValues(tree); // Ensure parent's values are updated
    res.json({ success: true, tree }); // Return the updated tree
  } else {
    res.status(404).json({ success: false, message: 'Node not found' });
  }
});

// POST /delete-node - Marks a node as trimmed instead of deleting it
app.post('/delete-node', (req, res) => {
  const { nodeId } = req.body;
  const node = findNodeById(tree, nodeId);
  if (node) {
    node.status = 'trimmed'; // Mark as trimmed
    updateParentValues(tree); // Update parent's values after trimming
    res.json({ success: true, message: 'Node trimmed', tree });
  } else {
    res.status(404).json({ success: false, message: 'Node not found' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Tree app server running at http://localhost:${port}`);
});
