import { useState, useEffect } from "react";
import { Plus, Trash } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SECTION_TYPE_LABELS } from "@/lib/constants";
import {
  useCreateSection,
  useUpdateSection,
  useItineraryItems,
  useBulkSaveItineraryItems,
  type TripSection,
} from "@/hooks/useTrips";
import { toast } from "sonner";

interface Props {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editSection?: TripSection | null;
}

interface EditorItem {
  day_number: number;
  item_time: string;
  activity: string;
  description: string;
}

const SECTION_TYPES = Object.keys(SECTION_TYPE_LABELS);

export default function SectionEditor({ tripId, open, onOpenChange, editSection }: Props) {
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const bulkSave = useBulkSaveItineraryItems();
  const { data: dbItems = [] } = useItineraryItems(editSection?.type === "itinerary" ? tripId : "");

  const [type, setType] = useState("itinerary");
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [items, setItems] = useState<EditorItem[]>([{ day_number: 1, item_time: "", activity: "", description: "" }]);

  useEffect(() => {
    if (!open) return;
    if (editSection) {
      setType(editSection.type);
      setTitle(editSection.title || "");
      if (editSection.type === "itinerary") {
        // Load from DB items
        if (dbItems.length > 0) {
          setItems(dbItems.map((it) => ({
            day_number: it.day_number,
            item_time: it.item_time || "",
            activity: it.activity,
            description: it.description || "",
          })));
        } else {
          setItems([{ day_number: 1, item_time: "", activity: "", description: "" }]);
        }
      } else {
        setTextContent(typeof editSection.content === "string" ? editSection.content : JSON.stringify(editSection.content || "", null, 2));
        setItems([{ day_number: 1, item_time: "", activity: "", description: "" }]);
      }
    } else {
      setType("itinerary");
      setTitle("");
      setTextContent("");
      setItems([{ day_number: 1, item_time: "", activity: "", description: "" }]);
    }
  }, [editSection, open, dbItems]);

  const addItem = (dayNumber?: number) => {
    const day = dayNumber || (items.length > 0 ? items[items.length - 1].day_number : 1);
    setItems([...items, { day_number: day, item_time: "", activity: "", description: "" }]);
  };

  const addDay = () => {
    const maxDay = items.reduce((max, it) => Math.max(max, it.day_number), 0);
    setItems([...items, { day_number: maxDay + 1, item_time: "", activity: "", description: "" }]);
  };

  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: keyof EditorItem, value: string | number) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const handleSave = async () => {
    try {
      if (type === "itinerary") {
        // Ensure a trip_sections row exists for itinerary
        if (!editSection) {
          await createSection.mutateAsync({
            trip_id: tripId,
            type: "itinerary",
            title: title || undefined,
            content: null,
            is_public: false,
            sort_order: 0,
          });
        } else if (title !== (editSection.title || "")) {
          await updateSection.mutateAsync({ id: editSection.id, title: title || undefined });
        }

        // Bulk save items to itinerary_items table
        const validItems = items.filter((it) => it.activity.trim());
        await bulkSave.mutateAsync({
          tripId,
          items: validItems.map((it, idx) => ({
            day_number: it.day_number,
            item_time: it.item_time,
            activity: it.activity,
            description: it.description,
            sort_order: idx,
          })),
        });
        toast.success(editSection ? "Itinerary updated" : "Itinerary created");
      } else {
        // Non-itinerary: use JSONB content as before
        if (editSection) {
          await updateSection.mutateAsync({
            id: editSection.id,
            title: title || undefined,
            content: textContent as any,
          });
          toast.success("Section updated");
        } else {
          await createSection.mutateAsync({
            trip_id: tripId,
            type,
            title: title || undefined,
            content: textContent as any,
            is_public: false,
            sort_order: 0,
          });
          toast.success("Section created");
        }
      }
      onOpenChange(false);
    } catch {
      toast.error("Failed to save section");
    }
  };

  // Group items by day for display
  const days = [...new Set(items.map((it) => it.day_number))].sort((a, b) => a - b);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-georgia">
            {editSection ? "Edit Section" : "Add Section"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!editSection && (
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECTION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{SECTION_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Input
            placeholder="Section title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {type === "itinerary" ? (
            <div className="space-y-4">
              {days.map((day) => (
                <div key={day} className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider treasure-map-text">
                    Day {day}
                  </p>
                  {items.map((item, i) => {
                    if (item.day_number !== day) return null;
                    return (
                      <div key={i} className="flex gap-2 items-start">
                        <Input
                          placeholder="Time"
                          value={item.item_time}
                          onChange={(e) => updateItem(i, "item_time", e.target.value)}
                          className="w-24 flex-shrink-0 text-xs"
                        />
                        <Input
                          placeholder="Activity"
                          value={item.activity}
                          onChange={(e) => updateItem(i, "activity", e.target.value)}
                          className="flex-1 text-xs"
                        />
                        <button onClick={() => removeItem(i)} className="text-destructive mt-2.5">
                          <Trash size={14} />
                        </button>
                      </div>
                    );
                  })}
                  <Button type="button" variant="ghost" size="sm" onClick={() => addItem(day)} className="gap-1 text-xs h-7">
                    <Plus size={12} weight="bold" /> Add item to Day {day}
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addDay} className="gap-1 w-full">
                <Plus size={14} weight="bold" /> Add Day
              </Button>
            </div>
          ) : (
            <Textarea
              placeholder="Section content..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={6}
            />
          )}

          <Button onClick={handleSave} className="w-full bg-amber hover:bg-amber/90 text-white">
            {editSection ? "Save Changes" : "Create Section"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
