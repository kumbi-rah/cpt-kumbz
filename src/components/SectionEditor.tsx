import { useState, useEffect } from "react";
import { Plus, Trash, X as XIcon } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SECTION_TYPE_LABELS } from "@/lib/constants";
import { useCreateSection, useUpdateSection, type TripSection } from "@/hooks/useTrips";
import { toast } from "sonner";

interface Props {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editSection?: TripSection | null;
}

interface ItineraryItem {
  time: string;
  activity: string;
}

const SECTION_TYPES = Object.keys(SECTION_TYPE_LABELS);

export default function SectionEditor({ tripId, open, onOpenChange, editSection }: Props) {
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const [type, setType] = useState("itinerary");
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [items, setItems] = useState<ItineraryItem[]>([{ time: "", activity: "" }]);

  useEffect(() => {
    if (editSection) {
      setType(editSection.type);
      setTitle(editSection.title || "");
      if (editSection.type === "itinerary" && Array.isArray(editSection.content)) {
        setItems((editSection.content as unknown as ItineraryItem[]).length > 0
          ? (editSection.content as unknown as ItineraryItem[])
          : [{ time: "", activity: "" }]);
      } else {
        setTextContent(typeof editSection.content === "string" ? editSection.content : JSON.stringify(editSection.content || "", null, 2));
        setItems([{ time: "", activity: "" }]);
      }
    } else {
      setType("itinerary");
      setTitle("");
      setTextContent("");
      setItems([{ time: "", activity: "" }]);
    }
  }, [editSection, open]);

  const addItem = () => setItems([...items, { time: "", activity: "" }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof ItineraryItem, value: string) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const handleSave = async () => {
    const content = type === "itinerary"
      ? items.filter((it) => it.time || it.activity)
      : textContent;

    try {
      if (editSection) {
        await updateSection.mutateAsync({
          id: editSection.id,
          title: title || undefined,
          content: content as any,
        });
        toast.success("Section updated");
      } else {
        await createSection.mutateAsync({
          trip_id: tripId,
          type,
          title: title || undefined,
          content: content as any,
          is_public: false,
          sort_order: 0,
        });
        toast.success("Section created");
      }
      onOpenChange(false);
    } catch {
      toast.error("Failed to save section");
    }
  };

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
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Itinerary Items</p>
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <Input
                    placeholder="Time (e.g. 9:00 AM)"
                    value={item.time}
                    onChange={(e) => updateItem(i, "time", e.target.value)}
                    className="w-32 flex-shrink-0"
                  />
                  <Input
                    placeholder="Activity / description"
                    value={item.activity}
                    onChange={(e) => updateItem(i, "activity", e.target.value)}
                    className="flex-1"
                  />
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)} className="text-destructive mt-2.5">
                      <Trash size={16} />
                    </button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
                <Plus size={14} weight="bold" /> Add Item
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
