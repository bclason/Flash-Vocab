# Flash Vocab - Vocabulary Learning App

A comprehensive vocabulary memorization app with AI-powered grouping, multiple learning modes, and progress tracking.

## 🌟 Features

- **Multiple Learning Modes**: Flashcards, Flash Quiz, Full Quiz, Multiple Choice
- **AI-Powered Grouping**: Automatically sort vocabulary into optimal study groups using OpenAI
- **Progress Tracking**: Track accuracy and performance over time  
- **Medley Mode**: Combined learning experience with chunked practice
- **Starred Terms**: Focus on difficult vocabulary
- **Bilingual Support**: Terms and translations with secondary definitions
- **Drag & Drop Interface**: Manually organize vocabulary groups
- **Smart Chunking**: Optimal 4-6 word groups for memory retention

## 🚀 Live Demo

[View Live App](https://flash-vocab-delta.vercel.app)

## 🛠️ Tech Stack

- **Frontend**: React 19, JavaScript, CSS, React Router
- **Backend**: Python Flask, SQLite/PostgreSQL
- **AI Integration**: OpenAI GPT-4 API for intelligent word grouping
- **UI Libraries**: @dnd-kit/core for drag-and-drop functionality
- **Deployment**: Vercel (Frontend) + Railway (Backend)

## 📱 How It Works

1. **Create Lists**: Add vocabulary terms with translations
2. **AI Grouping**: Let AI automatically group similar terms for optimal learning
3. **Practice Modes**: Choose from flashcards, quizzes, or combined medley mode  
4. **Track Progress**: Monitor accuracy and focus on challenging terms
5. **Chunked Learning**: Practice small groups for better retention

## 🔧 Local Development

### Prerequisites
- Node.js 14+
- Python 3.8+
- OpenAI API Key

### Setup
1. Clone the repository
```bash
git clone https://github.com/bclason/Flash-Vocab.git
cd Flash-Vocab
```

2. Install frontend dependencies
```bash
npm install
```

3. Install backend dependencies
```bash
cd backend
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
source venv/bin/activate  # or activate virtual environment
python app.py

# Terminal 2: Start frontend (port 3000)
npm start
```

## 🌐 Deployment Instructions

Ready to deploy? Follow these steps:

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Add environment variable: `REACT_APP_API_BASE_URL=https://flash-vocab.up.railway.app`
5. Deploy!

### Backend (Railway)
1. Connect GitHub repo to Railway
2. Set environment variables:
   - `OPENAI_API_KEY=your_openai_api_key`
   - `FRONTEND_URL=https://flash-vocab-delta.vercel.app`
   - `FLASK_ENV=production`
3. Deploy Flask app

## 📄 License

MIT License - Feel free to use this project as inspiration for your own vocabulary apps!

## 🤝 About the Developer

Built by **Ben Clason** as a portfolio project demonstrating full-stack development with AI integration.

- **LinkedIn**: [www.linkedin.com/in/benjamin-clason/](https://www.linkedin.com/in/benjamin-clason/)
- **GitHub**: [www.github.com/bclason](https://github.com/bclason) 