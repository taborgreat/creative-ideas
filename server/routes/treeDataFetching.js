const express = require("express");
const { getRootDetails, getTree, getParents, getRootNodes } = require("../controllers/treeDataFetching");
const authenticate  = require("../middleware/authenticate");
const router = express.Router();

// Endpoint to fetch root node IDs for user
router.get("/get-root-nodes", authenticate, getRootNodes);

// Endpoint to fetch root node details
router.post("/get-root-details", getRootDetails);

// Endpoint to fetch a tree of nodes
router.post("/get-tree", getTree);

// Endpoint to fetch parent nodes
router.post("/get-parents", getParents);

module.exports = router;
