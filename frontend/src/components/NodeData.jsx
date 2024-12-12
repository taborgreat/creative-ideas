const NodeData = ({ nodeSelected }) => (
    <div>
      <h3>Node Data</h3>
      {nodeSelected ? (
        <div>
          <p>ID: {nodeSelected.id}</p>
          <p>Name: {nodeSelected.name}</p>
        </div>
      ) : (
        <p>No node selected</p>
      )}
    </div>
  );
  
  export default NodeData;
  