# Flash Vocab - Vocabulary Learning App

A vocabulary memorization app with multiple learning modes, AI-powered grouping, and privacy-focused per-device data isolation.

## Features

- **Multiple Learning Modes**: Flashcards, Flash Quiz, Full Quiz, Medley Mode
- **Progress Tracking**: Track accuracy and performance over time 
- **Starred Terms**: Focus on difficult vocabulary 
- **Medley Mode**: Combined learning experience with chunked practice
- **Smart Chunking**: Optimal 4-6 word groups for memory retention
- **AI-Powered Grouping**: Automatically sort vocabulary into optimal study groups using OpenAI
- **Device Isolation**: Automatic per-device data separation using secure cookie-based identification

## View Live App

[flashvocab.benclason.com](https://flashvocab.benclason.com)

##  Tech Stack

- **Frontend**: React 19, JavaScript, CSS, React Router
- **Backend**: Python Flask with individual SQLite databases per device
- **AI Integration**: OpenAI GPT-4 API for intelligent word grouping
- **UI Libraries**: @dnd-kit/core for drag-and-drop functionality, @react-quizlet-flashcard for flashcards
- **Data Isolation**: Cookie-based UUID system for per-device data separation
- **Deployment**: Single-domain nginx setup serving React frontend and Flask API
- **Security**: No user accounts required - privacy through device isolation

##  Local Development
### Prerequisites
- Node.js 14+
- Python 3.8+
- OpenAI API Key
### Setup
1. Clone the repository
```bash
git clone https://github.com/bclason/flash-vocab.git
cd flash-vocab
```

2. Install frontend dependencies
```bash
npm install
```

3. Install backend dependencies
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. Set up environment variables
```bash
# Create backend/.env
OPENAI_API_KEY=your_openai_api_key_here
```

5. Run the application
```bash
# Terminal 1: Start backend (port 5000)
cd backend
source venv/bin/activate
python app.py

# Terminal 2: Start frontend (port 3000)
npm start
```

The app will automatically create individual database files for each device in `backend/databases/`.

### SSL Configuration
SSL certificates are configured through Let's Encrypt for secure HTTPS access.

## License

MIT License - Feel free to use this webapp as inspiration for your own projects!

## About the Developer

Built by **Ben Clason** as a portfolio project demonstrating full-stack development with AI integration and privacy-focused architecture.

- **LinkedIn**: [www.linkedin.com/in/benjamin-clason/](https://www.linkedin.com/in/benjamin-clason/)
- **GitHub**: [www.github.com/bclason](https://github.com/bclason) 