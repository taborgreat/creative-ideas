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
  status: 'exchange',
  values: {
    hours: 0,
  },
  children: [
    {
      id: generateId(),
      name: 'Wealth',
      status: 'exchange', // Set as exchange node
      values: {
        dollars: 0,
      },
      children: []
    },
    {
      id: generateId(),
      name: 'Self Focused',
      status: 'exchange', // Set as exchange node
      values: {},
      children: [
        {
      id: generateId(),
      name: 'Body',
      status: 'exchange', // Set as exchange node
      values: {},
      children: []
    },
    {
      id: generateId(),
      name: 'Mind',
      status: 'exchange', // Set as exchange node
      values: {},
      children: []
    }
      ]
    },
    {
      id: generateId(),
      name: 'Other Focused',
      status: 'exchange', // Set as exchange node
      values: {},
      children: [
        {
      id: generateId(),
      name: 'People',
      status: 'exchange', // Set as exchange node
      values: {},
      children: []
    },
    {
      id: generateId(),
      name: 'Possesions',
      status: 'exchange', // Set as exchange node
      values: {},
      children: []
    },
    {
      id: generateId(),
      name: 'Expression',
      status: 'exchange', // Set as exchange node
      values: {},
      children: []
    }
      ]
    }
  ]
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
    if (child.status === 'active') {
      for (const [key, value] of Object.entries(child.values)) {
        sums[key] = (sums[key] || 0) + (value || 0);
      }
    }
    updateParentValues(child);
  });

  node.values = { ...node.values, ...sums };
}

// Helper function to set a custom value for a node and propagate it to parent
function setValueForNode(node, key, value) {
  node.values[key] = value;
  updateParentValues(tree);
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
      values: {},
      children: [],
      status: 'active' // Set default status to active
    };

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
  const { parentId, key, value } = req.body;
  const parentNode = findNodeById(tree, parentId);
  if (parentNode) {
    setValueForNode(parentNode, key, value);
    res.json({ success: true, tree });
  } else {
    res.status(404).json({ success: false, message: 'Node not found' });
  }
});

// POST /edit-value - Edits a specific value for a node and updates parent's values
app.post('/edit-value', (req, res) => {
  const { nodeId, key, value } = req.body;
  const node = findNodeById(tree, nodeId);
  if (node) {
    node.values[key] = value;
    updateParentValues(tree);
    res.json({ success: true, tree });
  } else {
    res.status(404).json({ success: false, message: 'Node not found' });
  }
});

// Helper function to recursively update the children's statuses based on parent's status
function updateChildrenStatus(node, newStatus) {
  node.children.forEach(child => {
    child.status = newStatus;
    updateChildrenStatus(child, newStatus);
  });
}

// POST /edit-status - Edits the status of a node and updates parent's values
app.post('/edit-status', (req, res) => {
  const { nodeId, status } = req.body;
  const node = findNodeById(tree, nodeId);
  if (node) {
    node.status = status;

    if (status === 'trimmed') {
      updateChildrenStatus(node, 'trimmed');
    } else {
      updateChildrenStatus(node, status);
    }

    updateParentValues(tree);
    res.json({ success: true, tree });
  } else {
    res.status(404).json({ success: false, message: 'Node not found' });
  }
});

// POST /delete-node - Marks a node as trimmed instead of deleting it
app.post('/delete-node', (req, res) => {
  const { nodeId } = req.body;
  const node = findNodeById(tree, nodeId);
  if (node) {
    node.status = 'trimmed';
    updateParentValues(tree);
    res.json({ success: true, message: 'Node trimmed', tree });
  } else {
    res.status(404).json({ success: false, message: 'Node not found' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Tree app server running at http://localhost:${port}`);
});
