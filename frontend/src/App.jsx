import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie'; // Import js-cookie
import TreeView from './components/TreeView.jsx';
import NodeData from './components/NodeData.jsx';
import Notes from './components/Notes.jsx';
import Contributions from './components/Contributions.jsx';
import Schedule from './components/Schedule.jsx';
import RootNodesForm from './components/RootNodesForm.jsx'
import AccountTab from './components/AccountTab.jsx';
import Login from './components/Login.jsx';
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // User login state
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [rootNodes, setRootNodes] = useState([]);
  const [rootSelected, setRootSelected] = useState(null);
  const [nodeSelected, setNodeSelected] = useState(null);


  // Check cookies on load
  useEffect(() => {
    const storedUsername = Cookies.get('username');
    const storedUserId = Cookies.get('userId');
    const loggedIn = Cookies.get('loggedIn');

    if (loggedIn) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setUserId(storedUserId);
    }
  }, []);

   // Handle logout
   const handleLogout = () => {
    Cookies.remove('username');
    Cookies.remove('userId');
    Cookies.remove('loggedIn');
    setIsLoggedIn(false);
    setUsername('');
    setUserId('');
    Cookies.remove("token");
  };

  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} setUserId={setUserId} />;
  }

  return (
    <div className="app-container">
    <div className="header">
      <AccountTab 
        username={username} 
        userId={userId} 
        onLogout={handleLogout} // Pass logout function to AccountTab
      />
    </div>
    <div className="tree-view">
        <TreeView 
          rootNodes={rootNodes} 
          rootSelected={rootSelected} 
          nodeSelected={nodeSelected}
          setRootSelected={setRootSelected} 
          setNodeSelected={setNodeSelected}
         
        />
        <RootNodesForm setRootSelected={setRootSelected} />
      </div>
      <div className="main-content">
      <div className="selected-root">
        <h3>Selected Root:</h3>
        {rootSelected ? (
          <p>{`ID: ${rootSelected}`}</p>
        ) : (
          <p>No root selected</p>
        )}
      </div>
        <div className="node-data">
          <NodeData nodeSelected={nodeSelected} />
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
