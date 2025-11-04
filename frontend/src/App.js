import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Dashboard from './pages/dashboard';
import Edit from './pages/edit';
import Flashcards from './pages/flashcards';
import MiniQuiz from './pages/mini';
import Quiz from './pages/quiz';
import Chunking from './pages/chunking';
import Medley from './pages/medley';

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/edit" element={<Edit/>} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/mini" element={<MiniQuiz />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/chunking" element={<Chunking />} />
        <Route path="/medley" element={<Medley />} />
      </Routes>
  );
}