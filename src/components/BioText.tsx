import { cn } from "@/lib/utils";

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    const match = part.match(/^\*\*([^*]+)\*\*$/);
    return match ? <strong key={i}>{match[1]}</strong> : part;
  });
}

export function BioText({ text, className }: { text: string; className?: string }) {
  return <p className={cn("whitespace-pre-wrap", className)}>{renderInline(text)}</p>;
}
