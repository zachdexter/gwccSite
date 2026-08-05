"use client";

import { ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";

type ReorderableListProps<T extends { id: number }> = {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T) => ReactNode;
};

export function ReorderableList<T extends { id: number }>({
  items,
  onReorder,
  renderItem,
}: ReorderableListProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  function move(index: number, dir: -1 | 1) {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= items.length) return;
    onReorder(arrayMove(items, index, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((item, index) => (
            <SortableRow key={item.id} id={item.id} index={index} total={items.length} onMove={move}>
              {renderItem(item)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  id,
  index,
  total,
  onMove,
  children,
}: {
  id: number;
  index: number;
  total: number;
  onMove: (index: number, dir: -1 | 1) => void;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <div className="flex flex-col items-center flex-shrink-0">
        <button
          type="button"
          onClick={() => onMove(index, -1)}
          disabled={index === 0}
          className="text-muted-foreground hover:text-gwcc-gold disabled:opacity-20 disabled:hover:text-muted-foreground"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <span className="w-5 text-center text-xs font-mono text-muted-foreground">{index + 1}</span>
        <button
          type="button"
          onClick={() => onMove(index, 1)}
          disabled={index === total - 1}
          className="text-muted-foreground hover:text-gwcc-gold disabled:opacity-20 disabled:hover:text-muted-foreground"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-gwcc-gold flex-shrink-0 touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
