import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableCard from "./SortableCard";

function DroppableList({ list, cards, onAddCard, onCardClick, onRenameList, onDeleteList }) {
  const { setNodeRef } = useDroppable({ id: list._id });
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(list.title);

  const handleRenameSubmit = () => {
    if (titleInput.trim() && titleInput !== list.title) {
      onRenameList(list._id, titleInput.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 w-72 flex-shrink-0">
      <div className="flex justify-between items-center mb-3 border-b pb-2 gap-2">
        {isEditing ? (
          <input
            autoFocus
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
            className="font-semibold text-gray-700 border border-blue-300 rounded px-2 py-1 flex-1 text-sm"
          />
        ) : (
          <h2
            onClick={() => setIsEditing(true)}
            className="font-semibold text-gray-700 cursor-pointer hover:text-blue-600"
            title="Click to rename"
          >
            {list.title}
          </h2>
        )}
        <button
          onClick={() => onDeleteList(list._id)}
          className="text-gray-300 hover:text-red-500 text-sm"
          title="Delete list"
        >
          ✕
        </button>
      </div>

      <div ref={setNodeRef} className="space-y-2 mb-3 min-h-[60px]">
        <SortableContext items={cards.map((c) => c._id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <SortableCard key={card._id} card={{ ...card, list: list._id }} onCardClick={onCardClick} />
          ))}
        </SortableContext>
      </div>

      <button
        onClick={() => onAddCard(list._id)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        + Add Card
      </button>
    </div>
  );
}

export default DroppableList;