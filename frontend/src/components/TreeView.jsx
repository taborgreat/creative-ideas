import React, { useEffect, useState, useRef } from "react";
import TreeViewMenu from "./TreeViewMenu";
import cytoscape from "cytoscape";

// Utility function to recursively search for a node by its id
const findNodeById = (node, id) => {
  if (node._id === id) {
    return node;
  }

  // Check children recursively
  for (let child of node.children || []) {
    const foundNode = findNodeById(child, id);
    if (foundNode) {
      return foundNode;
    }
  }

  // Return null if not found
  return null;
};

const TreeView = ({
  rootSelected,
  nodeSelected,
  setNodeSelected,
  setNodeVersion,
  nodeVersion,
  tree,
  getTree,
  handleToggleView
}) => {
  const [filters, setFilters] = useState({
    active: true,
    trimmed: false,
    completed: false,
  });

  const cyRef = useRef(null);

  // Function to handle node selection by id to set nodeselected object from tree
  const selectNodeById = (id) => {
    const selectedNode = findNodeById(tree, id);

    if (selectedNode) {
      setNodeSelected(selectedNode);
    }
  };

  useEffect(() => {
    if (!cyRef.current || !tree) return;
  
    // Remove old event listeners before adding new ones
    cyRef.current.off('tap', 'node');
  
    // Attach the event listener after the div switch
    cyRef.current.on('tap', 'node', (event) => {
      const nodeId = event.target.id();
      const tappedNode = cyRef.current.getElementById(nodeId).data();
  
      // Remove the 'selected' class from all nodes
      cyRef.current.nodes().removeClass('selected');
  
      // Add the 'selected' class to the tapped node
      event.target.addClass('selected');
  
      selectNodeById(tappedNode.id);
      setNodeVersion(tappedNode.prestige);
    });
  }, [tree]); // Re-run effect when tree changes or div is updated
  

    

    

  


  const addTreeToCytoscape = (node, cyInstance, parentId = null) => {
    let bgColor;

    switch (node.versions[node.prestige].status) {
      case "active":
        bgColor = "green";
        break;
      case "trimmed":
        bgColor = "red";
        break;
      case "completed":
        bgColor = "#DAA520";
        break;
      default:
        bgColor = "#ccc";
        break;
    }

    // Only add the node if it matches one of the selected filters
    if (
      (filters.active && node.versions[node.prestige].status === "active") ||
      (filters.trimmed && node.versions[node.prestige].status === "trimmed") ||
      (filters.completed && node.versions[node.prestige].status === "completed")
    ) {
      cyInstance.add({
        data: {
          id: node._id,
          name: `${node.name} `,
          globalValues: node.globalValues,
          status: node.versions[node.prestige].status,
          prestige: node.prestige,
          versions: node.versions,
          rootOwner: node.rootOwner,
          contributors: node.contributors,
          bgColor,
        },
      });

      // If a parent exists, create an edge between the parent and the current node
      if (parentId) {
        cyInstance.add({
          data: {
            source: parentId,
            target: node._id,
          },
        });
      }

      
      (node.children || []).forEach((child) =>
        addTreeToCytoscape(child, cyInstance, node._id)
      );
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: checked,
    }));
  };

  useEffect(() => {
    if (!cyRef.current) {
      cyRef.current = cytoscape({
        container: document.getElementById("cy"),
        style: [
          {
            selector: "node",
            style: { "background-color": "data(bgColor)", label: "data(name)" },
          },
          { selector: "edge", style: { width: 2, "line-color": "#ccc" } },
          {
            selector: "node.selected",
            style: {
              "border-width": 4,
              "border-color": "#FF4500",
              "border-style": "dashed",
            },
          },
          {
            selector: "node.root",
            style: {
              "border-width": 4,
              "border-color": "#FFD700",
              "border-style": "solid",
            },
          },
        ],
      });
    }

    const cyInstance = cyRef.current;
    cyInstance.elements().remove(); // Remove previous elements

    if (tree) {
      addTreeToCytoscape(tree, cyInstance);

      // Apply layout after nodes and edges are added
      cyInstance
        .layout({
          name: "breadthfirst",
          directed: true,
          spacingFactor: 1.1,
          maximal: true,
          avoidOverlap: true,
          nodeDimensionsIncludeLabels: true,
          transform: function (node, position) {
            return {
              x: position.x,
              y: -position.y,
            };
          },
        })
        .run();

      cyInstance.fit();
      cyInstance.zoom({
        level: 0.5,
      });

      const rootNode = cyInstance.getElementById(rootSelected);
      if (rootNode) rootNode.addClass("root");
      cyInstance.center(rootNode);
    }
  }, [tree, nodeSelected, setNodeVersion, rootSelected, filters]);

  useEffect(() => {
    const cyInstance = cyRef.current;
    if (cyInstance && nodeSelected) {
      cyInstance.nodes().removeClass("selected");

      const selectedNode = cyInstance.getElementById(nodeSelected._id);
      if (selectedNode) {
        selectedNode.addClass("selected");

        const position = selectedNode.position();
        cyInstance.animate(
          {
            center: {
              eles: selectedNode,
            },
            zoom: 1.5,
            padding: 50,
          },
          {
            duration: 500,
            easing: "ease-out-cubic",
          }
        );
      }
    }
  }, [nodeSelected]);

  return (
    
    <div>
      
      <div style={{ height: "100%" }}>  {/* Make the parent container 100% of the viewport height */}
  <div id="cy" style={{ width: "100%", height: "700px" }} />  {/* Child takes 80% of parent height */}
</div>
    

    
   
      {/* Filter checkboxes */}
      <div className="filters">
        <label>
          <input
            type="checkbox"
            name="active"
            checked={filters.active}
            onChange={handleFilterChange}
          />
          Active
        </label>
        <label>
          <input
            type="checkbox"
            name="trimmed"
            checked={filters.trimmed}
            onChange={handleFilterChange}
          />
          Trimmed
        </label>
        <label>
          <input
            type="checkbox"
            name="completed"
            checked={filters.completed}
            onChange={handleFilterChange}
          />
          Completed
        </label>
      </div>

      <TreeViewMenu
        nodeSelected={nodeSelected}
        nodeVersion={nodeVersion}
        getTree={getTree}
        rootSelected={rootSelected}
        handleToggleView={handleToggleView}
      />
    </div>
  );
};



export default TreeView;
