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
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PhotoStripItem = { key: string };

type PhotoReorderStripProps<T extends PhotoStripItem> = {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T) => ReactNode;
};

export function PhotoReorderStrip<T extends PhotoStripItem>({
  items,
  onReorder,
  renderItem,
}: PhotoReorderStripProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.key === active.id);
    const newIndex = items.findIndex((i) => i.key === over.id);
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  function move(index: number, dir: -1 | 1) {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= items.length) return;
    onReorder(arrayMove(items, index, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.key)} strategy={horizontalListSortingStrategy}>
        <div className="flex flex-wrap gap-3">
          {items.map((item, index) => (
            <SortableThumb key={item.key} id={item.key} index={index} total={items.length} onMove={move}>
              {renderItem(item)}
            </SortableThumb>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableThumb({
  id,
  index,
  total,
  onMove,
  children,
}: {
  id: string;
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
    <div ref={setNodeRef} style={style} className="flex flex-col items-center gap-1">
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        {children}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onMove(index, -1)}
          disabled={index === 0}
          className="text-muted-foreground hover:text-gwcc-gold disabled:opacity-20 disabled:hover:text-muted-foreground"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-mono text-muted-foreground">{index + 1}</span>
        <button
          type="button"
          onClick={() => onMove(index, 1)}
          disabled={index === total - 1}
          className="text-muted-foreground hover:text-gwcc-gold disabled:opacity-20 disabled:hover:text-muted-foreground"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
