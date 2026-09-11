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

    // Doosre user ke update ko listen karo
    const handleBoardRefresh = () => {
      console.log("Board update mila, data refresh kar rahe hain...");
      fetchLists();
    };

    socket.on("refreshBoard", handleBoardRefresh);

    // Cleanup
    return () => {
      socket.off("refreshBoard", handleBoardRefresh);
    };
  }, [boardId]);

  // =========================
  // FETCH LISTS
  // =========================
  const fetchLists = async () => {
    try {
      const response = await api.get(`/lists/${boardId}`);

      const fetchedLists = response.data;

      setLists(fetchedLists);

      // Har list ke cards fetch karo
      fetchedLists.forEach((list) => {
        fetchCards(list._id);
      });
    } catch (error) {
      console.log(
        "Error fetching lists:",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // FETCH CARDS
  // =========================
  const fetchCards = async (listId) => {
    try {
      const response = await api.get(`/cards/${listId}`);

      setCardsByList((prev) => ({
        ...prev,
        [listId]: response.data,
      }));
    } catch (error) {
      console.log(
        "Error fetching cards:",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // ADD LIST
  // =========================
  const handleAddList = async (e) => {
    e.preventDefault();

    const title = newListTitle.trim();

    if (!title) return;

    try {
      const response = await api.post("/lists", {
        title: title,
        boardId: boardId,
        order: lists.length,
      });

      // Backend se newly created list mili
      const newList = response.data;

      // Screen par turant list add karo
      setLists((prevLists) => [...prevLists, newList]);

      // New list ke cards initially empty honge
      setCardsByList((prev) => ({
        ...prev,
        [newList._id]: [],
      }));

      // Input clear
      setNewListTitle("");

      // Doosre users ko update batao
      socket.emit("boardUpdated", boardId);
    } catch (error) {
      console.log(
        "Error creating list:",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // ADD CARD
  // =========================
  const handleAddCard = async (listId) => {
    const title = prompt("Card Title:");

    if (!title || !title.trim()) return;

    try {
      const response = await api.post("/cards", {
        title: title.trim(),
        listId: listId,
        order: cardsByList[listId]?.length || 0,
      });

      // Backend se newly created card
      const newCard = response.data;

      // Card ko turant screen par add karo
      setCardsByList((prev) => ({
        ...prev,
        [listId]: [...(prev[listId] || []), newCard],
      }));

      // Doosre users ko update batao
      socket.emit("boardUpdated", boardId);
    } catch (error) {
      console.log(
        "Error creating card:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        TaskFlow Board
      </h1>

      {/* ADD LIST */}
      <form
        onSubmit={handleAddList}
        className="mb-6 flex gap-2 max-w-md"
      >
        <input
          type="text"
          placeholder="New list name(e.g. To Do)"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ADD LIst
        </button>
      </form>

      {/* LISTS */}
      <div className="flex gap-4 overflow-x-auto pb-4">

        {lists.map((list) => (
          <div
            key={list._id}
            className="bg-white rounded-xl shadow p-4 w-72 flex-shrink-0"
          >

            <h2 className="font-semibold text-gray-700 mb-3 border-b pb-2">
              {list.title}
            </h2>

            {/* CARDS */}
            <div className="space-y-2 mb-3 min-h-[40px]">

              {(cardsByList[list._id] || []).map((card) => (
                <div
                  key={card._id}
                  className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm text-gray-700 shadow-sm hover:shadow transition"
                >
                  {card.title}
                </div>
              ))}

            </div>

            {/* ADD CARD */}
            <button
              onClick={() => handleAddCard(list._id)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + ADD Card
            </button>

          </div>
        ))}

      </div>
    </div>
  );
}

export default BoardPage;