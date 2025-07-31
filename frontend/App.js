import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../src/pages/dashboard';
import Edit from '../src/pages/edit';
import Flashcards from '../src/pages/flashcards';
import MiniQuiz from '../src/pages/miniquiz';
import Quiz from '../src/pages/quiz';
import Chunk from '../src/pages/chunk';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/edit" element={<Edit/>} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/miniquiz" element={<MiniQuiz />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/chunk" element={<Chunk />} />
      </Routes>
    </Router>
  );
}