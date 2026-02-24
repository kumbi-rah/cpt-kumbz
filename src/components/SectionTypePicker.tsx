import { Scroll, Star, ListChecks, Anchor, Notepad } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SECTION_TYPE_LABELS } from "@/lib/constants";
import type { TripSection } from "@/hooks/useTrips";

const PICKABLE_TYPES = [
  { type: "itinerary", icon: Scroll, label: "Itinerary" },
  { type: "recommendations", icon: Star, label: "Recommendations" },
  { type: "packing_list", icon: ListChecks, label: "Packing List" },
  { type: "lodging", icon: Anchor, label: "Lodging" },
  { type: "notes", icon: Notepad, label: "Notes" },
];

// Types that can only exist once per trip
const SINGLETON_TYPES = ["itinerary", "lodging", "notes"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingSections: TripSection[];
  onSelect: (type: string) => void;
}

export default function SectionTypePicker({ open, onOpenChange, existingSections, onSelect }: Props) {
  const existingTypes = existingSections.map((s) => s.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card max-w-md">
        <DialogHeader>
          <DialogTitle className="font-georgia">Add Section</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {PICKABLE_TYPES.map(({ type, icon: Icon, label }) => {
            const disabled = SINGLETON_TYPES.includes(type) && existingTypes.includes(type);
            return (
              <button
                key={type}
                disabled={disabled}
                onClick={() => {
                  onSelect(type);
                  onOpenChange(false);
                }}
                className="flex flex-col items-center gap-2 p-5 rounded-lg border transition-colors"
                style={{
                  background: disabled ? "hsl(36 13% 55% / 0.1)" : "#F5EDD6",
                  borderColor: disabled ? "transparent" : "rgba(139,105,20,0.2)",
                  opacity: disabled ? 0.4 : 1,
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!disabled) (e.currentTarget.style.borderColor = "#C8832A");
                }}
                onMouseLeave={(e) => {
                  if (!disabled) (e.currentTarget.style.borderColor = "rgba(139,105,20,0.2)");
                }}
              >
                <Icon size={28} weight="duotone" style={{ color: disabled ? "#9A8F7E" : "#C8832A" }} />
                <span
                  className="font-georgia text-sm"
                  style={{ color: disabled ? "#9A8F7E" : "#2A2218" }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
