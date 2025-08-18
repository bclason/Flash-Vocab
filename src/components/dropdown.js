import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';


export default function CustomDropdown() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();


    const handleFlashcards = () => {
      navigate('/flashcards');
    };

    const handleFlashQuiz = () => {
      navigate('/mini');
    };

    const handleFullQuiz = () => {
      navigate('/quiz');
    };

    const handleMedley = () => {
      navigate('/chunk');
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