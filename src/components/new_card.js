import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';


export default function NewCard({ onDelete, accuracy }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();


  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
        <input type="text" placeholder="Term" />
        <input type="text" placeholder="Translation" />
        <input type="text" placeholder="Secondary Translation" />
        <button style={{ color: 'red' }} onClick={onDelete}>Delete</button>
        Accuracy: {accuracy ? accuracy.toFixed(2) : 'N/A'}
    </div>

  );
}