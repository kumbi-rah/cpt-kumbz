import { Switch } from "@/components/ui/switch";
import { ALWAYS_PRIVATE_TYPES, SECTION_TYPE_LABELS } from "@/lib/constants";
import { useTripSections, useToggleSectionPublic, useTrip, useUpdateTrip, type TripSection } from "@/hooks/useTrips";
import { Lock, Eye } from "@phosphor-icons/react";
import { toast } from "sonner";

interface Props {
  tripId: string;
}

export default function ShareSettings({ tripId }: Props) {
  const { data: trip } = useTrip(tripId);
  const { data: sections = [] } = useTripSections(tripId);
  const togglePublic = useToggleSectionPublic();
  const updateTrip = useUpdateTrip();

  const handleShareToggle = (enabled: boolean) => {
    updateTrip.mutate(
      { id: tripId, share_enabled: enabled },
      {
        onSuccess: () => toast.success(enabled ? "Public page enabled" : "Public page disabled"),
        onError: () => toast.error("Failed to update"),
      }
    );
  };

  const handleToggle = (section: TripSection) => {
    if (ALWAYS_PRIVATE_TYPES.includes(section.type)) return;
    togglePublic.mutate({ id: section.id, is_public: !section.is_public });
  };

  return (
    <div>
      <h3 className="font-georgia font-bold text-ink mb-3">Share Settings</h3>

      {/* Master toggle */}
      <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-card border mb-4">
        <div>
          <p className="text-sm font-medium text-ink">Public page</p>
          <p className="text-xs text-muted-foreground">
            {trip?.share_enabled ? "Anyone with the link can view" : "Share page is disabled"}
          </p>
        </div>
        <Switch
          checked={!!trip?.share_enabled}
          onCheckedChange={handleShareToggle}
        />
      </div>

      <p className="text-xs text-muted-foreground mb-4">Control which sections are visible on the public share link.</p>
      <div className="space-y-2">
        {sections.map((s) => {
          const alwaysPrivate = ALWAYS_PRIVATE_TYPES.includes(s.type);
          return (
            <div key={s.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-card border">
              <div className="flex items-center gap-2">
                {alwaysPrivate ? (
                  <Lock size={16} weight="duotone" className="text-muted" />
                ) : (
                  <Eye size={16} weight="duotone" className="text-teal" />
                )}
                <span className="text-sm font-medium">{SECTION_TYPE_LABELS[s.type] || s.type}</span>
              </div>
              <div className="flex items-center gap-2">
                {alwaysPrivate ? (
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Always Private</span>
                ) : (
                  <>
                    <span className="text-[10px] text-muted-foreground">{s.is_public ? "Public" : "Private"}</span>
                    <Switch checked={!!s.is_public} onCheckedChange={() => handleToggle(s)} />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
