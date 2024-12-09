const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const GoalSchema = new mongoose.Schema({
  value: { type: String, required: false }, // The value being tracked
  reached: { type: Boolean, required: true }, // Whether the goal is reached
  quantifiableGoal: { type: Number, required: false }, // Optional numeric goal
});

const NodeSchema = new mongoose.Schema({
  _id: {
    type: String, // Change to String to store UUID
    default: uuidv4, // Generate UUID by default
  },
  name: { type: String, required: true },
  prestige: { type: Number, default: 0 },
  notes: { type: String, required: true },
  globalValues: { type: Map, of: Number, default: {} }, // Tracks global summed values
  versions: [
    {
      prestige: { type: Number, required: true },
      values: { type: Map, of: Number, default: {} }, // Individual version values
      status: { type: String, default: "active" },
      dateCreated: { type: Date, default: Date.now },
      schedule: { type: Date, default: null },
      reeffectTime: { type: Number, default: 0 },
      goals: [GoalSchema],
    },
  ],
  children: [{ type: String, ref: "Node" }], // References to child nodes
  parent: { type: String, ref: "Node", default: null }, // Reference to the parent node
});



//update parent values from children when values are modified
NodeSchema.methods.updateGlobalValues = async function () {
  const Node = mongoose.model("Node"); // Avoid circular dependency

  // Step 1: Aggregate values from all versions of the current node
  const localValues = new Map();
  this.versions.forEach((version) => {
    version.values.forEach((value, key) => {
      localValues.set(key, (localValues.get(key) || 0) + value);
    });
  });

  // Step 2: Include contributions from child nodes (globalValues)
  const children = await Node.find({ parent: this._id });
  const childValues = new Map();
  for (const child of children) {
    child.globalValues.forEach((value, key) => {
      childValues.set(key, (childValues.get(key) || 0) + value);
    });
  }

  // Step 3: Compute the current node's globalValues as the sum of localValues + childValues
  const newGlobalValues = new Map(localValues);
  childValues.forEach((value, key) => {
    newGlobalValues.set(key, (newGlobalValues.get(key) || 0) + value);
  });

  // Step 4: Update this node's globalValues
  const previousGlobalValues = this.globalValues || new Map();
  this.globalValues = newGlobalValues;

  // Step 5: Calculate the net difference to propagate upwards
  const netChanges = new Map();
  newGlobalValues.forEach((value, key) => {
    const previousValue = previousGlobalValues.get(key) || 0;
    const diff = value - previousValue;
    if (diff !== 0) {
      netChanges.set(key, diff);
    }
  });
  previousGlobalValues.forEach((value, key) => {
    if (!newGlobalValues.has(key)) {
      netChanges.set(key, -value); // Remove values no longer present
    }
  });

  // Step 6: Propagate changes to the parent
  let currentNetChanges = netChanges;
  let currentNode = this;

  while (currentNode.parent) {
    const parentNode = await Node.findById(currentNode.parent);

    if (!parentNode) {
      console.error(`Parent node not found for node: ${currentNode._id}`);
      break;
    }

    const newParentValues = new Map(parentNode.globalValues || new Map());
    currentNetChanges.forEach((change, key) => {
      const previousValue = newParentValues.get(key) || 0;
      const newValue = previousValue + change;

      if (newValue === 0) {
        newParentValues.delete(key);
      } else {
        newParentValues.set(key, newValue);
      }
    });

    parentNode.globalValues = newParentValues;
    await parentNode.save();

    //console.log(`Updated parent node ${parentNode._id} globalValues:`, parentNode.globalValues);

    // Prepare the changes for the next parent
    currentNode = parentNode;
  }
};
//attach the modification to happen anytime a node is saved
NodeSchema.pre("save", async function (next) {
  if (this.isModified("versions")) {
    await this.updateGlobalValues();
  }
  next();
});

//delete node values when branch is deleted and all child nodes
//buggy as shit. after deleting branch edit a value in root node to reupdate tree. 9 hrs wasted
NodeSchema.methods.deleteWithChildrenBottomUp = async function () {
  const Node = mongoose.model("Node");

  try {
    console.log(`Deleting node: ${this._id} with global values: ${JSON.stringify(Object.fromEntries(this.globalValues))}`);

    // Step 1: Find all children of the current node
    const children = await Node.find({ parent: this._id });

    // Step 2: Process each child recursively (to delete all children first)
    for (const child of children) {
      console.log(`Recursive deletion of child: ${child._id}`);
      await child.deleteWithChildrenBottomUp();
    }

    // Step 3: If the current node has a parent, propagate changes to the parent
    if (this.parent) {
      const parentNode = await Node.findById(this.parent);

      if (parentNode) {
        console.log(`Found parent node: ${parentNode._id}`);
        
        // Remove the current node's values from the parent's globalValues
        if (this.globalValues) {
          this.globalValues.forEach((value, key) => {
            const parentValue = parentNode.globalValues.get(key) || 0;
            const newParentValue = parentValue - value;

            console.log(`Updating key ${key}: parent value ${parentValue} - node value ${value} = ${newParentValue}`);

            if (newParentValue === 0) {
              parentNode.globalValues.delete(key); // Delete the key if the new value is zero
            } else {
              parentNode.globalValues.set(key, newParentValue); // Otherwise update with the new value
            }
          });
        }

        console.log(`Parent global values before update: ${JSON.stringify(Object.fromEntries(parentNode.globalValues))}`);

        // Save the updated parent node
        await parentNode.save();

        console.log(`Parent global values after update: ${JSON.stringify(Object.fromEntries(parentNode.globalValues))}`);
      }
    }

    // Step 4: Finally, delete this node
    await this.deleteOne();

  } catch (error) {
    console.error(`Error in deleteWithChildrenBottomUp for node ${this._id}:`, error);
    throw error;
  }
};

//attach the delete script whenever a node is deleted
NodeSchema.pre("findOneAndDelete", async function (next) {
  const Node = mongoose.model("Node");

  // Find the node being deleted
  const nodeId = this.getQuery()._id;
  const node = await Node.findById(nodeId);

  if (node) {
    // Trigger cascading collection and deletion
    await node.deleteWithChildrenBottomUp();
  }

  next(); // Proceed with the original delete operation
});

const Node = mongoose.model("Node", NodeSchema);
module.exports = Node;

//ensure root node on db creation
async function ensureRootNode() {
  const rootNode = await Node.findOneAndUpdate(
    { name: "Root" }, // Find node by name "Root"
    {
      $setOnInsert: { // Only set the following values if the node doesn't exist
        name: "Root",
        prestige: 0,
        notes: "root_notes.md",
        globalValues: { hrs: 0 },
        versions: [
          {
            prestige: 0,
            values: {},
            status: "divider",
            dateCreated: new Date(),
            goals: [],
          },
        ],
        children: [],
        parent: null,
      },
    },
    { upsert: true, new: true } // `upsert: true` ensures that a new document is created if none exists
  );

  if (rootNode) {
    console.log("Root node checked/created successfully");
  } else {
    console.error("Failed to ensure root node");
  }
}

ensureRootNode();
