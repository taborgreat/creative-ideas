import React, { useState } from 'react';
import Cookies from "js-cookie";
import AiCreate from './AiCreate'; // Import AiCreate component

const CreateNodeForm = ({ nodeSelected, onComplete }) => {
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState('');
  const [reeffectTime, setReeffectTime] = useState('');
  const [useAI, setUseAI] = useState(false); // Toggle between manual and AI creation

  // Handle form submission for manual creation
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = Cookies.get("token");
    if (!token) {
      console.error('No JWT token found!');
      return;
    }
    

    try {
      const response = await fetch('http://localhost:3000/add-node', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          parentId: nodeSelected._id,
          name,
          schedule,
          reeffectTime,
          isRoot: false,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Error creating node:', data);
        throw new Error('Failed to create node');
      }

      console.log('Node created:', data);

      // Reset state after successful creation
      setName('');
      setSchedule('');
      setReeffectTime('');
      onComplete();
    } catch (error) {
      console.error('Error creating node:', error.message);
    }
  };

  return (
    <div>
      <h1>Create Node</h1>
      
      {/* Switch between Manual and AI */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={useAI}
            onChange={(e) => setUseAI(e.target.checked)}
          />
          Use AI Assistance
        </label>
      </div>

      {/* Manual Node Creation Form */}
      {!useAI ? (
        <form onSubmit={handleSubmit}>
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

          <button type="submit">Create New Node</button>
        </form>
      ) : (
        /* AI-Assisted Node Creation */
        <AiCreate nodeSelected={nodeSelected}/>
      )}
    </div>
  );
};

export default CreateNodeForm;
