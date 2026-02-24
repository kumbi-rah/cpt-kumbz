import { useState, useEffect, useRef, useCallback } from "react";
import { PencilSimple } from "@phosphor-icons/react";
import { useUpdateSection, type TripSection } from "@/hooks/useTrips";
import ReactMarkdown from "react-markdown";
import type { Json } from "@/integrations/supabase/types";

interface Props {
  section: TripSection;
}

function parseText(content: Json | null): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (typeof content === "object" && content !== null && "text" in content) {
    return String((content as Record<string, unknown>).text || "");
  }
  return "";
}

export default function QuickNotes({ section }: Props) {
  const updateSection = useUpdateSection();
  const [text, setText] = useState(() => parseText(section.content));
  const [editing, setEditing] = useState(() => !parseText(section.content));
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from prop on external changes
  useEffect(() => {
    const incoming = parseText(section.content);
    setText((prev) => (prev === incoming ? prev : incoming));
  }, [section.content]);

  const save = useCallback(
    (value: string) => {
      setSaveStatus("saving");
      updateSection.mutate(
        { id: section.id, content: { text: value } as unknown as Json },
        {
          onSuccess: () => {
            setSaveStatus("saved");
            fadeRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
          },
          onError: () => setSaveStatus("error"),
        }
      );
    },
    [section.id, updateSection]
  );

  const handleChange = (val: string) => {
    setText(val);
    setSaveStatus("idle");
    if (timerRef.current) clearTimeout(timerRef.current);
    if (fadeRef.current) clearTimeout(fadeRef.current);
    timerRef.current = setTimeout(() => save(val), 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (fadeRef.current) clearTimeout(fadeRef.current);
    };
  }, []);

  return (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{
        background: "#F5EDD6",
        border: "1px solid rgba(139,105,20,0.2)",
        padding: "20px 24px",
        boxShadow: "inset 0 0 30px rgba(80,50,10,0.08)",
      }}
    >
      {/* Edit pencil */}
      {!editing && (
        <button
          onClick={() => setEditing(true)}
          className="absolute top-3 right-3 opacity-50 hover:opacity-100 transition-opacity z-10"
        >
          <PencilSimple size={16} weight="duotone" color="#9A8F7E" />
        </button>
      )}

      {editing ? (
        <textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Nothing written yet, Captain. What's on your mind?"
          className="w-full bg-transparent outline-none placeholder:italic"
          style={{
            fontFamily: "'IM Fell English', Georgia, serif",
            fontSize: 15,
            color: "#2A2218",
            lineHeight: 1.8,
            minHeight: 200,
            resize: "none",
            border: "none",
            borderBottom: "1px solid rgba(200,131,42,0.4)",
          }}
          onBlur={() => {
            if (text.trim()) setEditing(false);
          }}
          autoFocus
        />
      ) : (
        <div
          onClick={() => setEditing(true)}
          className="cursor-text prose prose-sm max-w-none"
          style={{
            fontFamily: "'IM Fell English', Georgia, serif",
            fontSize: 15,
            color: "#2A2218",
            lineHeight: 1.8,
            minHeight: 80,
          }}
        >
          {text ? (
            <ReactMarkdown>{text}</ReactMarkdown>
          ) : (
            <p className="italic" style={{ color: "#9A8F7E" }}>
              Nothing written yet, Captain. What's on your mind?
            </p>
          )}
        </div>
      )}

      {/* Save status */}
      {saveStatus !== "idle" && (
        <p
          className="absolute bottom-2 right-3 text-[11px] italic transition-opacity"
          style={{
            fontFamily: "'IM Fell English', Georgia, serif",
            color: saveStatus === "error" ? "#C8832A" : "#9A8F7E",
            opacity: saveStatus === "saved" ? 0.6 : 1,
          }}
        >
          {saveStatus === "saving" && "Saving..."}
          {saveStatus === "saved" && "✓ Saved"}
          {saveStatus === "error" && "⚓ Failed to save"}
        </p>
      )}
    </div>
  );
}
