import { useState } from "react";
import { format } from "date-fns";
import { Trash, PencilSimple, Plus } from "@phosphor-icons/react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useArrivals, useCreateArrival, useDeleteArrival, type Arrival } from "@/hooks/useTrips";
import { toast } from "sonner";

interface Props {
  tripId: string;
}

export default function ArrivalTracker({ tripId }: Props) {
  const { data: arrivals = [], isLoading } = useArrivals(tripId);
  const createArrival = useCreateArrival();
  const deleteArrival = useDeleteArrival();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ person_name: "", flight_number: "", arrival_datetime: "", notes: "" });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createArrival.mutateAsync({
        trip_id: tripId,
        person_name: form.person_name || null,
        flight_number: form.flight_number || null,
        arrival_datetime: form.arrival_datetime || null,
        notes: form.notes || null,
      });
      toast.success("Arrival added");
      setDialogOpen(false);
      setForm({ person_name: "", flight_number: "", arrival_datetime: "", notes: "" });
    } catch {
      toast.error("Failed to add arrival");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteArrival.mutateAsync(id);
      toast.success("Arrival removed");
    } catch {
      toast.error("Failed to remove");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-georgia font-bold text-ink">Arrivals</h3>
        <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)} className="gap-1">
          <Plus size={14} weight="bold" /> Add
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : arrivals.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No arrivals tracked yet</p>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Flight</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {arrivals.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.person_name || "—"}</TableCell>
                  <TableCell>{a.flight_number || "—"}</TableCell>
                  <TableCell className="text-xs">
                    {a.arrival_datetime ? format(new Date(a.arrival_datetime), "MMM d, h:mm a") : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{a.notes || "—"}</TableCell>
                  <TableCell>
                    <button onClick={() => handleDelete(a.id)} className="text-destructive hover:text-destructive/80">
                      <Trash size={16} weight="duotone" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="font-georgia">Add Arrival</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <Input placeholder="Person name" value={form.person_name} onChange={(e) => setForm({ ...form, person_name: e.target.value })} />
            <Input placeholder="Flight number" value={form.flight_number} onChange={(e) => setForm({ ...form, flight_number: e.target.value })} />
            <Input type="datetime-local" value={form.arrival_datetime} onChange={(e) => setForm({ ...form, arrival_datetime: e.target.value })} />
            <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <Button type="submit" className="w-full bg-amber hover:bg-amber/90 text-white">Add Arrival</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
