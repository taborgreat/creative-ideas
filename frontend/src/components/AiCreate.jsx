import React, { useState } from 'react';

const AiCreate = ({ nodeSelected }) => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [planDescription, setPlanDescription] = useState('');
  const [depth, setDepth] = useState(50); // Default slider value
  const [treeBranch, setTreeBranch] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  const fetchFromServer = async () => {
  setLoading(true);

  // Fetch the tree branch data before sending AI request
  await fetchTreeBranch();
  
  // Convert treeBranch into a JSON string before inserting it into the content field
  const treeBranchString = JSON.stringify(treeBranch);

  const payload = {
    messages: [
      { 
        role: 'user', 
        content: `create nodes off of this to ${planDescription} using same values and structure ${treeBranchString} and Please output a strict JSON object with the same exact same keys. from ${depth} out of 100 in detail` 
      },
    ],
    model: 'gemma2-9b-it',
    temperature: 1,
    max_tokens: 5000, // Adjust token limit if necessary
    top_p: 1,
    stop: null,
  };

  try {
    const serverResponse = await fetch(`${apiUrl}/AiResponse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  
    const result = await serverResponse.json();
  
    // Debug the full response object
    console.log('Full response:', result);
  
    if (result.success && result.data) {
      // Parse the 'data' field since it's a JSON string
      const data = JSON.parse(result.data);
  
      // Check if 'choices' array exists and has items
      if (Array.isArray(data.choices) && data.choices.length > 0) {
        const content = data.choices[0].message.content;
  
        console.log('Response content:', content);
        setResponse(content);
      } else {
        console.error('No choices found in the response.');
        setResponse('Error: No choices found.');
      }
    } else {
      console.error('Invalid response format: result.data is undefined');
      setResponse('Error: Invalid response format.');
    }
  } catch (error) {
    console.error('Error:', error);
    setResponse('Error communicating with the server.');
  } finally {
    setLoading(false);
  }
  

};


  // Fetch parent tree branch
  const fetchTreeBranch = async () => {
    setLoading(true);
    setTreeBranch([]); // Clear previous treeBranch data

    try {
      const serverResponse = await fetch(`${apiUrl}/get-parents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ childId: nodeSelected.id }),
      });

      const result = await serverResponse.json();
      if (serverResponse.ok) {
        setTreeBranch(result); // Update treeBranch state with the result
        console.log(result); // Log the fetched tree branch for debugging
      } else {
        console.error(result.message || 'Error fetching tree branch.');
        setTreeBranch([]);
      }
    } catch (error) {
      console.error(error);
      setTreeBranch([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>AI Creation</h1>

      {/* Plan Description Input */}
      <div>
        <label htmlFor="plan-description">Plan Description:</label>
        <textarea
          id="plan-description"
          value={planDescription}
          onChange={(e) => setPlanDescription(e.target.value)}
          placeholder="Describe your plan..."
          rows="4"
          style={{ width: '100%' }}
        />
      </div>

      {/* Depth of Planning Slider */}
      <div>
        <label htmlFor="depth-slider">Depth of Planning: {depth}</label>
        <input
          id="depth-slider"
          type="range"
          min="1"
          max="100"
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
        />
      </div>

      {/* AI Response Section */}
      <div>
        <h2>AI Response</h2>
        <button onClick={fetchFromServer} disabled={loading}>
          {loading ? 'Loading...' : 'Generate AI Response'}
        </button>
        <div>
          <pre>{response}</pre>
        </div>
      </div>
    </div>
  );
};

export default AiCreate;
