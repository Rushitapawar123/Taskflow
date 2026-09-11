import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableCard from "./SortableCard";

function DroppableList({ list, cards, onAddCard, onDeleteCard }) {
  const { setNodeRef } = useDroppable({ id: list._id });

  return (
    <div className="bg-white rounded-xl shadow p-4 w-72 flex-shrink-0">
      <h2 className="font-semibold text-gray-700 mb-3 border-b pb-2">{list.title}</h2>

      <div ref={setNodeRef} className="space-y-2 mb-3 min-h-[60px]">
        <SortableContext items={cards.map((c) => c._id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <SortableCard key={card._id} card={{ ...card, list: list._id }} onDelete={onDeleteCard} />
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