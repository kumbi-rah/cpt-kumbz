import { useState, useCallback } from "react";
import { Check, Circle, Trash, Plus } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { useUpdateSection, type TripSection } from "@/hooks/useTrips";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface PackingItem {
  id: string;
  label: string;
  checked: boolean;
}

interface Props {
  section: TripSection;
}

function parseItems(content: Json | null): PackingItem[] {
  if (!content) return [];
  if (Array.isArray(content)) {
    return content.map((item: any) => ({
      id: item.id || crypto.randomUUID(),
      label: item.label || "",
      checked: !!item.checked,
    }));
  }
  return [];
}

export default function PackingList({ section }: Props) {
  const updateSection = useUpdateSection();
  const [items, setItems] = useState<PackingItem[]>(() => parseItems(section.content));
  const [newItem, setNewItem] = useState("");

  const persist = useCallback(
    (updated: PackingItem[]) => {
      setItems(updated);
      // Optimistic: UI already updated, persist in background
      updateSection.mutate(
        { id: section.id, content: updated as unknown as Json },
        { onError: () => toast.error("Failed to save") }
      );
    },
    [section.id, updateSection]
  );

  const toggle = (id: string) => {
    const updated = items.map((it) =>
      it.id === id ? { ...it, checked: !it.checked } : it
    );
    persist(updated);
  };

  const addItem = () => {
    const label = newItem.trim();
    if (!label) return;
    const updated = [...items, { id: crypto.randomUUID(), label, checked: false }];
    persist(updated);
    setNewItem("");
  };

  const removeItem = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    persist(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-2 py-1.5 px-2 rounded-md group hover:bg-accent/30 transition-colors"
        >
          <button
            onClick={() => toggle(item.id)}
            className="flex-shrink-0 transition-all duration-200"
          >
            {item.checked ? (
              <Check size={18} weight="bold" className="text-amber" />
            ) : (
              <Circle size={18} weight="regular" className="text-muted-foreground" />
            )}
          </button>
          <span
            className={`flex-1 text-sm transition-all duration-200 ${
              item.checked
                ? "line-through text-muted-foreground/60"
                : "text-ink"
            }`}
          >
            {item.label}
          </span>
          <button
            onClick={() => removeItem(item.id)}
            className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
          >
            <Trash size={14} />
          </button>
        </div>
      ))}

      <div className="flex items-center gap-2 pt-1">
        <Plus size={18} className="text-muted-foreground flex-shrink-0" />
        <Input
          placeholder="Add item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm border-dashed"
        />
      </div>
    </div>
  );
}
