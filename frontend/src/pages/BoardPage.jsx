import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import socket from "../socket";

function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [lists, setLists] = useState([]);
  const [cardsByList, setCardsByList] = useState({});
  const [newListTitle, setNewListTitle] = useState("");

  useEffect(() => {
    fetchLists();

    // Join this board's real-time room
    socket.emit("joinBoard", boardId);

    // Listen for updates from other users
    socket.on("refreshBoard", () => {
      fetchLists();
    });

    return () => {
      socket.off("refreshBoard");
    };
  }, [boardId]);

  const fetchLists = async () => {
    try {
      const response = await api.get(`/lists/${boardId}`);
      setLists(response.data);
      response.data.forEach((list) => fetchCards(list._id));
    } catch (error) {
      console.log("Error fetching lists:", error.response?.data);
    }
  };

  const fetchCards = async (listId) => {
    try {
      const response = await api.get(`/cards/${listId}`);
      setCardsByList((prev) => ({ ...prev, [listId]: response.data }));
    } catch (error) {
      console.log("Error fetching cards:", error.response?.data);
    }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      await api.post("/lists", { title: newListTitle, boardId, order: lists.length });
      setNewListTitle("");
      fetchLists();
      socket.emit("boardUpdated", boardId);
    } catch (error) {
      console.log("Error creating list:", error.response?.data);
    }
  };

  const handleAddCard = async (listId) => {
    const title = prompt("Enter card title:");
    if (!title) return;
    try {
      await api.post("/cards", { title, listId, order: cardsByList[listId]?.length || 0 });
      fetchCards(listId);
      socket.emit("boardUpdated", boardId);
    } catch (error) {
      console.log("Error creating card:", error.response?.data);
    }
  };

  const handleDeleteCard = async (cardId, listId) => {
    try {
      await api.delete(`/cards/${cardId}`);
      fetchCards(listId);
      socket.emit("boardUpdated", boardId);
    } catch (error) {
      console.log("Error deleting card:", error.response?.data);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">TaskFlow Board</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
        >
          Logout
        </button>
      </div>

      {/* Add new list form */}
      <form onSubmit={handleAddList} className="mb-6 flex gap-2 max-w-md">
        <input
          type="text"
          placeholder="New list name (e.g. To Do)"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add List
        </button>
      </form>

      {/* Lists as columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {lists.map((list) => (
          <div key={list._id} className="bg-white rounded-xl shadow p-4 w-72 flex-shrink-0">
            <h2 className="font-semibold text-gray-700 mb-3 border-b pb-2">{list.title}</h2>

            <div className="space-y-2 mb-3 min-h-[40px]">
              {(cardsByList[list._id] || []).map((card) => (
                <div
                  key={card._id}
                  className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm text-gray-700 shadow-sm hover:shadow transition flex justify-between items-start gap-2"
                >
                  <span>{card.title}</span>
                  <button
                    onClick={() => handleDeleteCard(card._id, list._id)}
                    className="text-gray-400 hover:text-red-500 text-xs font-bold"
                    title="Delete card"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleAddCard(list._id)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + Add Card
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BoardPage;