import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUpdateTrip, type Trip } from "@/hooks/useTrips";
import { toast } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin } from "lucide-react";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip;
}

function parseCityCountry(result: NominatimResult): { city: string; country: string } {
  const addr = result.address;
  if (addr) {
    const city = addr.city || addr.town || addr.village || addr.county || addr.state || "";
    const country = addr.country || "";
    return { city, country };
  }
  const parts = result.display_name.split(",").map((s) => s.trim());
  return { city: parts[0] || "", country: parts[parts.length - 1] || "" };
}

export default function EditTripDialog({ open, onOpenChange, trip }: Props) {
  const updateTrip = useUpdateTrip();
  const [form, setForm] = useState({
    name: "",
    destination: "",
    city: "",
    country: "",
    lat: "",
    lng: "",
    start_date: "",
    end_date: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (open && trip) {
      setForm({
        name: trip.name || "",
        destination: trip.destination || "",
        city: trip.city || "",
        country: trip.country || "",
        lat: trip.lat?.toString() || "",
        lng: trip.lng?.toString() || "",
        start_date: trip.start_date || "",
        end_date: trip.end_date || "",
      });
      setSearchQuery(trip.destination || "");
    }
  }, [open, trip]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1`
        );
        const data: NominatimResult[] = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const handleSelect = (result: NominatimResult) => {
    const { city, country } = parseCityCountry(result);
    const displayDest = [city, country].filter(Boolean).join(", ");
    setForm((prev) => ({
      ...prev,
      destination: displayDest,
      city,
      country,
      lat: result.lat,
      lng: result.lon,
    }));
    setSearchQuery(displayDest);
    setPopoverOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      await updateTrip.mutateAsync({
        id: trip.id,
        name: form.name,
        destination: form.destination || null,
        city: form.city || null,
        country: form.country || null,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      });
      toast.success("Trip updated!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update trip");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-georgia text-ink text-lg">Edit Trip</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input placeholder="Trip name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search destination..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPopoverOpen(true);
                  }}
                  onFocus={() => { if (searchQuery.length >= 2) setPopoverOpen(true); }}
                  className="pl-9"
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] z-50 bg-popover" align="start" sideOffset={4}>
              <Command>
                <CommandList>
                  {searching && <div className="py-3 text-center text-sm text-muted-foreground">Searching...</div>}
                  {!searching && results.length === 0 && searchQuery.length >= 2 && (
                    <CommandEmpty>No locations found.</CommandEmpty>
                  )}
                  {results.length > 0 && (
                    <CommandGroup>
                      {results.map((r, i) => {
                        const { city, country } = parseCityCountry(r);
                        const label = [city, country].filter(Boolean).join(", ") || r.display_name;
                        return (
                          <CommandItem key={`${r.lat}-${r.lon}-${i}`} onSelect={() => handleSelect(r)} className="cursor-pointer">
                            <MapPin className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{label}</span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Start date</label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">End date</label>
              <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          <Button type="submit" className="w-full bg-amber hover:bg-amber/90 text-white" disabled={updateTrip.isPending}>
            {updateTrip.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
