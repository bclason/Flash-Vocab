import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Dashboard from './pages/dashboard';
import Lists from './pages/lists';
import Edit from './pages/edit';
import Flashcards from './pages/flashcard';
import MiniQuiz from './pages/mini';
import Quiz from './pages/quiz';
import Chunk from './pages/chunk';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/lists" element={<Lists />} />
        <Route path="/edit" element={<Edit/>} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/miniquiz" element={<MiniQuiz />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/chunk" element={<Chunk />} />
      </Routes>
    </Router>
  );
}

export default App;