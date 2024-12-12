const Contributions = ({ nodeSelected }) => (
    <div>
      <h3>Transaction</h3>
      {nodeSelected ? <p>Transactions for {nodeSelected.name}</p> : <p>No node selected</p>}
    </div>
  );
  
  export default Contributions;
  