"use client";

import { useEffect, useRef, useState } from "react";
import { notFound } from "next/navigation";

type Item = {
  id: string;
  src: string;
  xPct: number;
  yPct: number;
  size: number;
  rotate: number;
};

const initialItems: Item[] = [
  { id: "star1", src: "/navysvgs/star1.svg", xPct: 10, yPct: 6, size: 32, rotate: 6 },
  { id: "star7", src: "/navysvgs/star7.svg", xPct: 88, yPct: 15, size: 20, rotate: -12 },
  { id: "star12", src: "/navysvgs/star12.svg", xPct: 18, yPct: 90, size: 28, rotate: 45 },
  { id: "star19", src: "/navysvgs/star19.svg", xPct: 84, yPct: 80, size: 20, rotate: 12 },
  { id: "climbstar", src: "/navysvgs/climbstar.svg", xPct: 4, yPct: 38, size: 48, rotate: -6 },
  { id: "carabiner", src: "/navysvgs/carabiner.svg", xPct: 94, yPct: 68, size: 40, rotate: 12 },
  { id: "chalkbag", src: "/navysvgs/chalkbag.svg", xPct: 78, yPct: 96, size: 44, rotate: -6 },
  { id: "helmet", src: "/navysvgs/helmet.svg", xPct: 72, yPct: 4, size: 36, rotate: 3 },
  { id: "hold3", src: "/navysvgs/hold3.svg", xPct: 97, yPct: 55, size: 56, rotate: 12 },
  { id: "hold7", src: "/navysvgs/hold7.svg", xPct: 8, yPct: 70, size: 36, rotate: -12 },
  { id: "mountain", src: "/navysvgs/mountain.svg", xPct: 92, yPct: 82, size: 48, rotate: 3 },
  { id: "quickdraw", src: "/navysvgs/quickdraw.svg", xPct: 20, yPct: 25, size: 28, rotate: 6 },
  { id: "rockon", src: "/navysvgs/rockon.svg", xPct: 24, yPct: 62, size: 36, rotate: -6 },
  { id: "rope2", src: "/navysvgs/rope2.svg", xPct: 35, yPct: 10, size: 40, rotate: 12 },
  { id: "sclip", src: "/navysvgs/sclip.svg", xPct: 38, yPct: 92, size: 28, rotate: -3 },
];

let nextId = 0;

export default function ScatterEditor() {
  if (process.env.NODE_ENV === "production") notFound();

  const [items, setItems] = useState<Item[]>(initialItems);
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [available, setAvailable] = useState<string[]>([]);
  const [folder, setFolder] = useState<"navysvgs" | "whitesvgs">("navysvgs");
  const containerRef = useRef<HTMLDivElement>(null);
  const dragId = useRef<string | null>(null);

  useEffect(() => {
    fetch(`/api/dev/svgs?dir=${folder}`)
      .then((r) => r.json())
      .then((data) => setAvailable(data.files ?? []))
      .catch(() => setAvailable([]));
  }, [folder]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        const active = document.activeElement;
        const isEditingInput = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement;
        if (!isEditingInput) {
          deleteItem(selected);
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function updateItem(id: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function addItem(filename: string) {
    const id = `${filename.replace(".svg", "")}-${nextId++}`;
    const newItem: Item = {
      id,
      src: `/${folder}/${filename}`,
      xPct: 50,
      yPct: 50,
      size: 32,
      rotate: 0,
    };
    setItems((prev) => [...prev, newItem]);
    setSelected(id);
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setSelected((prev) => (prev === id ? null : prev));
  }

  function onPointerDown(e: React.PointerEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    dragId.current = id;
    setSelected(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragId.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    updateItem(dragId.current, { xPct, yPct });
  }

  function onPointerUp() {
    dragId.current = null;
  }

  const selectedItem = items.find((it) => it.id === selected) ?? null;

  function generateCode() {
    return items
      .map(
        (it) =>
          `<img src="${it.src}" alt="" className="pointer-events-none select-none absolute" style={{ left: "${it.xPct.toFixed(1)}%", top: "${it.yPct.toFixed(1)}%", width: ${it.size}, height: ${it.size}, transform: "translate(-50%, -50%) rotate(${it.rotate}deg)" }} />`
      )
      .join("\n");
  }

  async function copyCode() {
    await navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="min-h-screen bg-background flex">
      <div
        ref={containerRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative flex-1 h-screen overflow-hidden bg-gwcc-dark border-r border-border"
        onClick={() => setSelected(null)}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full max-w-sm border border-dashed border-gwcc-gold/30 rounded-lg p-8 text-center text-muted-foreground text-sm">
            login card area (for reference)
          </div>
        </div>

        {items.map((it) => (
          <img
            key={it.id}
            src={it.src}
            alt=""
            onPointerDown={(e) => onPointerDown(e, it.id)}
            onClick={(e) => e.stopPropagation()}
            className={`select-none absolute cursor-grab active:cursor-grabbing ${
              selected === it.id ? "ring-2 ring-gwcc-gold rounded-full" : ""
            }`}
            style={{
              left: `${it.xPct}%`,
              top: `${it.yPct}%`,
              width: it.size,
              height: it.size,
              transform: `translate(-50%, -50%) rotate(${it.rotate}deg)`,
              touchAction: "none",
            }}
          />
        ))}
      </div>

      <div className="w-80 shrink-0 h-screen overflow-y-auto p-4 space-y-4 text-foreground">
        <h1 className="text-lg font-bold">Scatter Editor</h1>
        <p className="text-xs text-muted-foreground">
          Drag icons around on the left. Click one to select it and tweak size/rotation. When happy,
          copy the code and paste it into the login page.
        </p>

        {selectedItem ? (
          <div className="space-y-3 border border-border rounded-md p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">{selectedItem.id}</div>
              <button
                onClick={() => deleteItem(selectedItem.id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </div>
            <label className="block text-xs text-muted-foreground">
              Size: {selectedItem.size}px
              <input
                type="range"
                min={12}
                max={96}
                value={selectedItem.size}
                onChange={(e) => updateItem(selectedItem.id, { size: Number(e.target.value) })}
                className="w-full"
              />
            </label>
            <label className="block text-xs text-muted-foreground">
              Rotation: {selectedItem.rotate}°
              <input
                type="range"
                min={-180}
                max={180}
                value={selectedItem.rotate}
                onChange={(e) => updateItem(selectedItem.id, { rotate: Number(e.target.value) })}
                className="w-full"
              />
            </label>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground italic">
            Click an icon to edit it. Select + press Delete/Backspace to remove.
          </div>
        )}

        <div className="border border-border rounded-md p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">Add from /{folder}</div>
            <div className="flex gap-1">
              <button
                onClick={() => setFolder("navysvgs")}
                className={`text-xs px-2 py-1 rounded ${
                  folder === "navysvgs" ? "bg-gwcc-gold text-gwcc-dark" : "border border-border text-muted-foreground"
                }`}
              >
                Navy
              </button>
              <button
                onClick={() => setFolder("whitesvgs")}
                className={`text-xs px-2 py-1 rounded ${
                  folder === "whitesvgs" ? "bg-gwcc-gold text-gwcc-dark" : "border border-border text-muted-foreground"
                }`}
              >
                White
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            {available.map((filename) => (
              <button
                key={filename}
                title={filename}
                onClick={() => addItem(filename)}
                className="aspect-square flex items-center justify-center border border-border rounded hover:border-gwcc-gold bg-card p-1"
              >
                <img src={`/${folder}/${filename}`} alt={filename} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={copyCode}
          className="w-full bg-gwcc-gold text-gwcc-dark font-semibold rounded-md py-2 text-sm"
        >
          {copied ? "Copied!" : "Copy code"}
        </button>

        <div className="text-xs text-muted-foreground">
          <div className="font-semibold mb-1">Current items ({items.length})</div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {items.map((it) => (
              <div
                key={it.id}
                onClick={() => setSelected(it.id)}
                className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
                  selected === it.id ? "bg-gwcc-gold/20" : "hover:bg-card"
                }`}
              >
                <span>
                  {it.id} — {it.xPct.toFixed(0)}%, {it.yPct.toFixed(0)}%
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(it.id);
                  }}
                  className="text-red-400 hover:text-red-300 ml-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
