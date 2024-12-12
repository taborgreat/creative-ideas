import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

const TreeView = ({ rootSelected, nodeSelected, setNodeSelected }) => {
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
        setNodeSelected(nodeId);
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
      })
      .catch((err) => console.error('Error loading tree:', err));
  };

  const addTreeToCytoscape = (node, cyInstance) => {
    const bgColor = node.status === 'active' ? 'green' : node.status === 'trimmed' ? 'red' : '#666';
    cyInstance.add({ data: { id: node._id, name: node.name, status: node.status, bgColor } });
    (node.children || []).forEach((child) => addTreeToCytoscape(child, cyInstance));
  };

  return <div id="cy" style={{ width: '100%', height: '600px' }} />;
};

export default TreeView;
