"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useConfirm } from "@/components/useConfirm";
import { ReorderableList } from "@/components/ReorderableList";
import { toast } from "sonner";

type FaqQuestion = {
  id: number;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
};

export default function FaqAdminPage() {
  const [questions, setQuestions] = useState<FaqQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<FaqQuestion | null>(null);
  const [form, setForm] = useState({ question: "", answer: "" });
  const [saving, setSaving] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    async function fetchQuestions() {
      const res = await fetch("/api/faq");
      if (res.ok) setQuestions(await res.json());
      setLoading(false);
    }
    fetchQuestions();
  }, []);

  function resetForm() {
    setForm({ question: "", answer: "" });
    setEditing(null);
    setShowAdd(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    if (editing) {
      const res = await fetch("/api/faq", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form }),
      });
      if (res.ok) {
        const updated = await res.json();
        setQuestions((prev) => prev.map((q) => (q.id === editing.id ? updated : q)));
        toast.success("Updated");
      } else {
        toast.error("Failed to update question");
      }
    } else {
      const res = await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, displayOrder: questions.length }),
      });
      if (res.ok) {
        const q = await res.json();
        setQuestions((prev) => [...prev, q]);
        toast.success("Question added");
      } else {
        toast.error("Failed to add question");
      }
    }

    resetForm();
    setSaving(false);
  }

  async function remove(id: number, question: string) {
    if (!(await confirm(`Remove "${question}"?`))) return;
    const res = await fetch("/api/faq", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success("Removed");
    } else {
      toast.error("Failed to remove question");
    }
  }

  function startEdit(q: FaqQuestion) {
    setEditing(q);
    setForm({ question: q.question, answer: q.answer });
    setShowAdd(true);
  }

  async function handleReorder(newOrder: FaqQuestion[]) {
    const changed = newOrder
      .map((q, i) => ({ id: q.id, displayOrder: i, prev: q.displayOrder }))
      .filter((q) => q.displayOrder !== q.prev);

    setQuestions(newOrder.map((q, i) => ({ ...q, displayOrder: i })));

    await Promise.all(
      changed.map(({ id, displayOrder }) =>
        fetch("/api/faq", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, displayOrder }),
        })
      )
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {ConfirmDialog}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">FAQ</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{questions.length} questions</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowAdd(true);
          }}
          className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90 font-semibold"
        >
          + Add Question
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={save} className="bg-card border border-border rounded-lg p-4 space-y-4">
          <h2 className="text-card-foreground font-semibold">{editing ? "Edit Question" : "New Question"}</h2>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Question *</Label>
            <input
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              required
              className="w-full h-10 px-3 rounded-md bg-muted border border-border text-foreground text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Answer *</Label>
            <textarea
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              required
              rows={4}
              className="w-full px-3 py-2 rounded-md bg-muted border border-border text-foreground text-sm resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90">
              {saving ? "Saving…" : editing ? "Save Changes" : "Add Question"}
            </Button>
            <Button type="button" variant="ghost" onClick={resetForm} className="text-muted-foreground">
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading…</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No questions yet.</div>
        ) : (
          <ReorderableList
            items={questions}
            onReorder={handleReorder}
            renderItem={(q) => (
              <div className="flex items-center gap-4 bg-card border border-border rounded-lg px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-card-foreground font-medium truncate">{q.question}</p>
                  <p className="text-muted-foreground text-xs mt-0.5 truncate">{q.answer}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(q)}
                    className="text-xs text-muted-foreground hover:text-gwcc-gold transition-colors"
                  >
                    Edit
                  </button>
                  <Button variant="destructive" size="xs" onClick={() => remove(q.id, q.question)}>
                    Remove
                  </Button>
                </div>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}
