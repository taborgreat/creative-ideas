const Schedule = ({ nodeSelected }) => (
    <div>
      <h3>Schedule</h3>
      {nodeSelected ? <p>Schedule for {nodeSelected.name}</p> : <p>No node selected</p>}
    </div>
  );
  
  export default Schedule;
  