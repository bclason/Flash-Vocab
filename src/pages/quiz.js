import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';



export default function Quiz() {
  const navigate = useNavigate();

  const { state } = useLocation();
  const listId = state?.listId;
  const listName = state?.listName;


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

      {/* Title */}
      <h1 style={{
        textAlign: 'center',
        alignItems: 'center',
        fontSize: '52px',
        fontWeight: 'bolder',
      }}>Full Quiz</h1>
      {/* Description */}
      <p style={{
        textAlign: 'center',
        fontSize: '24px',
      }}>
        Feeling confident? Take the Full Quiz and see how accurate your knowledge is!
      </p>
      <h1 style={{
        padding: '.2rem',
        alignItems: 'center',
        fontSize: '42px',
        textDecoration: 'underline'
      }}>{listName}</h1>
      {console.log({listName})}
      {console.log({listId})}
      {/* replace with {listName} */}



    </div>
  );
}

