import CustomDropdown from './dropdown';

export default function ListItem({ listId, listName, onEdit, onDelete, onStats }) {
    // include a are you sure you want to delete this list confirmation dialog for onclick for delete
  return (
    <div style={{ padding: '1rem', margin: '0 auto' }}>
        <div className="list-item" style={{ display: 'flex', alignItems: 'center', padding: '1rem', border: '4px solid #000' }}>
          <h3 style={{ flex: 1 }}>{listName}</h3>
          <div style={{ display: 'flex', gap: '0.6rem', fontSize: '1.2rem', boxSizing: 'border-box' }}>
            <CustomDropdown 
              listId={listId}
              listName={listName}
            />
            <button onClick={onEdit}>Edit</button>
            <button onClick={onStats}>Stats & Chunking</button>
            <button style={{ color: 'red' }} onClick={onDelete}>Delete</button>
          </div>
        </div>
    </div>
  );
}