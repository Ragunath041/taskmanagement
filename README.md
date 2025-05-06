# Task Management System

A feature-rich task management application built with Next.js, Express.js, and MongoDB, designed for efficient team collaboration and task tracking.

## 🌟 Features

### Core Features
- **User Authentication**
  - Secure registration and login
  - JWT-based authentication
  - Password encryption
  - Session management

- **Task Management**
  - Create, read, update, and delete tasks
  - Task attributes: title, description, due date, priority, status
  - Task assignment to team members
  - Task status tracking

- **Team Collaboration**
  - Task assignment to team members
  - Real-time notifications for task assignments
  - Team member management

- **Dashboard**
  - Overview of assigned tasks
  - Tasks created by the user
  - Overdue tasks tracking
  - Task statistics

- **Search and Filter**
  - Search by task title and description
  - Filter by status, priority, and due date
  - Advanced filtering options

### Advanced Features
- Role-Based Access Control (RBAC)
- Real-time notifications using WebSocket
- Recurring tasks support
- Audit logging
- Progressive Web App (PWA) support
- Comprehensive test coverage
- Analytics dashboard
- Customizable notification preferences

## 🚀 Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- React Query
- Socket.io Client

### Backend
- Express.js
- Node.js
- TypeScript
- MongoDB with Mongoose
- Socket.io

### Development Tools
- ESLint
- Prettier
- Jest
- Husky

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/taskmanagement.git
   cd taskmanagement
   ```

2. Install dependencies:
   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Frontend (.env.local)
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_WS_URL=ws://localhost:5000

   # Backend (.env)
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/taskmanagement
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server (in a new terminal)
   cd ..
   npm run dev
   ```

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd backend
npm test
```

## 📦 Deployment

### Frontend Deployment (Vercel)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy

### Backend Deployment (Railway/Render)
1. Push your code to GitHub
2. Connect your repository to Railway/Render
3. Configure environment variables
4. Deploy

## 🔒 Security Features

- JWT-based authentication
- Password encryption using bcrypt
- CORS protection
- Rate limiting
- Input validation
- XSS protection
- MongoDB injection prevention

## 📚 API Documentation

API documentation is available at `/api-docs` when running the server in development mode.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Express.js team for the robust backend framework
- MongoDB team for the flexible database solution
- All contributors who have helped shape this project

## 📞 Support

For support, email support@taskmanagement.com or create an issue in the repository.
