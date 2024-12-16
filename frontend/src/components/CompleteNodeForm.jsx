import React, { useState } from 'react';
import Cookies from 'js-cookie';

const CompleteNodeForm = ({ nodeSelected, nodeVersion, onComplete  }) => {
  const [showMenu, setShowMenu] = useState(true); // To control the visibility of the menu
  const [status, setStatus] = useState(null); // Store the selected status
  const [loading, setLoading] = useState(false); // Indicate request in progress

  // Handle the action when a status is chosen
  const handleStatusChange = async (selectedStatus) => {
    setStatus(selectedStatus); // Store the selected status
    setLoading(true); // Start loading while the request is sent

    const token = Cookies.get('token');
    if (!token) {
      console.error('No JWT token found!');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/edit-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nodeId: nodeSelected.id, // Pass the selected node's ID
          status: selectedStatus, // Pass the selected status
          version: nodeVersion,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Error updating status:', data);
        throw new Error('Failed to update status');
      }

      console.log(`Node status updated to "${selectedStatus}" successfully:`, data);
      setShowMenu(false); // Hide the menu after confirmation

      onComplete();
    } catch (error) {
      console.error('Error updating node status:', error.message);
    } finally {
      setLoading(false); // Stop loading after the request completes
    }
  };

  return (
    <div>
      {showMenu && (
        <div>
          <h2>Set Node Status</h2>
          <button onClick={() => handleStatusChange('complete')}>Complete</button>
          <button onClick={() => handleStatusChange('inProgress')}>Active</button>
        </div>
      )}

      {status && loading && (
        <div>
          <p>Updating status to {status}.</p>
        </div>
      )}

      {!showMenu && !loading && (
        <div>
          <p>Node status updated to {status}.</p>
        </div>
      )}
    </div>
  );
};

export default CompleteNodeForm;
