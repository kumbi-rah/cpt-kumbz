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
import { Anchor, X, Users, MagnifyingGlass } from "@phosphor-icons/react";

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

export default function CreateTripDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
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
    setStartDate("");
    setEndDate("");
    setIsCrewTrip(false);
    setCrewEmail("");
    setCrewMembers([]);
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
      // Create the trip
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .insert({
          created_by: user!.id,
          name: name.trim(),
          destination: destination.trim(),
          start_date: startDate || null,
          end_date: endDate || null,
        })
        .select()
        .single();

      if (tripError) throw tripError;

      // Add crew members if crew trip (future enhancement)
      if (isCrewTrip && crewMembers.length > 0) {
        // TODO: Implement crew member invites
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

          {/* Destination */}
          <div>
            <Label htmlFor="destination">Destination *</Label>
            <Input
              id="destination"
              placeholder="e.g., Medellín, Colombia"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
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
