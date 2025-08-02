import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';



export default function MiniQuiz() {
  const navigate = useNavigate();


  return (
    <div>
      <h1>Flash Quiz</h1>
      {/* Home button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '.2rem',
        fontSize: '1.5rem',
      }}>
          <button
            type="button"
            onClick={() => navigate('/')}
          > Home</button>
      </div>
    </div>
  );
}

