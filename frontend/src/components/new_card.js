import { useState } from 'react';

// TODO: implement star/unstar functionality, should be in onStar which is handled in dashboard or something
// also need to update app.py to handle starred

export default function NewCard({ onDelete, accuracy, card, onFieldChange, onStar }) {
  const [term, setTerm] = useState(card.term || '');
  const [translation, setTranslation] = useState(card.translation || '');
  const [secondaryTranslation, setSecondaryTranslation] = useState(card.secondary_translation || '');
  const [isFavorite, setIsFavorite] = useState(card.starred || false);

  const handleStarClick = () => {
    const newStarredState = !isFavorite;
    setIsFavorite(newStarredState);
    onFieldChange(card.id, "starred", newStarredState);
  };


  return (
    <div style={{
      padding: '1rem',
    }}>
      {/* add border radius to everything? */}
      <div style={{ border: '2px solid #000', padding: '1rem', borderRadius: '0px'}}>
        <div style={{ display: 'flex', gap: '0.8rem', fontSize: '1.2rem', boxSizing: 'border-box' }}>
          {/* Star */}
          <button 
            onClick={handleStarClick}
            style={{
              //background: isFavorite ? 'gold' : 'lightgray',
              fontSize: '2rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              padding: '0rem .7rem',
            }}>
             {isFavorite ? "★" : "☆"}
          </button>

          {/* Term */}
          <input 
          style={{
            width: '20rem'
          }}
          value={term || ''}
          onChange={e => setTerm(e.target.value)} // update parent state
          onBlur={e => onFieldChange(card.id, "term", e.target.value)}   
          placeholder="Term" />

          {/* Translation */}
          <input 
          style={{
            width: '20rem'
          }}
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          onBlur={(e) => onFieldChange(card.id, "translation", e.target.value)}
          placeholder="Translation" />

          {/* Secondary Translation */}
          <input 
          style={{
            width: '20rem'
          }}
          value={secondaryTranslation}
          onChange={(e) => setSecondaryTranslation(e.target.value)}
          onBlur={(e) => onFieldChange(card.id, "secondary_translation", e.target.value)}
          placeholder="Secondary Translation" />
          <button style={{ color: 'red' }} onClick={onDelete}>Delete</button>
          Accuracy: {accuracy ? `${accuracy.toFixed(1)}%` : 'N/A'}
        </div>
      </div>
    </div>
  );
}