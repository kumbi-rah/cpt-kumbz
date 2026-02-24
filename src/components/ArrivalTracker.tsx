import { useState } from "react";
import { format } from "date-fns";
import { Trash, Plus, AirplaneTakeoff } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useArrivals, useCreateArrival, useDeleteArrival, useUpdateArrival, type Arrival } from "@/hooks/useTrips";
import { toast } from "sonner";

interface Props {
  tripId: string;
}

const emptyForm = { person_name: "", flight_number: "", arrival_date: "", arrival_time: "", notes: "" };

export default function ArrivalTracker({ tripId }: Props) {
  const { data: arrivals = [], isLoading } = useArrivals(tripId);
  const createArrival = useCreateArrival();
  const deleteArrival = useDeleteArrival();
  const updateArrival = useUpdateArrival();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSheetOpen(true);
  };

  const openEdit = (a: Arrival) => {
    setEditingId(a.id);
    const dt = a.arrival_datetime ? new Date(a.arrival_datetime) : null;
    setForm({
      person_name: a.person_name || "",
      flight_number: a.flight_number || "",
      arrival_date: dt ? format(dt, "yyyy-MM-dd") : "",
      arrival_time: dt ? format(dt, "HH:mm") : "",
      notes: a.notes || "",
    });
    setSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const datetime = form.arrival_date && form.arrival_time
      ? `${form.arrival_date}T${form.arrival_time}:00`
      : form.arrival_date ? `${form.arrival_date}T00:00:00` : null;
    try {
      if (editingId) {
        await updateArrival.mutateAsync({
          id: editingId,
          person_name: form.person_name || null,
          flight_number: form.flight_number || null,
          arrival_datetime: datetime,
          notes: form.notes || null,
        });
        toast.success("⚓ Crew member updated");
      } else {
        await createArrival.mutateAsync({
          trip_id: tripId,
          person_name: form.person_name || null,
          flight_number: form.flight_number || null,
          arrival_datetime: datetime,
          notes: form.notes || null,
        });
        toast.success("⚓ Crew member added");
      }
      setSheetOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch {
      toast.error("⚓ Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteArrival.mutateAsync(id);
      toast.success("⚓ Crew member removed");
    } catch {
      toast.error("⚓ Failed to remove");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-georgia font-bold text-ink section-header-line flex-1">The Crew</h3>
        <Button size="sm" variant="outline" onClick={openAdd} className="gap-1 ml-3">
          <Plus size={14} weight="bold" /> Add
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-[10px]" />
          ))}
        </div>
      ) : arrivals.length === 0 ? (
        <div className="py-12 flex flex-col items-center text-center rounded-xl border relative overflow-hidden" style={{ background: "#F5EDD6", borderColor: "rgba(139,105,20,0.2)" }}>
          {/* Ship silhouette watermark */}
          <svg viewBox="0 0 400 120" className="w-full max-w-[240px] mx-auto mb-4 opacity-[0.12]" fill="none">
            <path d="M180,45 L200,20 L200,60 L160,60 Z" fill="currentColor" />
            <path d="M155,60 L205,60 L195,80 L160,80 Z" fill="currentColor" />
            <line x1="200" y1="20" x2="200" y2="60" stroke="currentColor" strokeWidth="2" />
            <path d="M140,82 Q200,70 260,82" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          <p className="font-georgia text-lg text-ink mb-1">No crew members yet</p>
          <p className="font-georgia italic text-[13px] text-muted-foreground mb-4">Who's joining this voyage, Captain?</p>
          <button
            onClick={openAdd}
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
            + Add Crew Member
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {arrivals.map((a, i) => (
            <div
              key={a.id}
              className="flex items-start gap-3 rounded-[10px] cursor-pointer hover:shadow-md transition-shadow animate-fade-in-up"
              style={{
                background: "#FAF7F2",
                border: "1px solid rgba(80,60,30,0.13)",
                padding: "14px 16px",
                animationDelay: `${i * 60}ms`,
              }}
              onClick={() => openEdit(a)}
            >
              <div className="flex-1 min-w-0">
                <p className="font-georgia font-bold text-ink text-sm">
                  🏴‍☠️ {a.person_name || "Unknown"}
                </p>
                {a.flight_number && (
                  <p className="text-xs font-mono text-muted-foreground mt-0.5 flex items-center gap-1">
                    <AirplaneTakeoff size={12} weight="duotone" className="text-amber" />
                    {a.flight_number}
                  </p>
                )}
                {a.arrival_datetime && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(a.arrival_datetime), "MMM d · h:mm a")}
                  </p>
                )}
                {a.notes && (
                  <p className="text-xs text-muted-foreground italic mt-1 truncate">
                    {a.notes}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                className="text-destructive hover:text-destructive/80 p-1"
              >
                <Trash size={16} weight="duotone" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="bg-card">
          <SheetHeader>
            <SheetTitle className="font-georgia">{editingId ? "Edit Crew Member" : "Add Crew Member"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-4">
            <Input placeholder="Person name" value={form.person_name} onChange={(e) => setForm({ ...form, person_name: e.target.value })} />
            <Input placeholder="Flight number" value={form.flight_number} onChange={(e) => setForm({ ...form, flight_number: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={form.arrival_date} onChange={(e) => setForm({ ...form, arrival_date: e.target.value })} />
              <Input type="time" value={form.arrival_time} onChange={(e) => setForm({ ...form, arrival_time: e.target.value })} />
            </div>
            <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <Button type="submit" className="w-full pirate-btn">
              {editingId ? "Save Changes" : "Board the Ship ⚓"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
