const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); 


let tree = {
  id: 'root',
  name: 'Root',
  children: []
};


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


function deleteNodeById(node, nodeId) {
  node.children = node.children.filter(child => child.id !== nodeId);
  node.children.forEach(child => deleteNodeById(child, nodeId));
}


function generateId() {
  return Math.random().toString(36).substr(2, 9);
}


app.get('/get-tree', (req, res) => {
  res.json(tree);
});


app.post('/add-node', (req, res) => {
  const { parentId, name } = req.body;
  const parentNode = findNodeById(tree, parentId);

  if (parentNode) {
    const newNode = {
      id: generateId(),
      name: name,
      children: []
    };
    parentNode.children.push(newNode);
    res.json({ success: true, newNode });
  } else {
    res.status(404).json({ success: false, message: 'Parent node not found' });
  }
});


app.post('/delete-node', (req, res) => {
  const { nodeId } = req.body;
  if (tree.id === nodeId) {
    res.status(400).json({ success: false, message: 'Cannot delete the root node' });
  } else {
    deleteNodeById(tree, nodeId);
    res.json({ success: true });
  }
});

app.use(express.static('public')); 


app.listen(port, () => {
  console.log(`Tree app server running at http://localhost:${port}`);
});
