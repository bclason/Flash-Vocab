import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';


export default function NewCard({ onDelete, accuracy, card, onFieldChange }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [term, setTerm] = useState(card.term || '');
  const [translation, setTranslation] = useState(card.translation || '');
  const [secondaryTranslation, setSecondaryTranslation] = useState(card.secondary_translation || '');


  return (
    <div style={{
      padding: '1rem',
    }}>
      {/* add border radius to everything? */}
      <div style={{ border: '2px solid #000', padding: '1rem', borderRadius: '0px'}}>
        <div style={{ display: 'flex', gap: '0.8rem', fontSize: '1.2rem', boxSizing: 'border-box' }}>
          <input 
          style={{
            width: '20rem'
          }}
          
          value={term || ''}
          onChange={e => setTerm(e.target.value)} // update parent state
          onBlur={e => onFieldChange(card.id, "term", e.target.value)}   
          placeholder="Term" />
          <input 
          style={{
            width: '20rem'
          }}
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          onBlur={(e) => onFieldChange(card.id, "translation", e.target.value)}
          placeholder="Translation" />
          <input 
          style={{
            width: '20rem'
          }}
          value={secondaryTranslation}
          onChange={(e) => setSecondaryTranslation(e.target.value)}
          onBlur={(e) => onFieldChange(card.id, "secondary_translation", e.target.value)}
          placeholder="Secondary Translation" />
          <button style={{ color: 'red' }} onClick={onDelete}>Delete</button>
          Accuracy: {accuracy ? accuracy.toFixed(2) : 'N/A'}
        </div>
      </div>
    </div>


      // <form onSubmit={handleSubmit}>
      //   <input
      //     type="text"
      //     value={textEntry}
      //     onChange={handleUpdateList}   // keep your existing change handler
      //     onBlur={handleSubmit}          // call submit when input loses focus
      //     placeholder={listName}
      //     style={{
      //       width: '80%',
      //       fontSize: '3rem',
      //       border: '4px dashed #000',
      //     }}
      //   />
      // </form>

  );
}