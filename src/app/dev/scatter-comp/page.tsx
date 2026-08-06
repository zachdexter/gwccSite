"use client";

import { useEffect, useRef, useState } from "react";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { CompTeamGrid } from "@/components/CompTeamGrid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type CompMember = {
  id: number;
  name: string;
  year: string;
  bio: string | null;
  headshotUrl: string | null;
};

type Item = {
  id: string;
  src: string;
  x: number;
  y: number;
  size: number;
  rotate: number;
};

// Author against the narrowest real case — the cluster stays small/tight to the text, so
// it reads correctly at any wider viewport too (see /components/CompDecorIcons.tsx).
const CANVAS_WIDTH = 343; // ~390px phone viewport minus px-6 padding on each side

let nextId = 0;

export default function ScatterCompEditor() {
  if (process.env.NODE_ENV === "production") notFound();

  const [members, setMembers] = useState<CompMember[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [available, setAvailable] = useState<string[]>([]);
  const [folder, setFolder] = useState<"navysvgs" | "whitesvgs">("whitesvgs");
  const [pickerOpen, setPickerOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const dragId = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/comp")
      .then((r) => r.json())
      .then((data) => setMembers(data ?? []))
      .catch(() => setMembers([]));
  }, []);

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
    const rect = headerRef.current?.getBoundingClientRect();
    const newItem: Item = {
      id,
      src: `/${folder}/${filename}`,
      x: rect ? rect.width / 2 : CANVAS_WIDTH / 2,
      y: rect ? rect.height / 2 : 50,
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
    if (!dragId.current || !headerRef.current) return;
    const rect = headerRef.current.getBoundingClientRect();
    const x = Math.min(rect.width, Math.max(0, e.clientX - rect.left));
    const y = Math.min(rect.height, Math.max(0, e.clientY - rect.top));
    updateItem(dragId.current, { x, y });
  }

  function onPointerUp() {
    dragId.current = null;
  }

  const selectedItem = items.find((it) => it.id === selected) ?? null;

  function generateCode() {
    if (items.length === 0) return "// (no icons placed yet)";
    return items
      .map(
        (it) =>
          `  { src: "${it.src}", left: ${it.x.toFixed(1)}, top: ${it.y.toFixed(1)}, size: ${it.size}${
            it.rotate ? `, rotate: ${it.rotate}` : ""
          } },`
      )
      .join("\n");
  }

  async function copyCode() {
    await navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="min-h-screen bg-background" onClick={() => setSelected(null)}>
      <SiteHeader />
      <main className="px-6 py-16 mx-auto w-full" style={{ maxWidth: CANVAS_WIDTH + 48 }}>
        <div
          ref={headerRef}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClick={(e) => e.stopPropagation()}
          className="relative py-20 mb-12 overflow-hidden outline outline-dashed outline-gwcc-gold/20"
        >
          <div className="pointer-events-none">
            <div className="font-heading text-gwcc-gold/70 text-sm uppercase tracking-[0.25em] mb-3">
              Competitive Team
            </div>
            <h1 className="font-heading leading-tight text-foreground text-5xl">Meet the Team</h1>
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
                left: it.x,
                top: it.y,
                width: it.size,
                height: it.size,
                transform: `translate(-50%, -50%) rotate(${it.rotate}deg)`,
                touchAction: "none",
              }}
            />
          ))}
        </div>

        <div className="pointer-events-none">
          {members.length === 0 ? (
            <div className="text-muted-foreground text-center py-20">Loading real comp team data…</div>
          ) : (
            <CompTeamGrid members={members} />
          )}
        </div>
      </main>

      {/* Floating controls — fixed, so they never affect the canvas width */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
        {selectedItem && (
          <div className="w-72 bg-popover border border-border rounded-lg p-3 space-y-2 shadow-lg text-foreground">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold truncate">{selectedItem.id}</div>
              <button
                onClick={() => deleteItem(selectedItem.id)}
                className="text-xs text-red-400 hover:text-red-300 flex-shrink-0"
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
        )}

        <div className="flex items-center gap-2 bg-popover border border-border rounded-lg p-2 shadow-lg">
          <span className="text-xs text-muted-foreground px-1">
            {items.length} icon{items.length === 1 ? "" : "s"}
          </span>
          <button
            onClick={copyCode}
            disabled={items.length === 0}
            className="bg-gwcc-gold text-gwcc-dark font-semibold rounded-md px-3 py-1.5 text-sm disabled:opacity-40"
          >
            {copied ? "Copied!" : "Copy code"}
          </button>
          <button
            onClick={() => setPickerOpen(true)}
            className="bg-card border border-border text-foreground rounded-md px-3 py-1.5 text-sm hover:border-gwcc-gold"
          >
            + Add Icon
          </button>
        </div>
      </div>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add an icon</DialogTitle>
            <DialogDescription>
              Click an icon to drop it into the header area and drag it into place. Dialog stays open so you can
              add more. Keep the cluster small and close to the text — it&apos;s shown at every viewport width now, and
              a separate procedural fill covers the rest of the page.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-foreground">/{folder}</div>
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

          <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto">
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

          {items.length > 0 && (
            <div className="text-xs text-muted-foreground border-t border-border pt-3">
              <div className="font-semibold mb-1 text-foreground">Current items ({items.length})</div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {items.map((it) => (
                  <div
                    key={it.id}
                    onClick={() => {
                      setSelected(it.id);
                      setPickerOpen(false);
                    }}
                    className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
                      selected === it.id ? "bg-gwcc-gold/20" : "hover:bg-card"
                    }`}
                  >
                    <span>
                      {it.id} — {it.x.toFixed(0)}px, {it.y.toFixed(0)}px
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
