# Mental Wellness Backend

A comprehensive mental wellness application backend built with Flask, MongoDB, and AI integration.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- MongoDB
- Node.js (for frontend)

### Installation

1. **Clone and setup the project**
   ```bash
   cd Backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

3. **Required API Keys**
   - **OpenRouter API Key**: Get from [openrouter.ai](https://openrouter.ai)
   - **MongoDB URI**: Update if using cloud MongoDB
   - **Pinecone API Key**: Get from [pinecone.io](https://pinecone.io) (for vector search)

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on localhost:27017
   mongod
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

## 🔧 API Endpoints Fixed

### ✅ Route Registration Issues Fixed
- **Game Routes**: `/api/game/*` - All endpoints now registered
- **Personality Routes**: `/api/personality/*` - All endpoints now registered
- **All other routes**: Properly registered with correct URL prefixes

### ✅ API Validation Issues Fixed
- **Community Posts**: Now accepts form data with `user_id` and `content` fields
- **Friends Search**: Now requires `userId` parameter for proper validation
- **Safety Events**: Now validates `user_id`, `risk_level`, and `message` fields
- **Error Handling**: Proper 400/500 error responses with meaningful messages

### ✅ OpenAI Integration Fixed
- **API Configuration**: Uses OpenRouter for better reliability
- **Environment Setup**: Clear instructions for API key configuration
- **Error Handling**: Graceful fallbacks when AI services are unavailable

## 📋 API Testing

Run the comprehensive API test suite:

```bash
python test_api.py
```

### Test Coverage
- ✅ Health endpoints
- ✅ Authentication (signup/login)
- ✅ Chat functionality
- ✅ Community features (posts, likes, comments)
- ✅ Friends system (search, requests)
- ✅ Task management
- ✅ Game mechanics
- ✅ Personality testing
- ✅ Safety reporting
- ✅ Error handling

## 🛠️ Development

### Project Structure
```
Backend/
├── app.py                 # Main Flask application
├── config.py             # Configuration settings
├── requirements.txt      # Python dependencies
├── test_api.py          # Comprehensive API tests
├── models/              # Pydantic models
├── routes/              # Flask blueprints
├── services/            # Business logic
├── utils/               # Utility functions
└── uploads/             # File uploads
```

### Key Features
- **Real-time Chat**: WebSocket support with SocketIO
- **AI Integration**: OpenRouter API for chat and suggestions
- **Vector Search**: Pinecone for semantic search
- **File Uploads**: Media support for community posts
- **Authentication**: JWT-based user management
- **Task Management**: Streak tracking and AI suggestions
- **Community Features**: Posts, likes, comments
- **Friends System**: Search and friend requests
- **Games**: Interactive wellness games
- **Safety Features**: Risk event reporting

## 🔒 Security

- **CORS**: Properly configured for frontend integration
- **Input Validation**: All endpoints validate input data
- **Error Handling**: No sensitive data exposed in errors
- **File Upload Security**: Secure filename handling

## 📊 Monitoring

- **Logging**: Comprehensive logging throughout the application
- **Health Checks**: Built-in health monitoring endpoints
- **Error Tracking**: Detailed error reporting and handling

## 🚨 Troubleshooting

### Common Issues

1. **404 Errors on Game/Personality Routes**
   - Fixed: Routes are now properly registered in `app.py`

2. **Community Post Creation Fails**
   - Fixed: Now accepts form data instead of JSON
   - Required fields: `user_id`, `content`

3. **Friends Search Validation Errors**
   - Fixed: Now requires `userId` parameter
   - Usage: `/api/friends/search?q=test&userId=user123`

4. **OpenAI Authentication Errors**
   - Fixed: Uses OpenRouter API with proper configuration
   - Set `OPENROUTER_API_KEY` in `.env` file

5. **Database Connection Issues**
   - Ensure MongoDB is running
   - Check `MONGODB_URI` in `.env`

### Debug Mode
Run with debug logging:
```bash
export LOG_LEVEL=DEBUG
python app.py
```

## 📝 API Documentation

### Authentication
- `POST /api/signup` - User registration
- `POST /api/login` - User login
- `GET /api/user/:id` - Get user profile
- `GET /api/users/search?q=query` - Search users

### Chat
- `POST /api/chat` - Send chat message
- `GET /api/chat/history/:userId` - Get chat history

### Community
- `POST /api/community/posts` - Create post (form data)
- `GET /api/community/posts` - Get all posts
- `POST /api/community/posts/:id/like` - Like post
- `POST /api/community/posts/:id/comment` - Comment on post

### Friends
- `GET /api/friends/search?q=query&userId=userId` - Search users
- `POST /api/friends/friend-request` - Send friend request
- `GET /api/friends/friends/:userId` - Get user friends

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/user/:userId` - Get user tasks
- `GET /api/tasks/ai-suggestion/:userId` - Get AI suggestions

### Games
- `POST /api/game/start` - Start game session
- `POST /api/game/action` - Record game action
- `POST /api/game/check-placement` - Check placement
- `POST /api/game/complete` - Complete level
- `GET /api/game/leaderboard` - Get leaderboard

### Personality
- `GET /api/personality/questions` - Get test questions
- `POST /api/personality/submit` - Submit test results

### Safety
- `POST /api/safety/risk-event` - Report risk event

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
