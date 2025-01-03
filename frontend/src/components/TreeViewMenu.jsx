import React, { useState } from 'react';
import CreateNodeForm from './CreateNodeForm';
import TrimNodeForm from './TrimNodeForm';  // Assuming you have a TrimNodeForm
import CompleteNodeForm from './CompleteNodeForm';  // Assuming you have a CompleteNodeForm

const TreeViewMenu = ({ nodeSelected, nodeVersion, getTree, rootSelected }) => {
  // State to track which component to show
  const [currentForm, setCurrentForm] = useState(null);

  const handleFormCompletion = () => {
    setCurrentForm(null);
    getTree(rootSelected);
  };
  // Handle button actions
  const handleCreateChild = () => {
    if (nodeSelected) {

      // Show the CreateNodeForm
      setCurrentForm('createNode');
   
    }
   
  };

  const handleTrim = () => {
    if (nodeSelected) {
      // Show the TrimNodeForm
      setCurrentForm('trimNode');
    }

  };

  const handleComplete = () => {
    if (nodeSelected) {
      // Show the CompleteNodeForm
      setCurrentForm('completeNode');
    }
   
  };

  return (
    <div className="tree-view-menu">
      {/* Buttons */}
      <button onClick={handleCreateChild}>Create Child</button>
      <button onClick={handleTrim}>Trim</button>
      <button onClick={handleComplete}>Complete Node</button>

      {/* Dynamically render the form based on the selected button */}
      <div className="form-container">
        {currentForm === 'createNode' && <CreateNodeForm nodeSelected={nodeSelected} onComplete={handleFormCompletion}/>}
        {currentForm === 'trimNode' && <TrimNodeForm nodeSelected={nodeSelected} nodeVersion={nodeVersion} onComplete={handleFormCompletion}/>}
        {currentForm === 'completeNode' && <CompleteNodeForm nodeSelected={nodeSelected} nodeVersion={nodeVersion} onComplete={handleFormCompletion}/>}
      </div>
    </div>
  );
};

export default TreeViewMenu;
