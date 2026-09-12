require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

connectDB();
app.set("io", io);

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");

console.log("authRoutes type:", typeof authRoutes);

app.use("/api/auth", authRoutes);

const boardRoutes = require("./routes/boardRoutes");
app.use("/api/boards", boardRoutes);

const listRoutes = require("./routes/ListRoutes");
app.use("/api/lists", listRoutes);

const cardRoutes = require("./routes/cardRoutes");
app.use("/api/cards", cardRoutes);

const commentRoutes = require("./routes/commentRoutes");
app.use("/api/comments", commentRoutes);

app.get("/", (req, res) => {
  res.send("TaskFlow API is running");
});

const PORT = process.env.PORT || 5000;

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinBoard", (boardId) => {
    socket.join(boardId);
    console.log(`User joined board: ${boardId}`);
  });

  socket.on("joinCard", (cardId) => {
    socket.join(`card-${cardId}`);
  });

  socket.on("leaveCard", (cardId) => {
    socket.leave(`card-${cardId}`);
  });
  socket.on("joinUserRoom", (userId) => {
    socket.join(`user-${userId}`);
  });

  socket.on("cardMoved", (data) => {
    io.to(data.boardId).emit("cardUpdated", data);
  });

  socket.on("boardUpdated", (boardId) => {
    socket.to(boardId).emit("refreshBoard");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
