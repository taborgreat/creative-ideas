import React, { useState, useEffect } from 'react';
import './Schedule.css';

const extractSchedules = (node, schedules = []) => {
  if (node.versions && node.versions.length > 0) {
    node.versions.forEach((version) => {
      if (version) {
        schedules.push({
          nodeId: node._id,
          nodeName: node.name,
          status: version.status,
          schedule: version.schedule,
          dateCreated: version.dateCreated,
        });
      }
    });
  }

  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => extractSchedules(child, schedules));
  }

  return schedules;
};

const Schedule = ({ nodeSelected, tree }) => {
  if (!nodeSelected) {
    return <div><h3>Schedule</h3><p>No node selected</p></div>;
  }

  const [statusFilter, setStatusFilter] = useState({
    active: true,
    trimmed: false,
    complete: false,
  });

  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [choppedTree, setChoppedTree] = useState(null);

  const chopTree = (node, nodeId) => {
    if (node._id === nodeId.id) {
      return { ...node };
    }

    if (node.children && node.children.length > 0) {
      for (let child of node.children) {
        const result = chopTree(child, nodeId);
        if (result) {
          return result;
        }
      }
    }

    return null;
  };

  useEffect(() => {
    if (nodeSelected && tree) {
      const chopped = chopTree(tree, nodeSelected);
      setChoppedTree(chopped);
    }
  }, [nodeSelected, tree]);

  useEffect(() => {
    if (choppedTree) {
      const schedules = extractSchedules(choppedTree);
      const filtered = schedules.filter((schedule) => statusFilter[schedule.status]);
      setFilteredSchedules(filtered);
    }
  }, [statusFilter, choppedTree]);

  const handleStatusChange = (status) => {
    setStatusFilter((prevState) => ({
      ...prevState,
      [status]: !prevState[status],
    }));
  };

  const today = new Date();
  const todaySchedules = [];
  const upcomingSchedules = [];
  const floatingSchedules = [];

  filteredSchedules.forEach((schedule) => {
    const scheduleDate = new Date(schedule.schedule);
  
    if (!schedule.schedule) {
      // Classify as floating if there is no schedule
      floatingSchedules.push(schedule);
    } else {
      const timeDiff = scheduleDate - today;
  
      // Check if it's scheduled within 24 hours
      if (scheduleDate.toDateString() === today.toDateString() && timeDiff <= 86400000 && timeDiff >= 0) {
        todaySchedules.push(schedule);
      } 
      // Check if it's scheduled after today (upcoming)
      else if (scheduleDate > today) {
        upcomingSchedules.push(schedule);
      } 
    }
  });

  // Sort the today schedules by urgency (ascending time)
  todaySchedules.sort((a, b) => new Date(a.schedule) - new Date(b.schedule));

  return (
    <div>
    <h3>Schedule</h3>
    <p>Schedule for {nodeSelected.name}</p>
  
    <div>
      <label>
        <input
          type="checkbox"
          checked={statusFilter.active}
          onChange={() => handleStatusChange('active')}
        />
        Active
      </label>
      <label>
        <input
          type="checkbox"
          checked={statusFilter.trimmed}
          onChange={() => handleStatusChange('trimmed')}
        />
        Trimmed
      </label>
      <label>
        <input
          type="checkbox"
          checked={statusFilter.complete}
          onChange={() => handleStatusChange('complete')}
        />
        Completed
      </label>
    </div>
  
    <div className="schedule-container">
      {todaySchedules.length > 0 && (
        <div>
          <h4>Today</h4>
          <table>
            <thead>
              <tr>
                <th>Node Name</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Date Created</th>
              </tr>
            </thead>
            <tbody>
              {todaySchedules.map((schedule, index) => (
                <tr key={index}>
                  <td>{schedule.nodeName}</td>
                  <td>{schedule.schedule}</td>
                  <td>{schedule.status}</td>
                  <td>{new Date(schedule.dateCreated).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
  
      {upcomingSchedules.length > 0 && (
        <div>
          <h4>Upcoming</h4>
          <table>
            <thead>
              <tr>
                <th>Node Name</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Date Created</th>
              </tr>
            </thead>
            <tbody>
              {upcomingSchedules.map((schedule, index) => (
                <tr key={index}>
                  <td>{schedule.nodeName}</td>
                  <td>{schedule.schedule}</td>
                  <td>{schedule.status}</td>
                  <td>{new Date(schedule.dateCreated).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
  
      {floatingSchedules.length > 0 && (
        <div>
          <h4>Floating</h4>
          <table>
            <thead>
              <tr>
                <th>Node Name</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Date Created</th>
              </tr>
            </thead>
            <tbody>
              {floatingSchedules.map((schedule, index) => (
                <tr key={index}>
                  <td>{schedule.nodeName}</td>
                  <td>{schedule.schedule}</td>
                  <td>{schedule.status}</td>
                  <td>{new Date(schedule.dateCreated).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
  
      {filteredSchedules.length === 0 && <p>No schedules found.</p>}
    </div>
  </div>
  
  
  );
};

export default Schedule;
