import React, { useState, useEffect } from "react";
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
          />
        </div>
        <div className="notes">
          <Notes nodeSelected={nodeSelected} />
        </div>
      </div>
      <div className="side-content">
        <div className="transaction">
          <Contributions nodeSelected={nodeSelected} />
        </div>
        <div className="schedule">
          <Schedule nodeSelected={nodeSelected} />
        </div>
      </div>
    </div>
  );
};

export default App;
