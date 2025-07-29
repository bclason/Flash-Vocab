


export default function ListItem({ name, onEdit, onDelete, onPractice, onStats }) {
    // include a are you sure you want to delete this list confirmation dialog for onclick for delete
  return (
    <div style={{ padding: '1rem', margin: '0 auto' }}>
        <div className="list-item" style={{ display: 'flex', alignItems: 'center', padding: '1rem', border: '4px solid #000' }}>
        <h3 style={{ flex: 1 }}>{name}</h3>
        <div style={{ display: 'flex', gap: '0.6rem', fontSize: '1.2rem' }}>
        <button onClick={onDelete}>Delete</button>
        <button onClick={onPractice}>Practice</button>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onStats}>Stats</button>
        </div>
        </div>
    </div>
  );
}