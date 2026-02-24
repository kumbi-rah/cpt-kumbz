import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateTrip } from "@/hooks/useTrips";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTripDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const createTrip = useCreateTrip();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    destination: "",
    lat: "",
    lng: "",
    start_date: "",
    end_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !user) return;
    try {
      const data = await createTrip.mutateAsync({
        name: form.name,
        destination: form.destination || null,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        created_by: user.id,
      });
      toast.success("Trip created!");
      onOpenChange(false);
      setForm({ name: "", destination: "", lat: "", lng: "", start_date: "", end_date: "" });
      navigate(`/trip/${data.id}`);
    } catch {
      toast.error("Failed to create trip");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle className="font-georgia text-ink">New Adventure</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input placeholder="Trip name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input placeholder="Destination (e.g. Paris, France)" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" step="any" placeholder="Latitude" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
            <Input type="number" step="any" placeholder="Longitude" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
          <Button type="submit" className="w-full bg-amber hover:bg-amber/90 text-white" disabled={createTrip.isPending}>
            {createTrip.isPending ? "Creating..." : "Create Trip"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
