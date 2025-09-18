import React from 'react';
import {useDroppable} from '@dnd-kit/core';

export default function Droppable(props) {
  const {isOver, setNodeRef} = useDroppable({
    id: props.id,
  });
  const style = {
    color: isOver ? 'green' : undefined,
    border: '2px dashed gray',
    padding: '2rem',
    margin: '1rem',
    minHeight: '4rem',
    minWidth: '2rem',
    textAlign: 'center',
  };
  
  
  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}