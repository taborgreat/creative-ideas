import React, { useState, useEffect } from 'react';
import Cookies from "js-cookie";

const RootNodesForm = ({ setRootSelected }) => {
  const [parentId, setParentId] = useState('');
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState('');
  const [reeffectTime, setReeffectTime] = useState('');
  const [rootNodes, setRootNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null); // Track selected node

  useEffect(() => {
    const fetchRootNodes = async () => {
      const token = Cookies.get('token');

      if (!token) {
        console.error('No JWT token found!');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/get-root-nodes', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log(data);

        if (response.ok) {
          if (Array.isArray(data.roots)) {
            setRootNodes(data.roots);
          } else {
            console.error('Invalid root node data structure:', data);
          }
        } else {
          console.error('Failed to fetch root nodes:', data.message);
        }
      } catch (error) {
        console.error('Error fetching root nodes:', error);
      }
    };

    fetchRootNodes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = Cookies.get("token");
    if (!token) {
      console.error('No JWT token found!');
      return;
    }

    const parentIdValue = parentId ? parentId : null;

    try {
      const response = await fetch('http://localhost:3000/add-node', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          parentId: parentIdValue,
          name,
          schedule,
          reeffectTime,
          isRoot: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error('Error creating node:', data);
        throw new Error('Failed to create node');
      }

      console.log('Node created:', data);
      setRootNodes((prev) => [...prev, data.id]);
      setName('');
      setSchedule('');
      setReeffectTime('');
      setParentId('');
    } catch (error) {
      console.error('Error creating node:', error.message);
    }
  };

  const handleRootClick = (rootNodeId) => {
    setSelectedNode(rootNodeId); // Set the selected node
    setRootSelected(rootNodeId);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Parent Node ID (Optional):</label>
          <input
            type="text"
            value={parentId || ''}
            onChange={(e) => setParentId(e.target.value)}
            placeholder="Enter custom Parent Node ID (or leave empty)"
          />
        </div>

        <div>
          <label>Node Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Schedule:</label>
          <input
            type="datetime-local"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          />
        </div>

        <div>
          <label>Reeffect Time:</label>
          <input
            type="number"
            value={reeffectTime}
            onChange={(e) => setReeffectTime(e.target.value)}
          />
        </div>

        <button type="submit">Create New Root</button>
      </form>

      <div>
        <h3>Existing Root Nodes</h3>
        <ul>
          {rootNodes.map((rootNode) => (
            <li
              key={rootNode}
              onClick={() => handleRootClick(rootNode)}
              style={{
                cursor: 'pointer',
                color: selectedNode === rootNode ? 'blue' : 'black', // Highlight selected node
              }}
            >
              {rootNode}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RootNodesForm;
