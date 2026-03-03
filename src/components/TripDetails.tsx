import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Pencil, Camera, MapPin, Calendar, Trash } from "@phosphor-icons/react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Trip {
  id: string;
  name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  cover_photo_url: string | null;
}

interface Props {
  trip: Trip;
  isOwner: boolean;
  onUpdate: () => void;
}

export default function TripDetails({ trip, isOwner, onUpdate }: Props) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: trip.name,
    destination: trip.destination || "",
    start_date: trip.start_date || "",
    end_date: trip.end_date || "",
  });

  const startEdit = () => {
    setFormData({
      name: trip.name,
      destination: trip.destination || "",
      start_date: trip.start_date || "",
      end_date: trip.end_date || "",
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const saveDetails = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a trip name');
      return;
    }

    try {
      const { error } = await supabase
        .from('trips')
        .update({
          name: formData.name.trim(),
          destination: formData.destination.trim() || null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        })
        .eq('id', trip.id);

      if (error) throw error;

      toast.success('Trip updated!');
      setEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating trip:', error);
      toast.error('Failed to update trip');
    }
  };

  const uploadCoverPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${trip.id}-${Date.now()}.${fileExt}`;
      const filePath = `trip-covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('trip-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('trip-photos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('trips')
        .update({ cover_photo_url: data.publicUrl })
        .eq('id', trip.id);

      if (updateError) throw updateError;

      toast.success('Cover photo updated!');
      onUpdate();
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      toast.error('Failed to upload cover photo');
    } finally {
      setUploading(false);
    }
  };

  const deleteTrip = async () => {
    setDeleting(true);
    try {
      // Delete related records first
      const tables = [
        'arrivals', 'trip_sections', 'itinerary_items',
        'trip_lodging', 'trip_messages', 'trip_crew', 'trip_photos'
      ] as const;

      for (const table of tables) {
        await supabase.from(table).delete().eq('trip_id', trip.id);
      }

      const { error } = await supabase.from('trips').delete().eq('id', trip.id);
      if (error) throw error;

      toast.success('Trip deleted');
      navigate('/trips');
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Failed to delete trip');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-georgia text-2xl font-bold text-ink">Trip Details</h2>
        {isOwner && !editing && (
          <Button onClick={startEdit} variant="outline" className="gap-2">
            <Pencil size={18} />
            Edit
          </Button>
        )}
      </div>

      {editing ? (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <Label htmlFor="name">Trip Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Colombia 2026"
            />
          </div>
          <div>
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="e.g., Medellín, Colombia"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={saveDetails} className="gap-2 bg-amber hover:bg-amber/90">
              Save Changes
            </Button>
            <Button onClick={cancelEdit} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Trip Name</p>
                <p className="font-georgia text-xl font-bold text-ink">{trip.name}</p>
              </div>
              {trip.destination && (
                <div className="flex items-start gap-2">
                  <MapPin size={20} weight="duotone" className="text-amber mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Destination</p>
                    <p className="text-base text-ink">{trip.destination}</p>
                  </div>
                </div>
              )}
              {(trip.start_date || trip.end_date) && (
                <div className="flex items-start gap-2">
                  <Calendar size={20} weight="duotone" className="text-amber mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dates</p>
                    <p className="text-base text-ink">
                      {trip.start_date && format(new Date(trip.start_date), 'MMMM d, yyyy')}
                      {trip.start_date && trip.end_date && ' - '}
                      {trip.end_date && format(new Date(trip.end_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cover Photo Card */}
          {isOwner && (
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Camera size={20} weight="duotone" className="text-amber" />
                  <p className="text-sm font-medium text-ink">Cover Photo</p>
                </div>
                <label htmlFor="cover-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    disabled={uploading}
                    onClick={() => document.getElementById('cover-upload')?.click()}
                  >
                    <Camera size={16} />
                    {uploading ? 'Uploading...' : trip.cover_photo_url ? 'Change' : 'Upload'}
                  </Button>
                </label>
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={uploadCoverPhoto}
                  className="hidden"
                />
              </div>
              {trip.cover_photo_url ? (
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                  <img src={trip.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <Camera size={32} weight="duotone" className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No cover photo</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isOwner && trip.cover_photo_url && (
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Camera size={20} weight="duotone" className="text-amber" />
                <p className="text-sm font-medium text-ink">Cover Photo</p>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden border">
                <img src={trip.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Danger Zone */}
          {isOwner && (
            <div className="border border-destructive/30 rounded-lg p-6">
              <h3 className="font-georgia text-lg font-bold text-destructive mb-2">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete this trip and all its data. This cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2" disabled={deleting}>
                    <Trash size={18} />
                    {deleting ? 'Deleting...' : 'Delete Trip'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{trip.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this trip and all associated data including itinerary, lodging, photos, and chat messages. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteTrip} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Forever
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
