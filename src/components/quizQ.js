export default function QuizQuestion({ term }) {
  return (
    <div>
        <h2>{term}</h2>
        <input 
        style={{
        width: '20rem'
        }}
        value={term}
        onChange={e => setTerm(e.target.value)} // update parent state
        onBlur={e => onFieldChange(card.id, "term", e.target.value)}   
        placeholder="Answer" />
    </div>
  );
}
