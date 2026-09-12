import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import socket from "../socket";
import toast from "react-hot-toast";

const boardColors = ["#3b82f6", "#22c55e", "#a855f7", "#ec4899", "#f59e0b", "#ef4444", "#14b8a6"];

function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId;
  } catch {
    return null;
  }
}

function MyBoards() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(boardColors[0]);

  useEffect(() => {
    fetchBoards();
    const userId = getUserIdFromToken();
    if (userId) socket.emit("joinUserRoom", userId);

    socket.on("boardsUpdated", () => fetchBoards());
    return () => socket.off("boardsUpdated");
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await api.get("/boards");
      setBoards(response.data);
    } catch (error) {
      console.log("Error fetching boards:", error.response?.data);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    try {
      await api.post("/boards", { title: newBoardTitle, color: selectedColor });
      setNewBoardTitle("");
      fetchBoards();
      toast.success("Board created");
    } catch (error) {
      toast.error("Failed to create board");
    }
  };

  const handleDeleteBoard = async (e, boardId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this board? This cannot be undone.")) return;
    try {
      await api.delete(`/boards/${boardId}`);
      fetchBoards();
      toast.success("Board deleted");
    } catch (error) {
      toast.error("Failed to delete board");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Boards</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleCreateBoard} className="mb-8 max-w-md">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="New board name"
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create Board
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-500 mr-1">Color:</span>
          {boardColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              style={{ backgroundColor: color }}
              className={`w-6 h-6 rounded-full transition ${
                selectedColor === color ? "ring-2 ring-offset-2 ring-gray-400" : ""
              }`}
            />
          ))}
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {boards.map((board) => (
          <div
            key={board._id}
            onClick={() => navigate(`/board/${board._id}`)}
            className="bg-white rounded-xl shadow overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition relative group"
          >
            <div style={{ backgroundColor: board.color || "#3b82f6" }} className="h-3" />
            <div className="p-5">
              <button
                onClick={(e) => handleDeleteBoard(e, board._id)}
                className="absolute top-3 right-3 text-gray-300 hover:text-red-500 text-sm opacity-0 group-hover:opacity-100 transition"
                title="Delete board"
              >
                ✕
              </button>
              <h2 className="font-semibold text-gray-800">{board.title}</h2>
              <p className="text-xs text-gray-400 mt-2">Click to open</p>
            </div>
          </div>
        ))}
      </div>

      {boards.length === 0 && (
        <p className="text-gray-500 text-sm mt-6">
          You don't have any boards yet. Create one above to get started.
        </p>
      )}
    </div>
  );
}

export default MyBoards;
