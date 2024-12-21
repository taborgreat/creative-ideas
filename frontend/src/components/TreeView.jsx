import React, { useEffect, useRef } from 'react';
import TreeViewMenu from './TreeViewMenu';
import cytoscape from 'cytoscape';

const TreeView = ({ rootSelected, nodeSelected, setNodeSelected, setNodeVersion, nodeVersion, tree, getTree }) => {
  const cyRef = useRef(null);

  const addTreeToCytoscape = (node, cyInstance, parentId = null) => {
    const bgColor = node.versions[node.prestige].status === 'active' ? 'green' : node.status === 'trimmed' ? 'red' : '#666';
    cyInstance.add({
      data: {
        id: node._id,
        name: `${node.name} `,
        values: node.globalValues,
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

    (node.children || []).forEach((child) => addTreeToCytoscape(child, cyInstance, node._id));
  };

  useEffect(() => {
    if (!cyRef.current) {
      cyRef.current = cytoscape({
        container: document.getElementById("cy"),
        style: [
          { selector: 'node', style: { 'background-color': 'data(bgColor)', 'label': 'data(name)' } },
          { selector: 'edge', style: { 'width': 2, 'line-color': '#ccc' } },
        ],

      });

      cyRef.current.on('tap', 'node', (event) => {
        const nodeId = event.target.id();
        const tappedNode = cyRef.current.getElementById(nodeId).data(); // Get the full node data
        setNodeSelected(tappedNode); // Set the full node object
        setNodeVersion(tappedNode.prestige);
      });
    }

    const cyInstance = cyRef.current;
    cyInstance.elements().remove(); // Remove previous elements

    if (tree) {
      addTreeToCytoscape(tree, cyInstance); // Use the passed `tree` prop

      // Apply layout once after tree nodes and edges are added
      cyInstance.layout({ name: 'breadthfirst', directed: true,  transform: function(node, position) {
        // Invert the y coordinate to flip the tree
        return {
          x: position.x,
          y: -position.y  // Negating the y coordinate flips the tree
        };
      }}).run();
    
      console.log(tree);

      const rootNode = cyInstance.getElementById(rootSelected);
      cyInstance.center(rootNode); // Focus on the root node
      
  
    }



  }, [tree, setNodeSelected, setNodeVersion]);

  // Use effect to adjust the camera when nodeSelected changes
  useEffect(() => {
    const cyInstance = cyRef.current;
    if (cyInstance && nodeSelected) {
      const selectedNode = cyInstance.getElementById(nodeSelected.id);
      if (selectedNode) {
        // Animate the camera to focus on the selected node and bring it to the top of the viewport
        cyInstance.center(selectedNode); // Focus the camera on the selected node
  
      }
    }
  }, [nodeSelected]);

  return (
    <div>
      <div id="cy" style={{ width: '100%', height: '600px' }} />
      <div className="selected-node">
        {nodeSelected ? (
          <p>{`${nodeSelected.name}`}</p>
        ) : (
          <p>No node selected</p>
        )}
      </div>
      <TreeViewMenu nodeSelected={nodeSelected} nodeVersion={nodeVersion} getTree={getTree} rootSelected={rootSelected} />
    </div>
  );
};

export default TreeView;
