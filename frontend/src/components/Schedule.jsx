import React, { useState, useEffect } from 'react';
import './Schedule.css';
import Cookies from "js-cookie";

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

const Schedule = ({ nodeSelected, tree, nodeVersion }) => {
  if (!nodeSelected) {
    return <div><h3>Schedule</h3><p>No node selected</p></div>;
  }

  const [statusFilter, setStatusFilter] = useState({
    active: true,
    trimmed: false,
    completed: false,
  });

  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [choppedTree, setChoppedTree] = useState(null);
  const [scheduleSelected, setScheduleSelected] = useState(nodeSelected?.versions?.[nodeVersion]?.schedule);
  const [isEditing, setIsEditing] = useState(false);  // Track whether the schedule is being edited
  const [newSchedule, setNewSchedule] = useState(scheduleSelected || '');  // Store the new schedule
  const [reeffectTime, setReeffectTime] = useState(nodeSelected?.versions?.[nodeVersion]?.reeffectTime || 0);
  useEffect(() => {
    if (nodeSelected && nodeSelected.versions?.length > 0) {
      setScheduleSelected(nodeSelected.versions[nodeVersion].schedule);
      setReeffectTime(nodeSelected.versions[nodeVersion]?.reeffectTime || 0);  // Set initial reeffectTime
    }
  }, [nodeSelected, nodeVersion]);

  const chopTree = (node, nodeId) => {
    if (node._id === nodeId._id) {
      console.log("returned",{...node})
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
      console.log("filter", filtered)
      setFilteredSchedules(filtered);
    }
  }, [statusFilter, choppedTree]);

  const handleStatusChange = (status) => {
    setStatusFilter((prevState) => ({
      ...prevState,
      [status]: !prevState[status],
    }));
  };

  const handleScheduleChange = (event) => {
    setNewSchedule(event.target.value);
  };

  const handleReeffectTimeChange = (event) => {
    setReeffectTime(event.target.value);
  };



  const handleScheduleSubmit = async (e) => {

      e.preventDefault();
  
      const token = Cookies.get("token");
      if (!token) {
        console.error('No JWT token found!');
        return;
      }
      
  
      try {
        const response = await fetch('http://localhost:3000/update-schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nodeId: nodeSelected._id,
            newSchedule: newSchedule,
            reeffectTime: reeffectTime,
            versionIndex: nodeVersion
          }),
        });
  
        const data = await response.json();
        if (!response.ok) {
          console.error('error changing schdule', data);
          throw new Error('Failed to create node');
        }
  
 
  
        // Reset state after successful creation
        setScheduleSelected(newSchedule);
        setIsEditing(false);
      } catch (error) {
        console.error('Error setting schedule:', error.message);
      }
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
  
      <div className="schedule-container">
        {scheduleSelected ? (
          <div>
            <p>Scheduled for: {scheduleSelected}</p>
            <p>Reeffect time: {reeffectTime} hrs</p>
          </div>
        ) : (
          <p>No schedule for this node</p>
        )}
  
        <button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit Schedule'}
        </button>
  
        {isEditing && (
           <form onSubmit={handleScheduleSubmit}>
           <input
             type="datetime-local"
             value={newSchedule}
             onChange={handleScheduleChange}
             required
           />
           <br />
           <label>
             Re-effect Time (hours):
             <input
               type="number"
               value={reeffectTime}
               onChange={handleReeffectTimeChange}
               required
               step="0.1"
               min="0"
               max="1000000"
             />
           </label>
           <br />
           <button type="submit">Submit Schedule</button>
         </form>
        )}
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
            checked={statusFilter.completed}
            onChange={() => handleStatusChange('completed')}
          />
          Completed
        </label>
      </div>
        <div>
          {todaySchedules.length > 0 && (
            <div>
              <h4>Today</h4>
              <table>
                <thead>
                  <tr>
                    <th>Node Name</th>
                    <th>Scheduled</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todaySchedules.map((schedule, index) => (
                    <tr key={index}>
                      <td>{schedule.nodeName}</td>
                      <td>{schedule.schedule}</td>
                      <td>{schedule.status}</td>
                 
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
                    <th>Scheduled</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingSchedules.map((schedule, index) => (
                    <tr key={index}>
                      <td>{schedule.nodeName}</td>
                      <td>{schedule.schedule}</td>
                      <td>{schedule.status}</td>
   
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
                    <th>Status</th>
                    <th>Date Created</th>
                  </tr>
                </thead>
                <tbody>
                  {floatingSchedules.map((schedule, index) => (
                    <tr key={index}>
                      <td>{schedule.nodeName}</td>
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
    </div>
  );
};

export default Schedule;
