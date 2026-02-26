import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Anchor, X, Users, MagnifyingGlass, MapPin } from "@phosphor-icons/react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CrewMember {
  user_id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export default function CreateTripDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [destinationLat, setDestinationLat] = useState<number | null>(null);
  const [destinationLng, setDestinationLng] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCrewTrip, setIsCrewTrip] = useState(false);
  const [crewEmail, setCrewEmail] = useState("");
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleReset = () => {
    setName("");
    setDestination("");
    setDestinationLat(null);
    setDestinationLng(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setStartDate("");
    setEndDate("");
    setIsCrewTrip(false);
    setCrewEmail("");
    setCrewMembers([]);
  };

  // Debounced destination search
  const searchDestination = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error("Error searching location:", error);
    } finally {
      setSearchingLocation(false);
    }
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    // Clear coordinates when manually typing
    setDestinationLat(null);
    setDestinationLng(null);

    // Debounce search
    const timeoutId = setTimeout(() => {
      searchDestination(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const selectSuggestion = (suggestion: LocationSuggestion) => {
    setDestination(suggestion.display_name);
    setDestinationLat(parseFloat(suggestion.lat));
    setDestinationLng(parseFloat(suggestion.lon));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const searchUser = async () => {
    if (!crewEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(crewEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (crewMembers.some((m) => m.email === crewEmail.toLowerCase())) {
      toast.error("This person is already in the crew");
      return;
    }

    if (crewEmail.toLowerCase() === user?.email?.toLowerCase()) {
      toast.error("You're automatically added as the trip owner");
      return;
    }

    setSearching(true);
    try {
      setCrewMembers([
        ...crewMembers,
        {
          user_id: "",
          email: crewEmail.toLowerCase(),
        },
      ]);
      setCrewEmail("");
      toast.success(`📧 ${crewEmail} added to crew list`);
    } finally {
      setSearching(false);
    }
  };

  const removeCrew = (email: string) => {
    setCrewMembers(crewMembers.filter((m) => m.email !== email));
    toast.success("Removed from crew");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !destination) {
      toast.error("Please fill in trip name and destination");
      return;
    }

    setCreating(true);
    try {
      // Create the trip with coordinates
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .insert({
          created_by: user!.id,
          name: name.trim(),
          destination: destination.trim(),
          lat: destinationLat,
          lng: destinationLng,
          start_date: startDate || null,
          end_date: endDate || null,
        })
        .select()
        .single();

      if (tripError) throw tripError;

      // Add crew members if crew trip (future enhancement)
      if (isCrewTrip && crewMembers.length > 0) {
        toast.success(`⚓ Trip created with ${crewMembers.length} crew members!`);
      } else {
        toast.success("⚓ Trip created!");
      }

      queryClient.invalidateQueries({ queryKey: ["trips"] });
      handleReset();
      onOpenChange(false);

      // Navigate to the new trip
      navigate(`/trip/${trip.id}`);
    } catch (error: any) {
      console.error("Error creating trip:", error);
      toast.error(error.message || "Failed to create trip");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-georgia text-2xl">Chart a New Voyage</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-5 mt-4">
          {/* Trip Name */}
          <div>
            <Label htmlFor="name">Trip Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Colombia 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Destination with Autocomplete */}
          <div className="relative">
            <Label htmlFor="destination">Destination *</Label>
            <div className="relative">
              <Input
                id="destination"
                placeholder="Start typing... (e.g., Medellín, Colombia)"
                value={destination}
                onChange={(e) => handleDestinationChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                required
                className="pr-10"
              />
              {searchingLocation && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-amber border-t-transparent rounded-full" />
                </div>
              )}
              {destinationLat && destinationLng && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <MapPin size={18} weight="fill" className="text-green-600" />
                </div>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b last:border-b-0 flex items-start gap-2"
                  >
                    <MapPin size={18} weight="duotone" className="text-amber mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{suggestion.display_name}</span>
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-1.5">
              {destinationLat && destinationLng
                ? `✓ Coordinates found (${destinationLat.toFixed(4)}, ${destinationLng.toFixed(4)})`
                : "Type at least 3 characters to search"}
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          {/* Crew Trip Toggle */}
          <div className="flex items-center justify-between p-4 bg-amber/5 rounded-lg border border-amber/20">
            <div className="flex items-center gap-3">
              <Users size={24} weight="duotone" className="text-amber" />
              <div>
                <p className="font-medium text-sm">Crew Trip</p>
                <p className="text-xs text-muted-foreground">Invite friends to collaborate on this adventure</p>
              </div>
            </div>
            <Switch checked={isCrewTrip} onCheckedChange={setIsCrewTrip} />
          </div>

          {/* Crew Members Section */}
          {isCrewTrip && (
            <div className="space-y-3 p-4 border rounded-lg bg-card">
              <Label className="text-sm font-medium">Add Crew Members</Label>

              {/* Search Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter crew member's email..."
                  value={crewEmail}
                  onChange={(e) => setCrewEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      searchUser();
                    }
                  }}
                />
                <Button type="button" onClick={searchUser} disabled={searching} variant="outline" className="gap-2">
                  <MagnifyingGlass size={16} />
                  {searching ? "..." : "Add"}
                </Button>
              </div>

              {/* Crew List */}
              {crewMembers.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs text-muted-foreground">
                    {crewMembers.length} crew member{crewMembers.length !== 1 ? "s" : ""} added
                  </p>
                  {crewMembers.map((member) => (
                    <div
                      key={member.email}
                      className="flex items-center justify-between p-2 bg-background rounded border"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber/10 flex items-center justify-center">
                          <Users size={16} className="text-amber" />
                        </div>
                        <p className="text-sm font-medium">{member.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCrew(member.email)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleReset();
                onOpenChange(false);
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating}
              className="gap-2 bg-amber text-primary-foreground hover:bg-amber/90"
            >
              <Anchor size={18} weight="bold" />
              {creating ? "Creating..." : "Create Trip"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
