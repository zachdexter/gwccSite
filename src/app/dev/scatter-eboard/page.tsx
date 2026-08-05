"use client";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { EboardGrid } from "@/components/EboardGrid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type EboardMember = {
  id: number;
  name: string;
  role: string;
  year: string;
  headshotUrl: string | null;
};

type Zone = "header" | "left" | "right";

type Item = {
  id: string;
  zone: Zone;
  src: string;
  xPct: number;
  yPct: number;
  size: number;
  rotate: number;
};

const ZONE_LABELS: Record<Zone, string> = {
  header: "Header (scrolls away)",
  left: "Left side (fixed)",
  right: "Right side (fixed)",
};

let nextId = 0;

export default function ScatterEboardEditor() {
  const [members, setMembers] = useState<EboardMember[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [available, setAvailable] = useState<string[]>([]);
  const [folder, setFolder] = useState<"navysvgs" | "whitesvgs">("whitesvgs");
  const [pickerZone, setPickerZone] = useState<Zone>("header");
  const [pickerOpen, setPickerOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const dragId = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/eboard")
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
    const newItem: Item = {
      id,
      zone: pickerZone,
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

  function makeOnPointerMove(ref: React.RefObject<HTMLDivElement | null>) {
    return (e: React.PointerEvent) => {
      if (!dragId.current || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const xPct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
      const yPct = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
      updateItem(dragId.current, { xPct, yPct });
    };
  }

  const onHeaderPointerMove = makeOnPointerMove(headerRef);
  const onLeftPointerMove = makeOnPointerMove(leftRef);
  const onRightPointerMove = makeOnPointerMove(rightRef);

  function onPointerUp() {
    dragId.current = null;
  }

  const selectedItem = items.find((it) => it.id === selected) ?? null;
  const headerItems = items.filter((it) => it.zone === "header");
  const leftItems = items.filter((it) => it.zone === "left");
  const rightItems = items.filter((it) => it.zone === "right");

  function renderIcon(it: Item) {
    return (
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
    );
  }

  function generateCode() {
    function section(zone: Zone, label: string) {
      const zoneItems = items.filter((it) => it.zone === zone);
      if (zoneItems.length === 0) return `// --- ${label} --- (none)`;
      const body = zoneItems
        .map(
          (it) =>
            `  { src: "${it.src}", left: ${it.xPct.toFixed(1)}, top: ${it.yPct.toFixed(1)}, size: ${it.size}${
              it.rotate ? `, rotate: ${it.rotate}` : ""
            } },`
        )
        .join("\n");
      return `// --- ${label} ---\n${body}`;
    }
    return [section("header", "HEADER icons"), section("left", "LEFT side icons"), section("right", "RIGHT side icons")].join(
      "\n\n"
    );
  }

  async function copyCode() {
    await navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="min-h-screen bg-background" onClick={() => setSelected(null)}>
      <div
        ref={leftRef}
        onPointerMove={onLeftPointerMove}
        onPointerUp={onPointerUp}
        onClick={(e) => e.stopPropagation()}
        className="fixed left-0 top-0 h-screen w-56 overflow-hidden border-r border-dashed border-gwcc-gold/30 bg-gwcc-dark/40"
      >
        {leftItems.map(renderIcon)}
      </div>
      <div
        ref={rightRef}
        onPointerMove={onRightPointerMove}
        onPointerUp={onPointerUp}
        onClick={(e) => e.stopPropagation()}
        className="fixed right-0 top-0 h-screen w-56 overflow-hidden border-l border-dashed border-gwcc-gold/30 bg-gwcc-dark/40"
      >
        {rightItems.map(renderIcon)}
      </div>

      <SiteHeader />
      <main className="px-6 py-16 max-w-5xl mx-auto w-full">
        <div
          ref={headerRef}
          onPointerMove={onHeaderPointerMove}
          onPointerUp={onPointerUp}
          onClick={(e) => e.stopPropagation()}
          className="relative mb-12 outline outline-dashed outline-gwcc-gold/20"
        >
          <div className="pointer-events-none">
            <div className="font-heading text-gwcc-gold/70 text-sm uppercase tracking-[0.25em] mb-3">
              Leadership
            </div>
            <h1 className="font-heading text-5xl md:text-6xl leading-tight text-foreground">Meet the Leadership Team</h1>
          </div>
          {headerItems.map(renderIcon)}
        </div>

        <div className="pointer-events-none">
          {members.length === 0 ? (
            <div className="text-muted-foreground text-center py-20">Loading real eboard data…</div>
          ) : (
            <EboardGrid members={members} />
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
            <div className="text-xs text-muted-foreground">{ZONE_LABELS[selectedItem.zone]}</div>
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
          <span className="text-xs text-muted-foreground px-1">{items.length} icon{items.length === 1 ? "" : "s"}</span>
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
              Pick a zone, then click an icon to drop it in and drag it into place. Header icons scroll away with
              the page; left/right side icons are fixed to the screen. Dialog stays open so you can add more.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-1">
            {(["header", "left", "right"] as Zone[]).map((z) => (
              <button
                key={z}
                onClick={() => setPickerZone(z)}
                className={`text-xs px-2 py-1 rounded flex-1 ${
                  pickerZone === z ? "bg-gwcc-gold text-gwcc-dark" : "border border-border text-muted-foreground"
                }`}
              >
                {ZONE_LABELS[z]}
              </button>
            ))}
          </div>

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
                      [{it.zone}] {it.id} — {it.xPct.toFixed(0)}%, {it.yPct.toFixed(0)}%
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
