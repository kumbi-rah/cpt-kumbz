import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash, Pencil, MapPin, Link as LinkIcon } from "@phosphor-icons/react";

interface Lodging {
  id: string;
  trip_id: string;
  name: string;
  address: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  listing_link: string | null;
  notes: string | null;
  display_order: number;
  created_at: string;
}

interface Props {
  tripId: string;
  isOwner: boolean;
}

export default function TripLodging({ tripId, isOwner }: Props) {
  const [lodgings, setLodgings] = useState<Lodging[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    check_in_time: "15:00",
    check_out_time: "11:00",
    listing_link: "",
    notes: "",
  });

  useEffect(() => {
    loadLodgings();
  }, [tripId]);

  const loadLodgings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trip_lodging')
        .select('*')
        .eq('trip_id', tripId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setLodgings(data || []);
    } catch (error) {
      console.error('Error loading lodgings:', error);
      toast.error('Failed to load lodgings');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      check_in_time: "15:00",
      check_out_time: "11:00",
      listing_link: "",
      notes: "",
    });
  };

  const startAdd = () => {
    resetForm();
    setAdding(true);
    setEditing(null);
  };

  const startEdit = (lodging: Lodging) => {
    setFormData({
      name: lodging.name,
      address: lodging.address || "",
      check_in_time: lodging.check_in_time || "15:00",
      check_out_time: lodging.check_out_time || "11:00",
      listing_link: lodging.listing_link || "",
      notes: lodging.notes || "",
    });
    setEditing(lodging.id);
    setAdding(false);
  };

  const cancelEdit = () => {
    setEditing(null);
    setAdding(false);
    resetForm();
  };

  const saveLodging = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      if (adding) {
        // Add new
        const maxOrder = Math.max(0, ...lodgings.map(l => l.display_order));
        const { error } = await supabase
          .from('trip_lodging')
          .insert({
            trip_id: tripId,
            name: formData.name,
            address: formData.address || null,
            check_in_time: formData.check_in_time || null,
            check_out_time: formData.check_out_time || null,
            listing_link: formData.listing_link || null,
            notes: formData.notes || null,
            display_order: maxOrder + 1,
          });

        if (error) throw error;
        toast.success('Lodging added!');
      } else if (editing) {
        // Update existing
        const { error } = await supabase
          .from('trip_lodging')
          .update({
            name: formData.name,
            address: formData.address || null,
            check_in_time: formData.check_in_time || null,
            check_out_time: formData.check_out_time || null,
            listing_link: formData.listing_link || null,
            notes: formData.notes || null,
          })
          .eq('id', editing);

        if (error) throw error;
        toast.success('Lodging updated!');
      }

      cancelEdit();
      loadLodgings();
    } catch (error) {
      console.error('Error saving lodging:', error);
      toast.error('Failed to save lodging');
    }
  };

  const deleteLodging = async (id: string) => {
    if (!confirm('Delete this lodging?')) return;

    try {
      const { error } = await supabase
        .from('trip_lodging')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Lodging deleted');
      loadLodgings();
    } catch (error) {
      console.error('Error deleting lodging:', error);
      toast.error('Failed to delete lodging');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="font-georgia italic text-muted-foreground">Loading lodgings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-georgia text-2xl font-bold text-ink">Accommodations</h2>
        {isOwner && !adding && !editing && (
          <Button onClick={startAdd} className="gap-2 bg-amber hover:bg-amber/90">
            <Plus size={18} weight="bold" />
            Add Lodging
          </Button>
        )}
      </div>

      {lodgings.length === 0 && !adding && (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-4">
            <MapPin size={32} weight="duotone" className="text-amber" />
          </div>
          <p className="font-georgia text-lg text-muted-foreground mb-4">
            No lodgings added yet
          </p>
          {isOwner && (
            <Button onClick={startAdd} className="gap-2 bg-amber hover:bg-amber/90">
              <Plus size={18} weight="bold" />
              Add First Lodging
            </Button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* Existing Lodgings */}
        {lodgings.map((lodging) => (
          <div key={lodging.id}>
            {editing === lodging.id ? (
              // Edit Form
              <div className="bg-card border-2 border-amber/40 rounded-lg p-6 space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    placeholder="e.g., Downtown Airbnb"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Address</Label>
                  <Input
                    placeholder="e.g., 123 Main St, Medellín, Colombia"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Check-in Time</Label>
                    <Input
                      type="time"
                      value={formData.check_in_time}
                      onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Check-out Time</Label>
                    <Input
                      type="time"
                      value={formData.check_out_time}
                      onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Listing Link</Label>
                  <Input
                    type="url"
                    placeholder="https://airbnb.com/..."
                    value={formData.listing_link}
                    onChange={(e) => setFormData({ ...formData, listing_link: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="WiFi password, door code, parking info, etc."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveLodging} className="gap-2 bg-amber hover:bg-amber/90">
                    Save Changes
                  </Button>
                  <Button onClick={cancelEdit} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              // View Card
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin size={20} weight="duotone" className="text-amber" />
                      <h3 className="font-georgia text-xl font-bold text-ink">{lodging.name}</h3>
                    </div>

                    {lodging.address && (
                      <p className="text-sm text-muted-foreground mb-3">{lodging.address}</p>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {lodging.check_in_time && (
                        <div className="text-sm">
                          <span className="font-medium text-ink">Check-in:</span>{' '}
                          <span className="text-muted-foreground">{lodging.check_in_time}</span>
                        </div>
                      )}
                      {lodging.check_out_time && (
                        <div className="text-sm">
                          <span className="font-medium text-ink">Check-out:</span>{' '}
                          <span className="text-muted-foreground">{lodging.check_out_time}</span>
                        </div>
                      )}
                    </div>

                    {lodging.listing_link && (
                      <a
                        href={lodging.listing_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-amber hover:text-amber/80 flex items-center gap-1 mb-3"
                      >
                        <LinkIcon size={16} />
                        View Listing
                      </a>
                    )}

                    {lodging.notes && (
                      <div className="mt-3 p-3 bg-amber/5 border border-amber/20 rounded">
                        <p className="text-sm whitespace-pre-wrap">{lodging.notes}</p>
                      </div>
                    )}
                  </div>

                  {isOwner && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(lodging)}
                        className="text-muted-foreground hover:text-amber transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => deleteLodging(lodging.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add New Form */}
        {adding && (
          <div className="bg-card border-2 border-dashed border-amber/40 rounded-lg p-6 space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                placeholder="e.g., Downtown Airbnb"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Address</Label>
              <Input
                placeholder="e.g., 123 Main St, Medellín, Colombia"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Check-in Time</Label>
                <Input
                  type="time"
                  value={formData.check_in_time}
                  onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                />
              </div>
              <div>
                <Label>Check-out Time</Label>
                <Input
                  type="time"
                  value={formData.check_out_time}
                  onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Listing Link</Label>
              <Input
                type="url"
                placeholder="https://airbnb.com/..."
                value={formData.listing_link}
                onChange={(e) => setFormData({ ...formData, listing_link: e.target.value })}
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="WiFi password, door code, parking info, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={saveLodging} className="gap-2 bg-amber hover:bg-amber/90">
                <Plus size={16} weight="bold" />
                Add Lodging
              </Button>
              <Button onClick={cancelEdit} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
