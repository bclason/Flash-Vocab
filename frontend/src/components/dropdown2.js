import { useState } from 'react';


export default function Dropdown2({ listId, listName, onSortByStarred, onSortByAccuracyLowHigh, onSortByAccuracyHighLow }) {
  const [open, setOpen] = useState(false);

  const handleStarredClick = () => {
    onSortByStarred();
    setOpen(false); // Close dropdown after selection
  };

  const handleLowHighClick = () => {
    onSortByAccuracyLowHigh();
    setOpen(false); // Close dropdown after selection
  };

  const handleHighLowClick = () => {
    onSortByAccuracyHighLow();
    setOpen(false); // Close dropdown after selection
  };


  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(!open)} style={{fontSize: '1.5rem', padding: '.5rem 1rem'}}>
        Sort By
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 1000,
        }}>
          <button onClick={handleStarredClick}>Starred</button>
          <button onClick={handleHighLowClick}>Accuracy High-Low</button>
          <button onClick={handleLowHighClick}>Accuracy Low-High</button>
        </div>
        
      )}
    </div>
  );
}