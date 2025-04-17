import { useDraggable } from "@dnd-kit/core";

export function DraggableCard({ task, setActiveTask }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id.toString(),
  });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="border border-gray-300 p-5 rounded shadow hover:shadow-md cursor-pointer"
      onMouseDown={() => setActiveTask(task)}
    >
      <h2 className="font-semibold line-clamp-1 pb-2">{task.title}</h2>
      <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
    </div>
  );
}
