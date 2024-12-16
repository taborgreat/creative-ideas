import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

const NodeData = ({ nodeSelected, nodeVersion, setNodeVersion }) => {
  const [keyValuePairs, setKeyValuePairs] = useState([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [editKey, setEditKey] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (nodeSelected && nodeVersion !== null) {
      const version = nodeSelected.versions[nodeVersion];  // Get the version by index
      if (version?.values) {
        setKeyValuePairs(Object.entries(version.values));  // Set key-value pairs from the version
      } else {
        setKeyValuePairs([]);  // No values for this version
      }
    } else {
      setKeyValuePairs([]);  // If no nodeSelected or version
    }
  }, [nodeVersion, nodeSelected]);  // Dependency array ensures the effect runs when nodeVersion or nodeSelected changes

  // Handle version change when selecting a new version from the dropdown
  const handleGenerationChange = (e) => {
    const selectedIndex = e.target.value;  // Get selected index as string
    setNodeVersion(Number(selectedIndex));  // Update nodeVersion index
  };

  const handleSaveValue = async (key, value) => {
    const token = Cookies.get("token");
    if (!token) {
      console.error("No JWT token found!");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/edit-value", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nodeId: nodeSelected.id,
          key,
          value,
          version: nodeVersion,
        }),
      });

      if (response.ok) {
        // Fetch updated values after saving
        const updatedVersion = nodeSelected.versions[nodeVersion];
        if (updatedVersion?.values) {
          setKeyValuePairs(Object.entries(updatedVersion.values)); // Update the key-value pairs from backend
        } else {
          setKeyValuePairs([]); // No values
        }

        setEditKey(null); // Reset editing
        setNewKey("");
        setNewValue("");
      } else {
        console.error("Failed to save value:", await response.text());
      }
    } catch (error) {
      console.error("Error saving value:", error);
    }
  };

  const handlePrestige = async () => {
    const token = Cookies.get("token");
    if (!token) {
      console.error("No JWT token found!");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/add-prestige", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nodeId: nodeSelected.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log("Prestige added successfully!");
        } else {
          console.error("Failed to add prestige:", data.message);
        }
      } else {
        console.error("Failed to add prestige:", await response.text());
      }
    } catch (error) {
      console.error("Error adding prestige:", error);
    }
  };

  return (
    <div>
      <h3>Node Data</h3>
      {nodeSelected ? (
        <div>
          <p>
            <strong>Name:</strong> {nodeSelected.name}
          </p>
          <p>
            <strong>ID:</strong> {nodeSelected.id}
          </p>

          {/* Generation Selector */}
          <div>
            <label>Prestige: </label>
            <select
              value={nodeVersion}  // Reflect the index of selected version
              onChange={handleGenerationChange}
              style={{ padding: "5px" }}
            >
              {nodeSelected.versions.map((version, index) => (
                <option key={version._id} value={index}>
                  Prestige: {version.prestige}
                </option>
              ))}
            </select>
            {/* Prestige Button */}
            <div style={{ marginTop: "10px" }}>
              <button onClick={handlePrestige}>Add Prestige</button>
            </div>
          </div>

          {/* Values List */}
          <h5>Version Values</h5>
          <table
            style={{
              width: "100%",
              border: "1px solid #ddd",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {keyValuePairs.map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>
                    {editKey === key ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                      />
                    ) : (
                      JSON.stringify(value)
                    )}
                  </td>
                  <td>
                    {editKey === key ? (
                      <button onClick={() => handleSaveValue(key, editValue)}>
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditKey(key);
                          setEditValue(value);
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <input
                    type="text"
                    placeholder="New Key"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="New Value"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  />
                </td>
                <td>
                  <button onClick={() => handleSaveValue(newKey, newValue)}>
                    Add
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p>No node selected</p>
      )}
    </div>
  );
};

export default NodeData;
