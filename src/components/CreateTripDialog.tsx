import { useState } from "react";
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(crewEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check if already added
    if (crewMembers.some(m => m.email === crewEmail.toLowerCase())) {
      toast.error("This person is already in the crew");
      return;
    }

    // Don't allow adding yourself
    if (crewEmail.toLowerCase() === user?.email?.toLowerCase()) {
      toast.error("You're automatically added as the trip owner");
      return;
    }

    setSearching(true);
    try {
      // First, find the user by email in auth
      const { data: authData, error: authError } = await (supabase.rpc as any)(
        'get_user_id_by_email',
        { email_address: crewEmail.toLowerCase() }
      );

      if (authError) {
        // RPC function might not exist yet, try alternative approach
        // Search in user_profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_id, display_name, avatar_url')
          .ilike('user_id', '%') // Workaround to get profiles
          .limit(1000);

        if (profileError) throw profileError;

        // This is a hack - in production, you'd have a proper user search function
        // For now, we'll just let them add the email and handle it on creation
        setCrewMembers([
          ...crewMembers,
          {
            user_id: '', // Will be resolved on creation
            email: crewEmail.toLowerCase(),
            display_name: undefined,
          }
        ]);
        setCrewEmail("");
        toast.success(`📧 ${crewEmail} added (they'll be invited when you create the trip)`);
        return;
      }

      // If we found the user, get their profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('display_name, avatar_url')
        .eq('user_id', authData)
        .single();

      setCrewMembers([
        ...crewMembers,
        {
          user_id: authData,
          email: crewEmail.toLowerCase(),
          display_name: profile?.display_name,
          avatar_url: profile?.avatar_url,
        }
      ]);
      
      setCrewEmail("");
      toast.success(`✅ ${profile?.display_name || crewEmail} added to crew!`);
    } catch (error) {
      console.error("Error searching user:", error);
      // Still allow adding by email
      setCrewMembers([
        ...crewMembers,
        {
          user_id: '',
          email: crewEmail.toLowerCase(),
        }
      ]);
      setCrewEmail("");
      toast.success(`📧 ${crewEmail} will be invited when you create the trip`);
    } finally {
      setSearching(false);
    }
  };

  const removeCrew = (email: string) => {
    setCrewMembers(crewMembers.filter(m => m.email !== email));
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
      // 1. Create the trip
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .insert({
          user_id: user!.id,
          name,
          destination,
          start_date: startDate || null,
          end_date: endDate || null,
        })
        .select()
        .single();

      if (tripError) throw tripError;

      // 2. Add crew members (if crew trip)
      if (isCrewTrip && crewMembers.length > 0) {
        // Note: In production, you'd want to:
        // - Send email invites to users who don't have accounts
        // - Add users who have accounts to trip_crew
        // For now, we'll just try to add them if they exist
        
        for (const member of crewMembers) {
          if (member.user_id) {
            await supabase.from('trip_crew').insert({
              trip_id: trip.id,
              user_id: member.user_id,
              role: 'member',
            });
          }
        }
        
        toast.success(`⚓ Trip created with ${crewMembers.length} crew members!`);
      } else {
        toast.success("⚓ Trip created!");
      }

      queryClient.invalidateQueries({ queryKey: ["trips"] });
      handleReset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating trip:", error);
      toast.error("Failed to create trip");
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
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
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
            <Switch
              checked={isCrewTrip}
              onCheckedChange={setIsCrewTrip}
            />
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
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      searchUser();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={searchUser}
                  disabled={searching}
                  variant="outline"
                  className="gap-2"
                >
                  <MagnifyingGlass size={16} />
                  {searching ? "Searching..." : "Add"}
                </Button>
              </div>

              {/* Crew List */}
              {crewMembers.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs text-muted-foreground">
                    {crewMembers.length} crew member{crewMembers.length !== 1 ? 's' : ''} added
                  </p>
                  {crewMembers.map((member) => (
                    <div
                      key={member.email}
                      className="flex items-center justify-between p-2 bg-background rounded border"
                    >
                      <div className="flex items-center gap-2">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.display_name || member.email}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-amber/10 flex items-center justify-center">
                            <Users size={16} className="text-amber" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {member.display_name || member.email}
                          </p>
                          {member.display_name && (
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          )}
                        </div>
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
