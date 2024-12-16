import React, { useState, useEffect } from 'react';
import Cookies from "js-cookie";

const RootNodesForm = ({ setRootSelected, rootSelected, rootNodes, setRootNodes }) => {
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState('');
  const [reeffectTime, setReeffectTime] = useState('');





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

    const parentIdValue = null;

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
      setRootNodes((prev) => [...prev, data.newNode._id]);
      setRootSelected(data.newNode._id); // Sync with App

      setName('');
    } catch (error) {
      console.error('Error creating node:', error.message);
    }
  };

  const handleRootSelection = (event) => {
    const selectedId = event.target.value;
    setRootSelected(selectedId); // Sync with App
  };

  return (
    <div>
      
      <div>
        <h3>Existing Root Nodes</h3>
        <select
          value={rootSelected || ''}
          onChange={handleRootSelection}
          style={{ width: '100%', padding: '8px' }}
        >
          <option value="" disabled>Select a root node</option>
          {rootNodes.map((rootNode) => (
            <option key={rootNode} value={rootNode}>
              {rootNode}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit}>
      
        <div>
        <button type="submit">Create New Root</button>
          <label>Node Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>


       
      </form>

    </div>
  );
};

export default RootNodesForm;
