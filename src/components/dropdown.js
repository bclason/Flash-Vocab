import { useState } from 'react';

export default function CustomDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
    <div>
      <button onClick={() => setOpen(!open)}>
        Practice
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
          <button onClick={() => alert('Flashcards')}>Flashcards</button>
          <button onClick={() => alert('Flash Quiz')}>Flash Quiz</button>
          <button onClick={() => alert('Full Quiz')}>Full Quiz</button>
          <button onClick={() => alert('Medley')}>Medley</button>
        </div>
        
      )}
    </div>
    </div>
  );
}