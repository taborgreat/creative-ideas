const express = require("express");
const {
  addNode,
  addNodesTree,
  deleteNode
} = require("../controllers/treeManagement");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

router.post("/add-node", authenticate, addNode);
router.post("/add-nodes-tree", authenticate, addNodesTree);
router.post("/delete-node", authenticate, deleteNode);

module.exports = router;
