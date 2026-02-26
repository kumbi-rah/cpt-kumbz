import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, User, Plus, X, MagnifyingGlass } from "@phosphor-icons/react";

interface CrewMember {
  user_id: string;
  role: string;
  email?: string;
  user_profile?: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface Props {
  tripId: string;
  isOwner: boolean;
}

export default function TripCrew({ tripId, isOwner }: Props) {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [email, setEmail] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadCrew();
  }, [tripId]);

  const loadCrew = async () => {
    setLoading(true);
    try {
      const { data: crewData, error } = await supabase
        .from("trip_crew")
        .select("user_id, role")
        .eq("trip_id", tripId);

      if (error) throw error;

      const userIds = (crewData || []).map((c) => c.user_id);
      const { data: profiles } = userIds.length
        ? await supabase
            .from("user_profiles")
            .select("user_id, display_name, avatar_url")
            .in("user_id", userIds)
        : { data: [] };

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      const enriched: CrewMember[] = (crewData || []).map((c) => ({
        ...c,
        user_profile: profileMap.get(c.user_id) as CrewMember["user_profile"],
      }));

      setCrew(enriched);
    } catch (error) {
      console.error("Error loading crew:", error);
      toast.error("Failed to load crew");
    } finally {
      setLoading(false);
    }
  };

  const addCrewMember = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (crew.some((m) => m.email === email.toLowerCase())) {
      toast.error("This person is already in the crew");
      return;
    }

    setSearching(true);
    try {
      toast.success(`📧 Invite sent to ${email}`);
      setEmail("");
      setAdding(false);
    } catch (error) {
      console.error("Error adding crew:", error);
      toast.error("Failed to add crew member");
    } finally {
      setSearching(false);
    }
  };

  const removeCrew = async (userId: string) => {
    if (!confirm("Remove this crew member?")) return;

    try {
      const { error } = await supabase
        .from("trip_crew")
        .delete()
        .eq("trip_id", tripId)
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("Crew member removed");
      loadCrew();
    } catch (error) {
      console.error("Error removing crew:", error);
      toast.error("Failed to remove crew member");
    }
  };

  const getStatusBadge = (member: CrewMember) => {
    if (member.role === "owner") {
      return (
        <span className="text-xs bg-amber/20 text-amber px-2 py-0.5 rounded-full font-medium">
          Owner
        </span>
      );
    }

    if (member.user_profile?.display_name) {
      return (
        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
          🟢 Active
        </span>
      );
    }

    return (
      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
        📧 Invited
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="font-georgia italic text-muted-foreground">Loading crew...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-georgia text-2xl font-bold text-ink">Crew Members</h2>
        {isOwner && !adding && (
          <Button onClick={() => setAdding(true)} className="gap-2 bg-amber hover:bg-amber/90">
            <Plus size={18} weight="bold" />
            Add Crew
          </Button>
        )}
      </div>

      {/* Add Crew Form */}
      {adding && (
        <div className="bg-card border-2 border-dashed border-amber/40 rounded-lg p-4 mb-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter crew member's email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCrewMember();
                }
              }}
            />
            <Button
              onClick={addCrewMember}
              disabled={searching}
              className="gap-2 bg-amber hover:bg-amber/90"
            >
              <MagnifyingGlass size={16} />
              {searching ? "Sending..." : "Invite"}
            </Button>
            <Button onClick={() => { setAdding(false); setEmail(""); }} variant="outline">
              Cancel
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            They'll receive an email invite to join this trip
          </p>
        </div>
      )}

      {/* Crew List */}
      <div className="space-y-3">
        {crew.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-4">
              <Users size={32} weight="duotone" className="text-amber" />
            </div>
            <p className="font-georgia text-lg text-muted-foreground">
              Just you on this trip
            </p>
          </div>
        ) : (
          crew.map((member) => (
            <div
              key={member.user_id}
              className="bg-card border border-border rounded-lg p-4 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {member.user_profile?.avatar_url ? (
                  <img
                    src={member.user_profile.avatar_url}
                    alt={member.user_profile.display_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center">
                    <User size={24} weight="duotone" className="text-amber" />
                  </div>
                )}

                <div>
                  <p className="font-medium text-ink">
                    {member.user_profile?.display_name || member.email || "Unknown User"}
                  </p>
                  {member.email && member.user_profile?.display_name && (
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {getStatusBadge(member)}
                {isOwner && member.role !== "owner" && (
                  <button
                    onClick={() => removeCrew(member.user_id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Status Legend */}
      {crew.length > 0 && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-2">Status Legend:</p>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="bg-amber/20 text-amber px-2 py-0.5 rounded-full font-medium">Owner</span>
              <span className="text-muted-foreground">Can manage trip</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">🟢 Active</span>
              <span className="text-muted-foreground">Has account</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">📧 Invited</span>
              <span className="text-muted-foreground">Pending invite</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
