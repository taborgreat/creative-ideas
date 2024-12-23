import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";

const Contributions = ({ nodeSelected }) => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch contributions data from the server
  const fetchContributions = useCallback(async () => {
    const token = Cookies.get("token");
    if (!token) {
      console.error('No JWT token found!');
      return;
    }
    if (!nodeSelected || !nodeSelected.id) {
      console.error("Node ID is not available");
      return;
    }

    if (loading) return; // Prevent multiple simultaneous requests
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/get-contributions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token for authentication
        },
        body: JSON.stringify({
          nodeId: nodeSelected.id,
        }),
      });

      if (!response.ok) {
        console.error("Failed to fetch contributions:", response.statusText);
        return;
      }

      const data = await response.json();
      if (data.contributions && data.contributions.length > 0) {
        setContributions(data.contributions);
      } else {
        console.log("No contributions found.");
      }
    } catch (error) {
      console.error("Error fetching contributions:", error);
    } finally {
      setLoading(false);
    }
  }, [nodeSelected]);  // Only depend on `nodeSelected`

  // Trigger fetching of data when the component is mounted or nodeSelected changes
  useEffect(() => {
    if (!loading) {  // Make sure we're not already fetching data
      fetchContributions();
    }
  }, [nodeSelected, fetchContributions]);  // Only depend on `nodeSelected` and `fetchContributions`

  return (
    <div style={{ maxHeight: "400px", overflowY: "auto" }}>
      <h3>Contributions</h3>
      <ul>
        {contributions.map((contribution) => (
          <li key={contribution._id}>
            <p><strong>Username:</strong> {contribution.username}</p>
            <p><strong>Action:</strong> {contribution.action}</p>
            <p><strong>Node Version:</strong> {contribution.nodeVersion}</p>
            
            {/* Conditional rendering based on the action */}
            {contribution.additionalInfo && (
              <div>
                {contribution.action === "editValue" && (
                  <p><strong>Edited Value:</strong> {JSON.stringify(contribution.additionalInfo)}</p>
                )}
                {contribution.action === "statusChange" && (
                  <p><strong>Status:</strong> {contribution.additionalInfo}</p>
                )}
                {contribution.action === "trade" && (
                  <p><strong>Trade ID:</strong> {contribution.additionalInfo}</p>
                )}
              </div>
            )}
            
            <p><strong>Date:</strong> {new Date(contribution.date).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Contributions;
