import React, { useState, useEffect, useCallback  } from "react";
import Cookies from "js-cookie"; // Import js-cookie
import TreeView from "./components/TreeView.jsx";
import NodeData from "./components/NodeData.jsx";
import Notes from "./components/Notes.jsx";
import Contributions from "./components/Contributions.jsx";
import Schedule from "./components/Schedule.jsx";
import AccountTab from "./components/AccountTab.jsx";
import Login from "./components/Login.jsx";
import "./App.css";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // User login state
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [rootNodes, setRootNodes] = useState([]);
  const [rootSelected, setRootSelected] = useState(null);
  const [nodeSelected, setNodeSelected] = useState(null);
  const [nodeVersion, setNodeVersion] = useState(null);
  const [tree, setTree] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;


  // Check cookies on load
  useEffect(() => {
    const storedUsername = Cookies.get("username");
    const storedUserId = Cookies.get("userId");
    const loggedIn = Cookies.get("loggedIn");

    if (loggedIn) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (rootSelected) {
      getTree(rootSelected);
    }
  }, [rootSelected]);

  const getTree = async (rootId) => {
    try {
      const response = await fetch(`${apiUrl}/get-tree`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rootId }),
      });
      if (!response.ok) throw new Error("Failed to fetch tree");
  
      const data = await response.json();
      setTree(data); // Update the tree state
      
      if (nodeSelected) {
        // Find the updated node from the fetched tree data using a recursive search
    
      
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
        
      
        const updatedNode = findNodeById(data, nodeSelected._id);
        
        if (updatedNode) {
          setNodeSelected(updatedNode);  // Ensure nodeSelected is updated
        }
      }
      
    } catch (error) {
      console.error("Error loading tree:", error);
    }
  };
  

  // Handle logout
  const handleLogout = () => {
    Cookies.remove("username");
    Cookies.remove("userId");
    Cookies.remove("loggedIn");
    setIsLoggedIn(false);
    setUsername("");
    setUserId("");
    Cookies.remove("token");
  };

  if (!isLoggedIn) {
    return (
      <Login
        setIsLoggedIn={setIsLoggedIn}
        setUsername={setUsername}
        setUserId={setUserId}
      />
    );
  }

  return (
    <div className="app-container">
      <div className="header">
        <AccountTab
          username={username}
          userId={userId}
          onLogout={handleLogout} // Pass logout function to AccountTab
          setRootNodes={setRootNodes}
          rootNodes={rootNodes}
          setRootSelected={setRootSelected}
          rootSelected={rootSelected}
        />
      </div>
      <div className="tree-view">
        <TreeView
          rootSelected={rootSelected}
          getTree={getTree}
          tree={tree}
          nodeSelected={nodeSelected}
          setNodeSelected={setNodeSelected}
          nodeVersion={nodeVersion}
          setNodeVersion={setNodeVersion}
        />
      </div>

      <div className="main-content">
        <div className="node-data">
          <NodeData
            nodeSelected={nodeSelected}
            nodeVersion={nodeVersion}
            setNodeVersion={setNodeVersion}
            getTree={getTree}
            rootSelected={rootSelected}
            tree={tree}
          />
        </div>
        <div className="notes">
          <Notes nodeSelected={nodeSelected} userId={userId}   nodeVersion={nodeVersion}/>
        </div>
      </div>
      <div className="side-content">
        <div className="transaction">
          <Contributions nodeSelected={nodeSelected} />
        </div>
        <div className="schedule">
          <Schedule nodeSelected={nodeSelected} tree={tree} nodeVersion={nodeVersion}  getTree={getTree}
            rootSelected={rootSelected} />
        </div>
      </div>
    </div>
  );
};

export default App;
