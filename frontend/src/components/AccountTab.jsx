import React, { useState } from 'react';
import RootNodesForm from './RootNodesForm'; // Ensure the path is correct
import Invites from './Invites'; // Import the new Invites component
import './AccountTab.css';

const AccountTab = ({ username, userId, onLogout, rootNodes, setRootNodes, rootSelected, setRootSelected }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showRoots, setShowRoots] = useState(false); // State to toggle RootNodesForm visibility
  const [showInvites, setShowInvites] = useState(false); // State to toggle Invites visibility

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout(); // Trigger the logout function passed as a prop
    }
  };

  const toggleRootsForm = () => {
    setShowRoots((prev) => !prev); // Toggle the form visibility
  };

  const toggleInvites = () => {
    setShowInvites((prev) => !prev); // Toggle the Invites visibility
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
            <p>Username: {username}</p>
            <button onClick={handleLogoutClick}>Logout</button>
            <button onClick={toggleRootsForm}>
              {showRoots ? 'Hide Roots' : 'Show Roots'}
            </button>
            <button onClick={toggleInvites}>
              {showInvites ? 'Hide Invites' : 'Show Invites'}
            </button>
          </div>
        ) : (
          <p>Profile</p>
        )}
      </span>

      {showRoots && (
        <div className="account-tab-content">
          <RootNodesForm 
            rootNodes={rootNodes} 
            setRootNodes={setRootNodes}
            setRootSelected={setRootSelected}
            rootSelected={rootSelected}
            userId={userId}
          />
        </div>
      )}

      {showInvites && (
        <div className="account-tab-content-2">
          <Invites userId={userId} />
        </div>
      )}
    </div>
  );
};

export default AccountTab;
