
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
import toast from "react-hot-toast";
import DroppableList from "../components/DroppableList";
import AddCardModal from "../components/AddCardModal";
import CardDetailsModal from "../components/CardDetailsModal";
import InviteModal from "../components/InviteModal";
import MemberAvatars from "../components/MemberAvatars";
import SearchFilterBar from "../components/SearchFilterBar";
import ThemeSwitcher from "../components/ThemeSwitcher";

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

  const [boardDetails, setBoardDetails] = useState(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const [filters, setFilters] = useState({ search: "", priorities: [], assignee: "" });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    fetchLists();
    fetchBoardDetails();
    socket.emit("joinBoard", boardId);

    socket.on("refreshBoard", () => {
      fetchLists();
      fetchBoardDetails();
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

  const fetchBoardDetails = async () => {
    try {
      const response = await api.get(`/boards/${boardId}`);
      setBoardDetails(response.data);
    } catch (error) {
      console.log("Error fetching board details:", error.response?.data);
    }
  };

  // Filters ke hisaab se cards chhaanta hai
  const getFilteredCards = (listId) => {
    const cards = cardsByList[listId] || [];
    return cards.filter((card) => {
      const matchesSearch = card.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesPriority = filters.priorities.length === 0 || filters.priorities.includes(card.priority);
      const matchesAssignee =
        !filters.assignee || card.assignedTo?._id === filters.assignee || card.assignedTo === filters.assignee;
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      await api.post("/lists", { title: newListTitle, boardId, order: lists.length });
      setNewListTitle("");
      fetchLists();
      socket.emit("boardUpdated", boardId);
      toast.success("List added");
    } catch (error) {
      toast.error("Failed to add list");
    }
  };

  const handleRenameList = async (listId, newTitle) => {
    try {
      await api.put(`/lists/${listId}`, { title: newTitle });
      fetchLists();
      socket.emit("boardUpdated", boardId);
      toast.success("List renamed");
    } catch (error) {
      toast.error("Failed to rename list");
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm("Delete this list and all its cards?")) return;
    try {
      await api.delete(`/lists/${listId}`);
      fetchLists();
      socket.emit("boardUpdated", boardId);
      toast.success("List deleted");
    } catch (error) {
      toast.error("Failed to delete list");
    }
  };

  const openAddCardModal = (listId) => {
    setActiveListId(listId);
    setModalOpen(true);
  };

  const handleAddCard = async (title) => {
    try {
      await api.post("/cards", {
        title,
        listId: activeListId,
        order: cardsByList[activeListId]?.length || 0,
      });
      fetchCards(activeListId);
      socket.emit("boardUpdated", boardId);
      toast.success("Card added");
    } catch (error) {
      toast.error("Failed to add card");
    }
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setDetailsModalOpen(true);
  };

  const handleUpdateCard = async (cardId, updates) => {
    try {
      await api.put(`/cards/${cardId}`, updates);
      fetchCards(selectedCard.list);
      socket.emit("boardUpdated", boardId);
      toast.success("Card updated");
    } catch (error) {
      toast.error("Failed to update card");
    }
  };

  const handleDeleteCard = async (cardId, listId) => {
    try {
      await api.delete(`/cards/${cardId}`);
      fetchCards(listId);
      socket.emit("boardUpdated", boardId);
      toast.success("Card deleted");
    } catch (error) {
      toast.error("Failed to delete card");
    }
  };

  const handleRenameBoard = async () => {
    const newTitle = prompt("Enter new board name:", boardDetails?.title);
    if (!newTitle || !newTitle.trim() || newTitle === boardDetails?.title) return;
    try {
      await api.put(`/boards/${boardId}`, { title: newTitle.trim() });
      fetchBoardDetails();
      toast.success("Board renamed");
    } catch (error) {
      toast.error("Failed to rename board");
    }
  };

  const handleInviteMember = async (email) => {
    await api.post(`/boards/${boardId}/invite`, { email });
    fetchBoardDetails();
    toast.success("Member invited!");
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from the board?")) return;
    try {
      await api.delete(`/boards/${boardId}/members/${memberId}`);
      fetchBoardDetails();
      toast.success("Member removed");
    } catch (error) {
      toast.error("Failed to remove member");
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
    <div className="min-h-screen p-6" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate("/boards")}
            className="text-sm text-blue-600 hover:underline mb-1"
          >
            ← Back to My Boards
          </button>
          <h1
            onClick={handleRenameBoard}
            className="text-2xl font-bold cursor-pointer hover:text-blue-600"
            style={{ color: "var(--color-text)" }}
            title="Click to rename board"
          >
            {boardDetails?.title || "TaskFlow Board"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {boardDetails?.members && <MemberAvatars members={boardDetails.members} />}
          <button
            onClick={() => setInviteModalOpen(true)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            + Invite
          </button>
          <ThemeSwitcher />
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
          >
            Logout
          </button>
        </div>
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

      <SearchFilterBar
        members={boardDetails?.members}
        onFilterChange={setFilters}
      />

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {lists.map((list) => (
            <DroppableList
              key={list._id}
              list={list}
              cards={getFilteredCards(list._id)}
              onAddCard={openAddCardModal}
              onCardClick={handleCardClick}
              onRenameList={handleRenameList}
              onDeleteList={handleDeleteList}
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
        boardMembers={boardDetails?.members}
      />

      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={handleInviteMember}
        members={boardDetails?.members}
        currentUserIsOwner={boardDetails?.owner?._id === getUserIdFromToken()}
        onRemoveMember={handleRemoveMember}
      />
    </div>
  );
}

export default BoardPage;