import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';


export default function CustomDropdown({ listId, listName }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const updateUsedStats = () => {
    fetch(`${config.API_BASE_URL}/lists/${listId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: listId, name: listName, last_used: new Date().toISOString().slice(0, 19).replace('T', ' ') })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update stats');
      })
      .catch(err => console.error('Error updating stats:', err));
  };

  const handleFlashcards = () => {
    updateUsedStats();
    navigate('/flashcards', { state: { listName: listName, listId: listId } });
  };

  const handleFlashQuiz = () => {
    updateUsedStats();
    navigate('/mini', { state: { listName: listName, listId: listId } });
    };

  const handleFullQuiz = () => {
    updateUsedStats();
    navigate('/quiz', { state: { listName: listName, listId: listId } });
  };

  const handleMedley = () => {
    navigate('/medley', { state: { listName: listName, listId: listId } });
  };

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
          <button onClick={handleFlashcards}>Flashcards</button>
          <button onClick={handleFlashQuiz}>Flash Quiz</button>
          <button onClick={handleFullQuiz}>Full Quiz</button>
          <button onClick={handleMedley}>Medley</button>
        </div>
        
      )}
    </div>
    </div>
  );
}