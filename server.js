const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt"); // To securely hash passwords
const mongoose = require("mongoose");
require("dotenv").config();






const app = express();
const port = 3000;

const cors = require("cors");

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:5173', // Allow only your frontend's origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
  credentials: true, // Allow cookies and credentials to be sent
}));



app.use(bodyParser.json());
app.use(express.static("public"));

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';


/*DB connection*/
const mongooseUri = process.env.MONGODB_URI;

const Node = require("./db/node");
const Transaction = require("./db/transaction");
const User = require("./db/user"); 
const Contribution = require("./db/contribution");


mongoose
  .connect(mongooseUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

/*Notes Management*/
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


/*AI*/
// Endpoint for Groq API
app.post('/AiResponse', async (req, res) => {
  const { messages, model, temperature, max_tokens, top_p, stop } = req.body;

  const payload = {
    messages,
    model: model || 'llama3-8b-8192', // Default values
    temperature: temperature || 1,
    max_tokens: max_tokens || 1024,
    top_p: top_p || 1,
    stop: stop || null,
  };

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!groqResponse.ok) {
      throw new Error(`Groq API error: ${groqResponse.statusText}`);
    }

    const reader = groqResponse.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let content = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      content += decoder.decode(value, { stream: true });
    }

    res.json({ success: true, data: content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/*user functions and ednpoints*/
// Middleware to verify the JWT token and extract user info
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId; // Attach userId to the request object
    next(); // Call the next middleware or route handler
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Endpoint to register a new user
app.post("/register", async (req, res) => {
  
  try {
    const { username, password } = req.body;

    // Validate request body
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Create a new user
    const newUser = new User({
      username,
      password, // Password will be hashed by the pre-save hook in the model
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Endpoint to log in
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Send token as a response
    res.status(200).json({ message: "Login successful", token, userId: user.id });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


async function getRootNodes(userId) {
  try {
    const user = await User.findById(userId);  // No need to populate roots
    if (!user) {
      return null;  // If the user is not found
    }
    return user.roots;  // Return the roots array, which contains just the node IDs
  } catch (error) {
    throw error;  // Handle the error if needed
  }
}



app.get("/get-root-nodes", authenticate, async (req, res) => {
 // Debug log to check user ID
 const userId = req.userId;
  try {
    const rootNodes = await getRootNodes(userId);
    if (!rootNodes || rootNodes.length === 0) {
      return res.json({ roots: [] });
    }
    res.json({ roots: rootNodes });
  } catch (error) {
    console.error("Error fetching root nodes:", error);
    res.status(500).json({ message: "Server error" });
  }
});





const logContribution = async ({ userId, nodeId, action, status, valueEdited, nodeVersion, tradeId }) => {

      // Default handling for optional fields
      status = status || null; // Set status to null if it's undefined or null
      valueEdited = valueEdited || null; // Set valueEdited to an empty Map if undefined or null
      tradeId = tradeId || null; // Set tradeId to null if undefined or null
   // Validate 'action' field against allowed actions
   const validActions = ["create", "statusChange", "editValue", "prestige", "trade", "delete"];
   if (!validActions.includes(action)) {
     throw new Error("Invalid action type");
   }
   console.log('userId:', userId, 'nodeId:', nodeId, 'action:', action, 'nodeVersion:', nodeVersion, 'value', valueEdited);

  try {
    // Validate required fields (userId, nodeId, action, and nodeVersion are required)
    if (!userId || !nodeId || !action || !nodeVersion) {
      throw new Error("Missing required fields");
    }



   

    // Create a new contribution document
    const newContribution = new Contribution({
      userId: userId,
      nodeId: nodeId,
      action: action,
      status: status,
      valueEdited: valueEdited,
      tradeId: tradeId,
      nodeVersion: nodeVersion,
      date: new Date(),
    });
    

    // Save the new contribution to the database
    await newContribution.save();
    console.log("Contribution logged successfully");
    
  } catch (error) {
    console.error("Error logging contribution:", error);
    throw new Error(error.message || "Internal server error");
  }
};



async function findNodeById(nodeId) {
  try {
    const node = await Node.findOne({ _id: nodeId }).populate("children");
    if (!node) {
      return null; // Return null if the node is not found
    }
    return node;
  } catch (error) {
    console.error("Error finding node by UUID:", error);
    throw error; // Re-throw for unexpected errors
  }
}
app.post("/get-contributions", authenticate, async (req, res) => {
  const { nodeId } = req.body;

  try {
    // Fetch contributions for the node and populate userId (to get the user name) and nodeId (to get the full node details)
    const contributions = await Contribution.find({ nodeId })
      .populate("userId", "username") // Populate only the 'username' field from the User model
      .populate("nodeId") // Populate the entire node object
      .sort({ date: -1 }); // Sort by date in descending order

    // Modify the contributions to add more details based on the action
    const enhancedContributions = contributions.map((contribution) => {
      let additionalInfo = null;

      if (contribution.action === "editValue") {
        additionalInfo = contribution.valueEdited; // Show valueEdited for editValue actions
      } else if (contribution.action === "statusChange") {
        additionalInfo = contribution.status; // Show status for statusChange actions
      } else if (contribution.action === "trade") {
        additionalInfo = contribution.tradeId; // Show tradeId for trade actions
      }

      return {
        ...contribution.toObject(),
        username: contribution.userId.username, // Add the username to the contribution object
        additionalInfo, // Add the conditional info based on the action type
        nodeVersion: contribution.nodeVersion, // Add the node version
      };
    });

    // Return the contributions with enhanced information
    res.json({ contributions: enhancedContributions });
  } catch (error) {
    console.error("Error fetching contributions:", error);
    res.status(500).json({ message: "Server error" });
  }
});




async function setValueForNode(nodeId, key, value, userId, versionIndex) {
  const node = await findNodeById(nodeId);

  try {
    if (!node) {
      throw new Error("Node not found");
    }

    // Check if the versionIndex exists in the versions array
    if (node.versions[versionIndex] === undefined) {
      throw new Error("Version index does not exist");
    }

    const currentVersion = node.versions[versionIndex];

    // Ensure that the 'values' map is updated properly
    if (currentVersion) {
      currentVersion.values.set(key, value);
    } else {
      // If there are no existing values, create a new Map
      currentVersion.values = new Map();
      currentVersion.values.set(key, value);
    }

    // Optionally save the node after modification if your system supports persistence

    await logContribution({
      userId: userId,
      nodeId,
      action: "editValue",
      status: null,
      valueEdited: { [key]: value },
      nodeVersion: versionIndex,
      tradeId: null
    });

    node.save();

    return currentVersion;
  } catch (error) {
    console.error("Error setting value for node:", error);
  }
}


app.post("/edit-value", authenticate, async (req, res) => {
  const { nodeId, key, value, version } = req.body;
  const userId = req.userId;
  const versionIndex = version.toString();
  const numericValue = Number(value);

  // Check if the conversion was successful and that it's a number
  if (isNaN(numericValue)) {
    return res.status(400).json({ error: 'Value must be a valid number' });
  }
  try {
    await setValueForNode(nodeId, key, value, userId, versionIndex);

  } catch {
    console.log("sorry bitch");
  }
 
});

// POST /get-tree - Returns the entire tree starting from a specified root node (rootId in body)
app.post("/get-tree", async (req, res) => {
  try {
    // Get the root node ID from the JSON body
    const { rootId } = req.body;

    // If no rootId is provided in the body, return an error message
    if (!rootId) {
      return res.status(400).json({ message: "Root node ID is required" });
    }

    // Find the specified root node by ID
    const rootNode = await Node.findById(rootId)
      .populate("children") // Populate direct children of the root
      .exec();

    // If no node with the specified ID exists
    if (!rootNode) {
      return res.status(404).json({ message: "Node not found" });
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

    // Start with the specified root node and populate recursively
    await populateChildrenRecursive(rootNode);

    // Send the complete tree back as a JSON response
    res.json(rootNode);
  } catch (error) {
    console.error("Error fetching tree:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /get-parents - Returns all parent nodes up to the root for a given child node
app.post("/get-parents", async (req, res) => {
  try {
    const { childId } = req.body;

    // If no childId is provided, return an error
    if (!childId) {
      return res.status(400).json({ message: "Child node ID is required" });
    }

    // Function to recursively find all parents
    const getParentsRecursive = async (nodeId, parents = []) => {
      // Find the current node by ID
      const currentNode = await Node.findById(nodeId).exec();

      // If node doesn't exist, return the collected parents so far
      if (!currentNode) {
        return parents;
      }

      // Add the current node to the parents list
      parents.push(currentNode);

      // If the node has a parent, continue upwards
      if (currentNode.parent) {
        return await getParentsRecursive(currentNode.parent, parents);
      }

      // If no parent, return the collected parents
      return parents;
    };

    // Start the recursive function with the child node
    const parentNodes = await getParentsRecursive(childId);

    // Return the list of parent nodes as a JSON response
    res.json(parentNodes);
  } catch (error) {
    console.error("Error fetching parents:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// Endpoint to fetch all transactions
app.get("/get-transactions", async (req, res) => {

  try {
    const transactions = await Transaction.find()
      .populate("nodeAId") // Populate nodeAId to get its data
      .populate("nodeBId")
      // Populate nodeBId to get its data
      .exec();

    res.json(transactions); // Return the transactions as JSON response
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

async function createNewNode(name, schedule, reeffectTime, parentNodeID, isRoot = false, userId) {
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
    parent: parentNodeID && parentNodeID !== null ? parentNodeID : null, 
    rootOwner: isRoot ? userId : null,  // Assign owner if it's a root node
    contributors: [],
  });

  await newNode.save();
  return newNode;
}

app.post("/add-node", authenticate, async (req, res) => {
  const { parentId, name, schedule, reeffectTime, isRoot } = req.body; // Include isRoot in request
  const userId = req.userId;
  try {
    // Check if the parentId is valid only if it's not a root node
    if (isRoot) {
      try {
        if(parentId !== null){
        const parentNode = await findNodeById(parentId);
        if (!parentNode ) {
          return res
            .status(404)
            .json({ success: false, message: "Parent node not found" });
        }}
      } catch (error) {
        return res.status(500).json({ success: false, message: "Error finding parent node", error: error.message });
      }
    }

    // Create the new node
    const newNode = await createNewNode(name, schedule, reeffectTime, parentId, isRoot, userId);

    // If the node is a root, add it to the user's roots array
    if (isRoot) {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }

        user.roots.push(newNode._id);  // Add the new node to the user's roots array
        await user.save();
      } catch (error) {
        return res.status(500).json({ success: false, message: "Error updating user's roots", error: error.message });
      }
    }

    // If it's not a root, add the new node's ID to the parent's children array
    if (parentId !== null) {
      try {
        const parentNode = await findNodeById(parentId);
        if (!parentNode) {
          return res
            .status(404)
            .json({ success: false, message: "Parent node not found" });
        }
        parentNode.children.push(newNode._id);
        await parentNode.save();
      } catch (error) {
        return res.status(500).json({ success: false, message: "Error adding child node to parent", error: error.message });
      }
    }

    // Log the user's contribution
    try {
      await logContribution({
        userId: userId,
        nodeId: newNode._id,
        action: "create",
        nodeVersion: "0",
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Error logging contribution", error: error.message });
    }

    // Return the newly created node as a response
    res.json({ success: true, newNode });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error adding node", error: err.message });
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

// POST /edit-status - Edits the status of a specific version of a node and all its child nodes
app.post("/edit-status", async (req, res) => {
  const { nodeId, status, version } = req.body;
  console.log(status, version);
  try {
    const node = await findNodeById(nodeId);
    if (!node) {
      return res
        .status(404)
        .json({ success: false, message: "Node not found" });
    }

    // Find the specific version of the node based on the version provided
    const targetVersion = node.versions.find((v) => v.version === version);
    if (!targetVersion) {
      return res
        .status(404)
        .json({ success: false, message: "Version not found" });
    }

    // Update the status of the specific version of the node
    targetVersion.status = status;
    await node.save(); // Save the updated node

    // Optionally, if you want to apply the status change recursively to child nodes:
    await updateNodeStatusRecursively(node, status, version);

    // Return success message
    res.json({
      success: true,
      message: `Status updated to ${status} for node version ${version} and its children`,
    });
  } catch (error) {
    console.error("Error updating node status:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating node status" });
  }
});

// Helper function to recursively update status for the node and its children (based on version)
async function updateNodeStatusRecursively(node, status, version) {
  // If the status is "divider", update the parent node and skip child updates
  if (status === "divider") {
    // Update the parent node status without modifying the children
    const targetVersion = node.versions.find((v) => v.prestige === version);
    if (targetVersion) {
      targetVersion.status = status;
      await node.save(); // Save the updated node
    }
  } else {
    // If the status is "active", "trimmed", or "completed", process children
    if (["active", "trimmed", "completed"].includes(status)) {
      // Iterate over children nodes and update them
      for (const childId of node.children) {
        const childNode = await findNodeById(childId);

        // Check if the version provided in the request exists for the child node
        const targetChildVersion = childNode.versions.find(
          (v) => v.version === version
        );
        if (targetChildVersion) {
          targetChildVersion.status = status;
          await childNode.save(); // Save the updated child node

          // Recursively update the child node's children
          console.log(`Updating child node ${childNode._id} with status ${status}`);
          await updateNodeStatusRecursively(childNode, status, version); // Recursive call for child node
        }
      }
    }
  }
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

async function tradeValuesBetweenNodes(
  nodeAId,
  versionAIndex,
  valuesA,
  nodeBId,
  versionBIndex,
  valuesB
) {
  const Node = mongoose.model("Node");
  const Transaction = mongoose.model("Transaction");

  // Fetch nodes
  const nodeA = await Node.findById(nodeAId);
  const nodeB = await Node.findById(nodeBId);

  if (!nodeA || !nodeB) {
    throw new Error(`One or both nodes not found.`);
  }

  // Ensure versions exist
  const versionA = nodeA.versions[versionAIndex];
  const versionB = nodeB.versions[versionBIndex];

  if (!versionA || !versionB) {
    throw new Error(`One or both versions not found.`);
  }

  // Perform trade
  for (const [key, value] of Object.entries(valuesA)) {
    if ((versionA.values.get(key) || 0) < value) {
      throw new Error(
        `Node A's version ${versionAIndex} has insufficient ${key}.`
      );
    }
    versionA.values.set(key, (versionA.values.get(key) || 0) - value);
    versionB.values.set(key, (versionB.values.get(key) || 0) + value);
  }

  for (const [key, value] of Object.entries(valuesB)) {
    if ((versionB.values.get(key) || 0) < value) {
      throw new Error(
        `Node B's version ${versionBIndex} has insufficient ${key}.`
      );
    }
    versionB.values.set(key, (versionB.values.get(key) || 0) - value);
    versionA.values.set(key, (versionA.values.get(key) || 0) + value);
  }

  // Save the nodes
  await nodeA.save();
  await nodeB.save();

  // Log the transaction
  const transaction = new Transaction({
    nodeAId: nodeAId,
    nodeBId: nodeBId,
    versionAIndex: versionAIndex,
    versionBIndex: versionBIndex,
    valuesTraded: {
      nodeA: valuesA,
      nodeB: valuesB,
    },
  });

  await transaction.save();
  console.log("Trade completed and transaction logged.");
}

// Trade values between two nodes
app.post("/trade-values", async (req, res) => {
  const { nodeAId, versionAIndex, valuesA, nodeBId, versionBIndex, valuesB } =
    req.body;
  console.log(req.body);
  if (
    nodeAId === undefined ||
    versionAIndex === undefined ||
    valuesA === undefined ||
    nodeBId === undefined ||
    versionBIndex === undefined ||
    valuesB === undefined
  ) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          "Invalid request body. Ensure all required fields are provided.",
      });
  }

  try {
    await tradeValuesBetweenNodes(
      nodeAId,
      versionAIndex,
      valuesA,
      nodeBId,
      versionBIndex,
      valuesB
    );
    res.json({ success: true, message: "Trade completed successfully." });
  } catch (error) {
    console.error("Error during trade:", error);
    res.status(500).json({ success: false, message: error.message });
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
