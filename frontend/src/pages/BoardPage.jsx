import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import socket from "../socket";

function BoardPage() {
  const { boardId } = useParams();
  const [lists, setLists] = useState([]);
  const [cardsByList, setCardsByList] = useState({});
  const [newListTitle, setNewListTitle] = useState("");

  useEffect(() => {
    fetchLists();

    // Board ke room mein join karo
    socket.emit("joinBoard", boardId);

    // Jab bhi koi doosra user kuch update kare, ye chalega
    socket.on("refreshBoard", () => {
      console.log("Board update mila, refresh kar rahe hain...");
      fetchLists();
    });

    // Cleanup - jab component hatega to listener bhi hata do
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

      // Doosre users ko batao ki board update hua
      socket.emit("boardUpdated", boardId);
    } catch (error) {
      console.log("Error creating list:", error.response?.data);
    }
  };

  const handleAddCard = async (listId) => {
    const title = prompt("Card ka title dijiye:");
    if (!title) return;
    try {
      await api.post("/cards", { title, listId, order: cardsByList[listId]?.length || 0 });
      fetchCards(listId);

      // Doosre users ko batao ki board update hua
      socket.emit("boardUpdated", boardId);
    } catch (error) {
      console.log("Error creating card:", error.response?.data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">TaskFlow Board</h1>

      <form onSubmit={handleAddList} className="mb-6 flex gap-2 max-w-md">
        <input
          type="text"
          placeholder="Naya list ka naam (e.g. To Do)"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          List Add Karein
        </button>
      </form>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {lists.map((list) => (
          <div key={list._id} className="bg-white rounded-xl shadow p-4 w-72 flex-shrink-0">
            <h2 className="font-semibold text-gray-700 mb-3 border-b pb-2">{list.title}</h2>

            <div className="space-y-2 mb-3 min-h-[40px]">
              {(cardsByList[list._id] || []).map((card) => (
                <div key={card._id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm text-gray-700 shadow-sm hover:shadow transition">
                  {card.title}
                </div>
              ))}
            </div>

            <button
              onClick={() => handleAddCard(list._id)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + Card Add Karein
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BoardPage;