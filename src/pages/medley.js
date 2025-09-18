import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';



export default function Medley() {
  const navigate = useNavigate();


  return (
    <div>
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

        {/* Title and Description*/}
        <h1>Medley</h1>
        <p></p>

    </div>
  );
}

