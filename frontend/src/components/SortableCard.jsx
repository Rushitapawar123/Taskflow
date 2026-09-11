import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableCard({ card, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm text-gray-700 shadow-sm hover:shadow transition flex justify-between items-start gap-2 cursor-grab active:cursor-grabbing"
    >
      <span>{card.title}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(card._id, card.list);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="text-gray-400 hover:text-red-500 text-xs font-bold"
        title="Delete card"
      >
        ✕
      </button>
    </div>
  );
}

export default SortableCard;