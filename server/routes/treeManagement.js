const express = require("express");
const {
  addNode,
  addNodesTree,
  deleteNode,
  editNodeName
} = require("../controllers/treeManagement");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

router.post("/add-node", authenticate, addNode);
router.post("/add-nodes-tree", authenticate, addNodesTree);
router.post("/delete-node", authenticate, deleteNode);
router.post("/edit-name", authenticate, editNodeName)

module.exports = router;
