import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie"; // Import js-cookie
import TreeView from "./components/TreeView.jsx";
import TreeViewDirectory from "./components/TreeViewDirectory.jsx";
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
  const [rootSelected, setRootSelected] = useState(
    Cookies.get("rootSelected") || null
  ); // Load from cookies if available
  const [nodeSelected, setNodeSelected] = useState(null);
  const [nodeVersion, setNodeVersion] = useState(null);
  const [tree, setTree] = useState(null);

  const [currentViewIndex, setCurrentViewIndex] = useState(0);

  // Array of views
  const views = [TreeView, TreeViewDirectory];

  // Function to handle cycling through views
  const handleToggleView = () => {
    setCurrentViewIndex((prevIndex) => (prevIndex + 1) % views.length);
  };

  const CurrentViewComponent = views[currentViewIndex];

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
    setNodeSelected(null);

    if (rootSelected) {
      getTree(rootSelected);
      Cookies.set("rootSelected", rootSelected);
    }
  }, [rootSelected]);

  const getTree = async (rootId) => {
    try {
      const response = await fetch(`${apiUrl}/get-tree`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          setNodeSelected(updatedNode); // Ensure nodeSelected is updated
        }
      } else {
        //default to root node
        setNodeSelected(data);
        setNodeVersion(data.prestige);
      }
    } catch (error) {
      console.error("Error loading tree:", error);
    }
  };

  const handleLogout = () => {
    // Clear the necessary states
    setIsLoggedIn(false);
    setUsername("");
    setUserId("");
    setRootSelected(null);
    setNodeSelected(null);
    setRootNodes([]);

    // Remove cookies
    Cookies.remove("username");
    Cookies.remove("userId");
    Cookies.remove("loggedIn");
    Cookies.remove("token");
    Cookies.remove("rootSelected");

    // You may also want to reset other app-related states or data, depending on your use case
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

  const renderCurrentView = () => {
    switch (currentViewIndex) {
      case 0:
        return (
          <div className="tree-view">
            <TreeView
              rootSelected={rootSelected}
              getTree={getTree}
              tree={tree}
              nodeSelected={nodeSelected}
              setNodeSelected={setNodeSelected}
              nodeVersion={nodeVersion}
              setNodeVersion={setNodeVersion}
              handleToggleView={handleToggleView} // Pass the toggle function
            />
          </div>
        );
      case 1:
        return (
          <div className="tree-view-directory">
            <TreeViewDirectory
              tree={tree}
              nodeSelected={nodeSelected}
              setNodeSelected={setNodeSelected}
              handleToggleView={handleToggleView} // Pass the toggle function
              nodeVersion={nodeVersion}
              getTree={getTree}
              rootSelected={rootSelected}
            />
          </div>
        );
      default:
        return null;
    }
  };

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
          tree={tree}
        />
      </div>

      {renderCurrentView()}

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
          <Notes
            nodeSelected={nodeSelected}
            userId={userId}
            nodeVersion={nodeVersion}
          />
        </div>
      </div>
      <div className="side-content">
        <div className="schedule">
          <Schedule
            nodeSelected={nodeSelected}
            tree={tree}
            nodeVersion={nodeVersion}
            getTree={getTree}
            rootSelected={rootSelected}
          />
        </div>
        <div className="transaction">
          <Contributions nodeSelected={nodeSelected} />
        </div>
      </div>
    </div>
  );
};

export default App;
