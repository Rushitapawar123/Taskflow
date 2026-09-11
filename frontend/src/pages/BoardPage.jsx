import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import api from "../services/api";
import socket from "../socket";
import DroppableList from "../components/DroppableList";
import AddCardModal from "../components/AddCardModal";
import CardDetailsModal from "../components/CardDetailsModal";

function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [lists, setLists] = useState([]);
  const [cardsByList, setCardsByList] = useState({});
  const [newListTitle, setNewListTitle] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [activeListId, setActiveListId] = useState(null);

  const [selectedCard, setSelectedCard] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    fetchLists();
    socket.emit("joinBoard", boardId);
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

  // "+ Add Card" button dabane par modal kholta hai
  const openAddCardModal = (listId) => {
    setActiveListId(listId);
    setModalOpen(true);
  };

  // Add Card modal se title milne par naya card banata hai
  const handleAddCard = async (title) => {
    try {
      await api.post("/cards", {
        title,
        listId: activeListId,
        order: cardsByList[activeListId]?.length || 0,
      });
      fetchCards(activeListId);
      socket.emit("boardUpdated", boardId);
    } catch (error) {
      console.log("Error creating card:", error.response?.data);
    }
  };

  // Card par click karne par details modal kholta hai
  const handleCardClick = (card) => {
    setSelectedCard(card);
    setDetailsModalOpen(true);
  };

  // Details modal se Save dabane par card update karta hai
  const handleUpdateCard = async (cardId, updates) => {
    try {
      await api.put(`/cards/${cardId}`, updates);
      fetchCards(selectedCard.list);
      socket.emit("boardUpdated", boardId);
    } catch (error) {
      console.log("Error updating card:", error.response?.data);
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

  const findListOfCard = (cardId) => {
    for (const listId in cardsByList) {
      if (cardsByList[listId].some((c) => c._id === cardId)) {
        return listId;
      }
    }
    return null;
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeCardId = active.id;
    const sourceListId = findListOfCard(activeCardId);

    let destListId = over.id;
    if (cardsByList[destListId] === undefined) {
      destListId = findListOfCard(over.id);
    }

    if (!sourceListId || !destListId) return;

    if (sourceListId === destListId) {
      const cards = [...cardsByList[sourceListId]];
      const oldIndex = cards.findIndex((c) => c._id === activeCardId);
      const newIndex = cards.findIndex((c) => c._id === over.id);
      if (oldIndex === newIndex || newIndex === -1) return;

      const reordered = arrayMove(cards, oldIndex, newIndex);
      setCardsByList((prev) => ({ ...prev, [sourceListId]: reordered }));

      try {
        await api.put(`/cards/${activeCardId}`, { order: newIndex });
        socket.emit("boardUpdated", boardId);
      } catch (error) {
        console.log("Error updating order:", error.response?.data);
      }
    } else {
      const sourceCards = cardsByList[sourceListId].filter((c) => c._id !== activeCardId);
      const movedCard = cardsByList[sourceListId].find((c) => c._id === activeCardId);
      const destCards = [...(cardsByList[destListId] || []), movedCard];

      setCardsByList((prev) => ({
        ...prev,
        [sourceListId]: sourceCards,
        [destListId]: destCards,
      }));

      try {
        await api.put(`/cards/${activeCardId}`, {
          list: destListId,
          order: destCards.length - 1,
        });
        socket.emit("boardUpdated", boardId);
      } catch (error) {
        console.log("Error moving card:", error.response?.data);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate("/boards")}
            className="text-sm text-blue-600 hover:underline mb-1"
          >
            ← Back to My Boards
          </button>
          <h1 className="text-2xl font-bold text-gray-800">TaskFlow Board</h1>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
        >
          Logout
        </button>
      </div>

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

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {lists.map((list) => (
            <DroppableList
              key={list._id}
              list={list}
              cards={cardsByList[list._id] || []}
              onAddCard={openAddCardModal}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </DndContext>

      <AddCardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddCard}
      />

      <CardDetailsModal
        card={selectedCard}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onSave={handleUpdateCard}
        onDelete={handleDeleteCard}
      />
    </div>
  );
}

export default BoardPage;