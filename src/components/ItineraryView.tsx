import { useState } from "react";
import { PencilSimple, Trash, Check, X } from "@phosphor-icons/react";
import {
  useItineraryItems,
  useToggleItineraryCompleted,
  useCreateItineraryItem,
  useDeleteItineraryItem,
  type TripSection,
  type ItineraryItem,
} from "@/hooks/useTrips";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toRoman } from "@/lib/romanNumerals";

interface Props {
  section: TripSection;
  tripId: string;
  readOnly?: boolean;
}

/* ── Inline edit form (shared by edit + add) ── */
function ItemForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: { item_time: string; activity: string; description: string };
  onSave: (v: { item_time: string; activity: string; description: string }) => void;
  onCancel: () => void;
}) {
  const [time, setTime] = useState(initial.item_time);
  const [activity, setActivity] = useState(initial.activity);
  const [desc, setDesc] = useState(initial.description);

  const submit = () => {
    if (!activity.trim()) return;
    onSave({ item_time: time, activity, description: desc });
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="ml-[56px] space-y-2 py-2">
      <input
        value={time}
        onChange={(e) => setTime(e.target.value)}
        onKeyDown={handleKey}
        placeholder="9:00 AM"
        className="w-28 bg-transparent border-b border-[#8B6914]/40 text-[13px] italic outline-none py-1 placeholder:text-[#9A8F7E]"
        style={{ fontFamily: "'IM Fell English', Georgia, serif", color: "#8B6914" }}
        autoFocus
      />
      <input
        value={activity}
        onChange={(e) => setActivity(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Activity..."
        className="w-full bg-transparent border-b border-[#8B6914]/40 text-[15px] font-bold outline-none py-1 placeholder:text-[#9A8F7E]"
        style={{ fontFamily: "'IM Fell English', Georgia, serif", color: "#2A2218" }}
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Description (optional)"
        rows={2}
        className="w-full bg-transparent border-b border-[#8B6914]/40 text-[13px] italic outline-none py-1 placeholder:text-[#9A8F7E] resize-none"
        style={{ fontFamily: "'IM Fell English', Georgia, serif", color: "#5A4F3E" }}
      />
      <div className="flex items-center gap-3">
        <button onClick={submit} className="text-[12px] font-bold flex items-center gap-1" style={{ fontFamily: "'IM Fell English', Georgia, serif", color: "#C8832A" }}>
          <Check size={12} weight="bold" /> Save
        </button>
        <button onClick={onCancel} className="text-[12px] flex items-center gap-1" style={{ fontFamily: "'IM Fell English', Georgia, serif", color: "#9A8F7E" }}>
          <X size={12} /> Cancel
        </button>
      </div>
    </div>
  );
}

/* ── Single itinerary item ── */
function TimelineItem({
  item,
  tripId,
  readOnly,
}: {
  item: ItineraryItem;
  tripId: string;
  readOnly?: boolean;
}) {
  const toggleCompleted = useToggleItineraryCompleted();
  const deleteItem = useDeleteItineraryItem();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const completed = !!item.completed;

  const handleToggle = () => {
    if (readOnly) return;
    toggleCompleted.mutate(
      { id: item.id, completed: !completed },
      { onError: () => toast.error("⚓ Failed to update item — try again") }
    );
  };

  const handleSave = async (vals: { item_time: string; activity: string; description: string }) => {
    const { error } = await supabase
      .from("itinerary_items")
      .update({
        item_time: vals.item_time || null,
        activity: vals.activity,
        description: vals.description || null,
      } as any)
      .eq("id", item.id);
    if (error) {
      toast.error("⚓ Failed to update item — try again");
    } else {
      qc.invalidateQueries({ queryKey: ["itinerary_items"] });
    }
    setEditing(false);
  };

  const handleDelete = () => {
    deleteItem.mutate(item.id, {
      onError: () => toast.error("⚓ Failed to delete item"),
    });
  };

  if (editing && !readOnly) {
    return (
      <div className="mb-7">
        <ItemForm
          initial={{
            item_time: item.item_time || "",
            activity: item.activity,
            description: item.description || "",
          }}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
        {/* Delete row */}
        <div className="ml-[56px] mt-1">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-[11px] flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: "#c0392b" }}
            >
              <Trash size={11} /> Remove this stop
            </button>
          ) : (
            <span className="text-[11px]" style={{ color: "#c0392b", fontFamily: "'IM Fell English', Georgia, serif" }}>
              Remove this stop?{" "}
              <button onClick={handleDelete} className="font-bold underline mr-2">Yes</button>
              <button onClick={() => setConfirmDelete(false)} className="underline" style={{ color: "#9A8F7E" }}>No</button>
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <li className="flex items-start gap-0 mb-7 relative group">
      {/* ✕ / ✓ marker */}
      <button
        onClick={handleToggle}
        disabled={readOnly}
        className="absolute flex items-center justify-center transition-all duration-200"
        style={{
          left: 12,
          top: 2,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#F5EDD6",
          border: `2px solid ${completed ? "#4A7A82" : "#8B6914"}`,
          cursor: readOnly ? "default" : "pointer",
          fontFamily: "'IM Fell English', Georgia, serif",
          fontSize: 14,
          fontWeight: "bold",
          color: completed ? "#4A7A82" : "#3A2A1A",
          transform: "skew(-2deg, 1deg)",
          zIndex: 5,
        }}
        title={readOnly ? undefined : completed ? "Mark incomplete" : "Mark complete"}
      >
        {completed ? "✓" : "✕"}
      </button>

      {/* Time badge + content */}
      <div className={`flex items-start gap-2.5 transition-all duration-200 ${completed ? "opacity-45" : ""}`} style={{ marginLeft: 46 }}>
        {item.item_time && (
          <span
            className="flex-shrink-0 self-start mt-[3px] inline-block"
            style={{
              background: "rgba(200,131,42,0.15)",
              border: "1px solid #C8832A",
              borderRadius: 20,
              padding: "1px 8px",
              fontFamily: "'IM Fell English', Georgia, serif",
              fontStyle: "italic",
              fontSize: 11,
              color: "#8B6914",
            }}
          >
            {item.item_time}
          </span>
        )}

        <div className="flex-1 min-w-0">
          <p
            className={completed ? "line-through" : ""}
            style={{
              fontFamily: "'IM Fell English', Georgia, serif",
              fontWeight: "bold",
              fontSize: 15,
              color: completed ? "#9A8F7E" : "#2A2218",
              lineHeight: 1.4,
            }}
          >
            {item.activity}
          </p>
          {item.description && (
            <p
              style={{
                fontFamily: "'IM Fell English', Georgia, serif",
                fontStyle: "italic",
                fontSize: 13,
                color: "#5A4F3E",
                lineHeight: 1.6,
                marginTop: 4,
              }}
            >
              {item.description}
            </p>
          )}
        </div>

        {/* Edit pencil */}
        {!readOnly && (
          <button
            onClick={() => setEditing(true)}
            className="flex-shrink-0 opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity mt-1"
          >
            <PencilSimple size={14} weight="duotone" color="#C8832A" />
          </button>
        )}
      </div>
    </li>
  );
}

/* ── Main component ── */
export default function ItineraryView({ section, tripId, readOnly }: Props) {
  const { data: items = [] } = useItineraryItems(tripId);
  const createItem = useCreateItineraryItem();
  const [addingDay, setAddingDay] = useState<number | null>(null);
  const [addingNewDay, setAddingNewDay] = useState(false);

  const days = [...new Set(items.map((it) => it.day_number))].sort((a, b) => a - b);
  const maxDay = days.length > 0 ? Math.max(...days) : 0;

  const handleAddStop = async (dayNumber: number, vals: { item_time: string; activity: string; description: string }) => {
    const dayItems = items.filter((it) => it.day_number === dayNumber);
    const maxSort = dayItems.length > 0 ? Math.max(...dayItems.map((it) => (it as any).sort_order ?? 0)) : -1;
    createItem.mutate(
      {
        trip_id: tripId,
        day_number: dayNumber,
        item_time: vals.item_time || null,
        activity: vals.activity,
        description: vals.description || null,
        sort_order: maxSort + 1,
      } as any,
      {
        onSuccess: () => { setAddingDay(null); setAddingNewDay(false); },
        onError: () => toast.error("⚓ Failed to add item"),
      }
    );
  };

  const handleAddDay = () => {
    setAddingNewDay(true);
  };

  /* ── Empty state ── */
  if (items.length === 0 && !addingNewDay) {
    return (
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          background: "#F5EDD6",
          border: "1px solid rgba(139,105,20,0.25)",
          padding: "28px 24px",
          boxShadow: "inset 0 0 40px rgba(80,50,10,0.12)",
        }}
      >
        {/* Grain */}
        <div className="grain-overlay rounded-lg" style={{ opacity: 0.08 }} />
        {/* Vignette */}
        <div className="absolute inset-0 rounded-lg pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(80,50,10,0.18) 100%)" }} />

        <div className="relative z-10 text-center py-8">
          {/* Dotted trail going nowhere */}
          <svg width="2" height="60" className="mx-auto mb-4" style={{ opacity: 0.4 }}>
            <line x1="1" y1="0" x2="1" y2="60" stroke="#8B6914" strokeWidth="1.5" strokeDasharray="8 5" />
          </svg>
          <p style={{ fontFamily: "'IM Fell English', Georgia, serif", fontStyle: "italic", fontSize: 16, color: "#5A4F3E" }}>
            No stops charted yet, Captain
          </p>
          {!readOnly && (
            <button
              onClick={handleAddDay}
              className="mt-4 inline-block"
              style={{
                fontFamily: "'IM Fell English', Georgia, serif",
                fontStyle: "italic",
                fontSize: 13,
                color: "#C8832A",
                border: "1px dashed #8B6914",
                borderRadius: 6,
                padding: "8px 16px",
                background: "transparent",
              }}
            >
              + Chart your first stop
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{
        background: "#F5EDD6",
        border: "1px solid rgba(139,105,20,0.25)",
        padding: "28px 24px",
        boxShadow: "inset 0 0 40px rgba(80,50,10,0.12)",
      }}
    >
      {/* Grain overlay */}
      <div className="grain-overlay rounded-lg" style={{ opacity: 0.08 }} />
      {/* Vignette */}
      <div className="absolute inset-0 rounded-lg pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(80,50,10,0.18) 100%)" }} />

      <div className="relative z-10">
        {/* Section title */}
        <h3
          style={{
            fontFamily: "'Cinzel', Georgia, serif",
            fontWeight: 700,
            fontSize: 18,
            color: "#3B2F1E",
            marginBottom: 20,
          }}
        >
          {section.title || "Itinerary"}
        </h3>

        {/* Days */}
        {(addingNewDay && days.length === 0 ? [maxDay + 1] : days).map((day, dayIdx) => {
          const dayItems = items.filter((it) => it.day_number === day);
          return (
            <div key={day}>
              {/* Day header */}
              <div className="flex items-center gap-3" style={{ marginTop: dayIdx > 0 ? 24 : 0, marginBottom: 16 }}>
                <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, #8B6914, transparent)", opacity: 0.4 }} />
                <span
                  style={{
                    fontFamily: "'Cinzel', Georgia, serif",
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: 3,
                    textTransform: "uppercase" as const,
                    color: "#5A3E10",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  Day {toRoman(day)}
                </span>
                <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, #8B6914, transparent)", opacity: 0.4 }} />
              </div>

              {/* Timeline items */}
              <div className="relative">
                {/* Vertical trail line */}
                {dayItems.length > 0 && (
                  <svg
                    className="absolute z-0"
                    style={{ left: 22, top: 12, height: "calc(100% - 24px)" }}
                    width="2"
                  >
                    <line
                      x1="1" y1="0" x2="1" y2="100%"
                      stroke={dayItems.every((it) => it.completed) ? "#4A7A82" : "#8B6914"}
                      strokeWidth="1.5"
                      strokeDasharray="8 5"
                      opacity={dayItems.every((it) => it.completed) ? 0.5 : 0.65}
                    />
                  </svg>
                )}

                <ul className="relative z-10 list-none p-0 m-0">
                  {dayItems.map((item) => (
                    <TimelineItem key={item.id} item={item} tripId={tripId} readOnly={readOnly} />
                  ))}
                </ul>
              </div>

              {/* Add stop form / button */}
              {!readOnly && (
                addingDay === day ? (
                  <ItemForm
                    initial={{ item_time: "", activity: "", description: "" }}
                    onSave={(vals) => handleAddStop(day, vals)}
                    onCancel={() => setAddingDay(null)}
                  />
                ) : (
                  <button
                    onClick={() => setAddingDay(day)}
                    className="w-full mt-1 mb-2"
                    style={{
                      fontFamily: "'IM Fell English', Georgia, serif",
                      fontStyle: "italic",
                      fontSize: 13,
                      color: "#C8832A",
                      border: "1px dashed #8B6914",
                      borderRadius: 6,
                      padding: "8px",
                      background: "transparent",
                      opacity: 0.7,
                    }}
                  >
                    + Add stop to Day {toRoman(day)}
                  </button>
                )
              )}
            </div>
          );
        })}

        {/* Add new day form */}
        {!readOnly && addingNewDay && days.length === 0 && (
          <ItemForm
            initial={{ item_time: "", activity: "", description: "" }}
            onSave={(vals) => handleAddStop(maxDay + 1, vals)}
            onCancel={() => setAddingNewDay(false)}
          />
        )}

        {/* Add day button */}
        {!readOnly && days.length > 0 && (
          addingNewDay ? (
            <div style={{ marginTop: 16 }}>
              {/* Show new day header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, #8B6914, transparent)", opacity: 0.4 }} />
                <span style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: 14, letterSpacing: 3, textTransform: "uppercase" as const, color: "#5A3E10" }}>
                  Day {toRoman(maxDay + 1)}
                </span>
                <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, #8B6914, transparent)", opacity: 0.4 }} />
              </div>
              <ItemForm
                initial={{ item_time: "", activity: "", description: "" }}
                onSave={(vals) => handleAddStop(maxDay + 1, vals)}
                onCancel={() => setAddingNewDay(false)}
              />
            </div>
          ) : (
            <button
              onClick={handleAddDay}
              className="w-full mt-4"
              style={{
                fontFamily: "'IM Fell English', Georgia, serif",
                fontStyle: "italic",
                fontSize: 14,
                color: "#C8832A",
                border: "1px dashed #8B6914",
                borderRadius: 6,
                padding: "10px",
                background: "transparent",
              }}
            >
              + Add Day {toRoman(maxDay + 1)}
            </button>
          )
        )}
      </div>
    </div>
  );
}
