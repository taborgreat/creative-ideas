import React, { useState } from 'react';
import RootNodesForm from './RootNodesForm'; // Ensure the path is correct
import './AccountTab.css';
  
const AccountTab = ({ username, userId, onLogout, rootNodes, setRootNodes,  rootSelected, setRootSelected }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showRoots, setShowRoots] = useState(false); // State to toggle RootNodesForm visibility


  
  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout(); // Trigger the logout function passed as a prop
    }
  };

  const toggleRootsForm = () => {
    setShowRoots((prev) => !prev); // Toggle the form visibility
  };

  return (
    <div
      className="account-tab"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="account-info">
        {isHovered ? (
          <div>
            <p>Account Name: {username}</p>
            <p>User ID: {userId}</p>
            <button onClick={handleLogoutClick}>Logout</button>
            <button onClick={toggleRootsForm}>
              {showRoots ? 'Hide Roots' : 'Show Roots'}
            </button>
          </div>
        ) : (
          <p>Profile</p>
        )}
      </span>
      {showRoots  && <div className="account-tab-content">
          <RootNodesForm 
            rootNodes={rootNodes} 
            setRootNodes={setRootNodes}
            setRootSelected={setRootSelected}
            rootSelected={rootSelected}
          />
        </div>}
    </div>
  );
};

export default AccountTab;
