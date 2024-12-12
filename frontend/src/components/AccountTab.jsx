import React, { useState } from 'react';
import "./AccountTab.css";

const AccountTab = ({ username, userId, onLogout }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();  // Trigger the logout function passed as a prop
    }
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
          </div>
        ) : (
          <p>Profile</p>
        )}
      </span>
    </div>
  );
};

export default AccountTab;
