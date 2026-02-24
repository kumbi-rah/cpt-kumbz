import { useState } from "react";
import { format } from "date-fns";
import { Trash, PencilSimple, Plus } from "@phosphor-icons/react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (a: Arrival) => {
    setEditingId(a.id);
    setForm({
      person_name: a.person_name || "",
      flight_number: a.flight_number || "",
      arrival_datetime: a.arrival_datetime ? a.arrival_datetime.slice(0, 16) : "",
      notes: a.notes || "",
    });
    setDialogOpen(true);
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
        toast.success("Arrival updated");
      } else {
        await createArrival.mutateAsync({
          trip_id: tripId,
          person_name: form.person_name || null,
          flight_number: form.flight_number || null,
          arrival_datetime: form.arrival_datetime || null,
          notes: form.notes || null,
        });
        toast.success("Arrival added");
      }
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch {
      toast.error("Failed to save arrival");
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
        <Button size="sm" variant="outline" onClick={openAdd} className="gap-1">
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
                <TableHead className="w-20" />
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
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(a)} className="text-amber hover:text-amber/80">
                        <PencilSimple size={16} weight="duotone" />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="text-destructive hover:text-destructive/80">
                        <Trash size={16} weight="duotone" />
                      </button>
                    </div>
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
            <DialogTitle className="font-georgia">{editingId ? "Edit Arrival" : "Add Arrival"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input placeholder="Person name" value={form.person_name} onChange={(e) => setForm({ ...form, person_name: e.target.value })} />
            <Input placeholder="Flight number" value={form.flight_number} onChange={(e) => setForm({ ...form, flight_number: e.target.value })} />
            <Input type="datetime-local" value={form.arrival_datetime} onChange={(e) => setForm({ ...form, arrival_datetime: e.target.value })} />
            <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <Button type="submit" className="w-full bg-amber hover:bg-amber/90 text-white">
              {editingId ? "Save Changes" : "Add Arrival"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
