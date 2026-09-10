# TaskFlow 🚀

A real-time collaborative task board (Trello-style) built with the MERN stack. Multiple users can create boards, organize tasks into lists, and see updates instantly — without refreshing the page.

## ✨ Features

- **User Authentication** — Secure signup/login with JWT and password hashing (bcrypt)
- **Boards, Lists & Cards** — Create boards, organize work into lists (To Do / In Progress / Done), and add cards for individual tasks
- **Real-Time Collaboration** — Powered by Socket.io, so when one user adds or updates a card, every other user viewing the board sees it instantly
- **Protected Routes** — API endpoints are secured with JWT-based middleware, ensuring only authenticated users can access board data
- **Responsive UI** — Clean, modern interface built with Tailwind CSS

## 🛠️ Tech Stack

| Layer          | Technology                          |
|----------------|--------------------------------------|
| Frontend       | React (Vite), Tailwind CSS, Axios    |
| Backend        | Node.js, Express.js                  |
| Database       | MongoDB (Mongoose)                   |
| Real-Time      | Socket.io                            |
| Authentication | JWT, bcrypt.js                       |

## 🏗️ Architecture

```
Client (React) <---- REST API ----> Server (Express)
       ^                                   |
       |                                   v
       └------- Socket.io (real-time) -----+
                                            |
                                            v
                                      MongoDB Atlas
```

- REST APIs handle standard operations (create/read/update/delete)
- Socket.io maintains a persistent connection so the server can push live updates to all connected clients on the same board

## 📁 Project Structure

```
TaskFlow/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/      # Business logic (auth, board, list, card)
│   ├── middleware/       # JWT auth middleware
│   ├── models/            # Mongoose schemas (User, Board, List, Card)
│   ├── routes/            # API route definitions
│   └── server.js          # Entry point (Express + Socket.io)
└── frontend/
    ├── src/
    │   ├── pages/          # Login, Signup, BoardPage
    │   ├── services/       # Axios API config
    │   └── socket.js        # Socket.io client setup
    └── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A MongoDB Atlas account (free tier works)

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the server:
```bash
node server.js
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## 🔑 API Endpoints

| Method | Endpoint             | Description                  | Protected |
|--------|-----------------------|-------------------------------|-----------|
| POST   | `/api/auth/signup`    | Register a new user           | No        |
| POST   | `/api/auth/login`     | Login and receive JWT token   | No        |
| POST   | `/api/boards`         | Create a new board            | Yes       |
| GET    | `/api/boards`         | Get all boards for the user   | Yes       |
| POST   | `/api/lists`          | Create a list on a board      | Yes       |
| GET    | `/api/lists/:boardId` | Get all lists for a board     | Yes       |
| POST   | `/api/cards`          | Create a card in a list       | Yes       |
| GET    | `/api/cards/:listId`  | Get all cards for a list      | Yes       |
| PUT    | `/api/cards/:id`      | Update a card                 | Yes       |
| DELETE | `/api/cards/:id`      | Delete a card                 | Yes       |

## 🎯 What This Project Demonstrates

- Full-stack application design (frontend, backend, database working together)
- RESTful API design with proper authentication and authorization
- Real-time, event-driven architecture using WebSockets
- Secure password storage and token-based session management
- Clean, component-based frontend architecture in React

## 📌 Roadmap / Future Improvements

- [ ] Drag-and-drop card movement between lists
- [ ] Comments on cards
- [ ] Role-based access (Owner / Editor / Viewer)
- [ ] Due dates and priority labels
- [ ] Deployment (Vercel + Render)

## 👤 Author

Built by Rushita Pawar as a personal project to strengthen full-stack development skills with the MERN stack and real-time technologies.

## 📄 License

This project is open source and available for learning purposes.
