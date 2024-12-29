import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import './NodeData.css'; 

const NodeData = ({ nodeSelected, nodeVersion, setNodeVersion }) => {
  const [keyValuePairs, setKeyValuePairs] = useState([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [goals, setGoals] = useState({});
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalInput, setGoalInput] = useState("");

  useEffect(() => {
    if (nodeSelected && nodeVersion !== null) {
      const version = nodeSelected.versions[nodeVersion];

      if (version?.values) {
        setKeyValuePairs(Object.entries(version.values));
      } else {
        setKeyValuePairs([]);
      }

      if (version?.goals && typeof version.goals === "object") {
        const goalsObj = {};
        Object.entries(version.goals).forEach(([key, value]) => {
          goalsObj[key] = value;
        });

        setGoals(goalsObj);
      } else {
        setGoals({});
      }
    } else {
      setKeyValuePairs([]);
      setGoals({});
    }
  }, [nodeVersion, nodeSelected]);

  const handleGenerationChange = (e) => {
    const selectedIndex = e.target.value;
    setNodeVersion(Number(selectedIndex));
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

  const handleGoalClick = (key) => {
    setEditingGoal(key);
    setGoalInput(goals[key] || "");
  };

  const handleGoalChange = (e) => {
    setGoalInput(e.target.value);
  };

  const handleGoalSave = async (key) => {
    const token = Cookies.get("token");
    if (!token) {
      console.error("No JWT token found!");
      return;
    }

    try {
      const goal = goalInput;
      const response = await fetch("http://localhost:3000/edit-goal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nodeId: nodeSelected.id,
          key,
          goal,
          version: nodeVersion,
        }),
      });

      if (response.ok) {
        setGoals((prev) => ({ ...prev, [key]: goal }));
        setEditingGoal(null);
        setGoalInput("");
      } else {
        console.error("Failed to save goal:", await response.text());
      }
    } catch (error) {
      console.error("Error saving goal:", error);
    }
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
        setKeyValuePairs((prev) =>
          prev.map(([k, v]) => (k === key ? [k, value] : [k, v]))
        );
        setEditingKey(null);
        setEditingValue("");
      } else {
        console.error("Failed to save value:", await response.text());
      }
    } catch (error) {
      console.error("Error saving value:", error);
    }
  };

  const handleValueClick = (key, value) => {
    setEditingKey(key);
    setEditingValue(value);
  };

  const handleValueChange = (e) => {
    setEditingValue(e.target.value);
  };

  return (
    <div className="node-data-container">
      <h3>Node Data</h3>
  
      {nodeSelected ? (
        <>
          {/* Top Left Section */}
          <div className="topLeft">
            <p>
              <strong>Name:</strong> {nodeSelected.name}
            </p>
            <p>
              <strong>ID:</strong> {nodeSelected.id}
            </p>
            <p>
              <strong>Status:</strong> {nodeSelected.versions[nodeVersion].status}
            </p>
            {/* Generation Selector */}
            <div>
              <label>Prestige: </label>
              <select
                value={nodeVersion}
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
          </div>
  
          {/* Top Right Section */}
          <div className="topRight">
            <h5>Global Values</h5>
            <table
              style={{
                width: "100%",
                border: "1px solid #ddd",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th>Value</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {nodeSelected.globalValues &&
                  Object.entries(nodeSelected.globalValues).map(
                    ([key, value], index) => (
                      <tr key={index}>
                        <td>{key}</td>
                        <td>{value}</td>
                      </tr>
                    )
                  )}
              </tbody>
            </table>
          </div>
  
          {/* Bottom Half Section */}
          <div className="bottomHalf">
            <h5>Version Values and Goals</h5>
            <table
              style={{
                width: "100%",
                border: "1px solid #ddd",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th>Value</th>
                  <th>Amount</th>
                  <th>Goal</th>
                </tr>
              </thead>
              <tbody>
                {keyValuePairs.map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>
                      {editingKey === key ? (
                        <div>
                          <input
                            type="text"
                            value={editingValue}
                            onChange={handleValueChange}
                            placeholder="Edit value"
                            autoFocus
                          />
                          <button onClick={() => handleSaveValue(key, editingValue)}>
                            Save
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => handleValueClick(key, value)}
                          style={{ cursor: "pointer" }}
                        >
                          {value}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingGoal === key ? (
                        <div>
                          <input
                            type="text"
                            value={goalInput}
                            onChange={handleGoalChange}
                            placeholder="Enter goal"
                          />
                          <button onClick={() => handleGoalSave(key)}>
                            Save
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => handleGoalClick(key)}
                          style={{ cursor: "pointer" }}
                        >
                          {goals[key] !== undefined ? goals[key] : "No goal set"}
                        </span>
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
        </>
      ) : (
        <p>No node selected</p>
      )}
    </div>
  );}
  

export default NodeData;
