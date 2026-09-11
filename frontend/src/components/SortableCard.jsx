import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const priorityColors = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

function SortableCard({ card, onCardClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onCardClick(card)}
      className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm text-gray-700 shadow-sm hover:shadow transition cursor-grab active:cursor-grabbing"
    >
      <p className="mb-2">{card.title}</p>

      <div className="flex items-center gap-2 flex-wrap">
        {card.priority && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[card.priority]}`}>
            {card.priority}
          </span>
        )}
        {card.dueDate && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${isOverdue ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
            {new Date(card.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </div>
  );
}

export default SortableCard;