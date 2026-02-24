import { useState } from "react";
import { format } from "date-fns";
import { Trash, PencilSimple, Plus, Anchor } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useArrivals, useCreateArrival, useDeleteArrival, useUpdateArrival, type Arrival } from "@/hooks/useTrips";
import { toast } from "sonner";

interface Props {
  tripId: string;
}

const emptyForm = { person_name: "", flight_number: "", arrival_datetime: "", notes: "" };

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
    setForm({
      person_name: a.person_name || "",
      flight_number: a.flight_number || "",
      arrival_datetime: a.arrival_datetime ? a.arrival_datetime.slice(0, 16) : "",
      notes: a.notes || "",
    });
    setSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateArrival.mutateAsync({
          id: editingId,
          person_name: form.person_name || null,
          flight_number: form.flight_number || null,
          arrival_datetime: form.arrival_datetime || null,
          notes: form.notes || null,
        });
        toast.success("Crew member updated");
      } else {
        await createArrival.mutateAsync({
          trip_id: tripId,
          person_name: form.person_name || null,
          flight_number: form.flight_number || null,
          arrival_datetime: form.arrival_datetime || null,
          notes: form.notes || null,
        });
        toast.success("Crew member added");
      }
      setSheetOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteArrival.mutateAsync(id);
      toast.success("Crew member removed");
    } catch {
      toast.error("Failed to remove");
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
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : arrivals.length === 0 ? (
        <div className="py-12 flex flex-col items-center text-center parchment-bg rounded-xl border border-amber/20 relative overflow-hidden">
          <div className="grain-overlay rounded-xl" />
          <Anchor size={40} weight="duotone" className="text-amber mb-3 opacity-40 relative z-10" />
          <p className="text-sm text-muted-foreground italic font-treasure relative z-10">No crew members yet — who's joining the voyage?</p>
        </div>
      ) : (
        <div className="space-y-2">
          {arrivals.map((a, i) => (
            <div
              key={a.id}
              className="flex items-start gap-3 p-3 bg-card rounded-lg border cursor-pointer hover:bg-accent/30 transition-colors animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
              onClick={() => openEdit(a)}
            >
              <div className="flex-shrink-0 mt-0.5">
                <Anchor size={22} weight="duotone" className="text-amber" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-georgia font-bold text-ink text-sm">
                  {a.person_name || "Unknown"}
                </p>
                {a.flight_number && (
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">
                    {a.flight_number}
                  </p>
                )}
                {a.arrival_datetime && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(a.arrival_datetime), "h:mm a · MMM d")}
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
            <Input type="datetime-local" value={form.arrival_datetime} onChange={(e) => setForm({ ...form, arrival_datetime: e.target.value })} />
            <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <Button type="submit" className="w-full bg-amber hover:bg-amber/90 text-white">
              {editingId ? "Save Changes" : "Add Crew Member"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
