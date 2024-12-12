const Notes = ({ nodeSelected }) => (
    <div>
      <h3>Notes</h3>
      {nodeSelected ? <p>Notes for {nodeSelected.name}</p> : <p>No node selected</p>}
    </div>
  );
  
  export default Notes;
  