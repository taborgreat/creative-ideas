import React, { useEffect, useRef } from 'react';
import TreeViewMenu from './TreeViewMenu';
import cytoscape from 'cytoscape';

const TreeView = ({ rootSelected, nodeSelected, setNodeSelected, setNodeVersion, nodeVersion }) => {
  const cyRef = useRef(null);

  useEffect(() => {
    if (rootSelected) {
      loadTreeFromRoot(rootSelected);
    }
  }, [rootSelected]);

  const loadTreeFromRoot = (rootSelected) => {
    if (!cyRef.current) {
      cyRef.current = cytoscape({
        container: document.getElementById("cy"),
        style: [
          { selector: 'node', style: { 'background-color': 'data(bgColor)', 'label': 'data(name)' } },
          { selector: 'edge', style: { 'width': 2, 'line-color': '#ccc' } },
        ],
        layout: { name: 'breadthfirst', directed: true, padding: 10 },
      });

      cyRef.current.on('tap', 'node', (event) => {
        const nodeId = event.target.id();
        const tappedNode = cyRef.current.getElementById(nodeId).data(); // Get the full node data
        setNodeSelected(tappedNode); // Set the full node object
        setNodeVersion(tappedNode.prestige)
        console.log(tappedNode); // Log the full node object for testing
      });
    }

    const cyInstance = cyRef.current;
    cyInstance.elements().remove();

    fetch('http://localhost:3000/get-tree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rootId: rootSelected }),
      })
      
      .then((res) => res.json())
      .then((data) => {
        addTreeToCytoscape(data, cyInstance);
        cyInstance.layout({ name: 'breadthfirst' }).run();
        console.log(data)
      })
      .catch((err) => console.error('Error loading tree:', err));
  };

  const addTreeToCytoscape = (node, cyInstance) => {
    const bgColor = node.status === 'active' ? 'green' : node.status === 'trimmed' ? 'red' : '#666';
    cyInstance.add({ 
    
    
      data: {
        id: node._id,
        name: `${node.name} `,
        notes: node.notes || null,
        values: node.globalValues,
        status: node.versions[node.prestige].status,
        prestige: node.prestige,
        versions: node.versions,
        rootOwner: node.rootOwner,
        contributors: node.contributors,
        bgColor

      },
    }
    );
    (node.children || []).forEach((child) => addTreeToCytoscape(child, cyInstance));
  };

  return  <div>
  <div id="cy" style={{ width: '100%', height: '600px' }} />
  {/* Add TreeViewMenu below the Cytoscape div */}
  <div className="selected-node">
        {nodeSelected ? (
          <p>{`${nodeSelected.name}`}</p>
        ) : (
          <p>No node selected</p>
        )}
      </div>
      <TreeViewMenu nodeSelected={nodeSelected} nodeVersion={nodeVersion} />
</div>
};

export default TreeView;
