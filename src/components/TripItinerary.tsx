import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash, Calendar } from "@phosphor-icons/react";
import PirateX from "@/components/PirateX";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ItineraryItem {
  id: string;
  day_number: number;
  day_date: string | null;
  time: string;
  activity: string;
  notes: string | null;
  display_order: number;
}

interface Props {
  tripId: string;
  tripStartDate: string | null;
  tripEndDate: string | null;
  isOwner: boolean;
}

export default function TripItinerary({ tripId, tripStartDate, tripEndDate, isOwner }: Props) {
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDay, setDialogDay] = useState<number>(1);
  const [newItem, setNewItem] = useState({ time: "09:00", activity: "", notes: "" });

  useEffect(() => {
    loadItinerary();
  }, [tripId]);

  const loadItinerary = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('itinerary_items')
        .select('*')
        .eq('trip_id', tripId)
        .order('day_number', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading itinerary:', error);
      toast.error('Failed to load itinerary');
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = (dayNumber: number) => {
    setDialogDay(dayNumber);
    setNewItem({ time: "09:00", activity: "", notes: "" });
    setDialogOpen(true);
  };

  const addItem = async () => {
    if (!newItem.activity.trim()) {
      toast.error('Please enter an activity');
      return;
    }

    try {
      const dayDate = tripStartDate
        ? format(new Date(new Date(tripStartDate).getTime() + (dialogDay - 1) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
        : null;

      const maxOrder = Math.max(0, ...items.filter(i => i.day_number === dialogDay).map(i => i.display_order));

      const { error } = await supabase
        .from('itinerary_items')
        .insert({
          trip_id: tripId,
          day_number: dialogDay,
          day_date: dayDate,
          time: newItem.time,
          activity: newItem.activity,
          notes: newItem.notes || null,
          display_order: maxOrder + 1,
        });

      if (error) throw error;

      toast.success('Activity added!');
      setDialogOpen(false);
      setNewItem({ time: "09:00", activity: "", notes: "" });
      loadItinerary();
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add activity');
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('itinerary_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Activity removed');
      loadItinerary();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete activity');
    }
  };

  const itemsByDay = items.reduce((acc, item) => {
    if (!acc[item.day_number]) acc[item.day_number] = [];
    acc[item.day_number].push(item);
    return acc;
  }, {} as Record<number, ItineraryItem[]>);

  const days = Object.keys(itemsByDay).map(Number).sort((a, b) => a - b);
  const maxDay = Math.max(0, ...days);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="font-georgia italic text-muted-foreground">Loading itinerary...</p>
      </div>
    );
  }

  return (
    <div className="relative py-6">
      <div
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='1200' height='800' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' /%3E%3CfeColorMatrix values='0 0 0 0 0.9, 0 0 0 0 0.85, 0 0 0 0 0.7, 0 0 0 1 0'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' fill='%23F5E6D3'/%3E%3Cpath d='M100,100 Q300,200 500,150 T900,200' stroke='%23D4AF37' stroke-width='2' fill='none' opacity='0.3' stroke-dasharray='5,10'/%3E%3Ccircle cx='950' cy='150' r='80' fill='none' stroke='%23D4AF37' stroke-width='2' opacity='0.2'/%3E%3Cpath d='M920,120 L980,180 M920,180 L980,120' stroke='%23D4AF37' stroke-width='3' opacity='0.3'/%3E%3Cpolygon points='200,600 250,550 300,600 275,650 225,650' fill='none' stroke='%238B7355' stroke-width='2' opacity='0.2'/%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.12,
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-georgia text-2xl font-bold text-ink">The Voyage</h2>
          {isOwner && (
            <Button
              onClick={() => openAddDialog(maxDay + 1)}
              variant="outline"
              className="gap-2"
            >
              <Plus size={18} weight="bold" />
              Add Day
            </Button>
          )}
        </div>

        {days.length === 0 && (
          <div className="text-center py-12">
            <p className="font-georgia text-lg text-muted-foreground mb-4">
              No itinerary yet. Chart your course!
            </p>
            {isOwner && (
              <Button onClick={() => openAddDialog(1)} className="gap-2 bg-amber hover:bg-amber/90">
                <Plus size={18} weight="bold" />
                Add First Day
              </Button>
            )}
          </div>
        )}

        {days.map((day, dayIndex) => {
          const dayItems = itemsByDay[day];
          const dayDate = dayItems[0]?.day_date;

          return (
            <div key={day} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Calendar size={24} weight="duotone" className="text-amber" />
                <h3 className="font-georgia text-xl font-bold text-ink">
                  Day {day}
                  {dayDate && ` - ${format(new Date(dayDate), 'MMMM d, yyyy')}`}
                </h3>
              </div>

              <div className="ml-8 border-l-2 border-dotted border-amber/30 pl-8 space-y-6">
                {dayItems.map((item) => (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-[52px] top-0">
                      <PirateX size={28} />
                    </div>
                    <div className="bg-parchment/60 border border-amber/20 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-bold text-amber bg-amber/10 px-3 py-1 rounded-full">
                              {item.time}
                            </span>
                            <h4 className="font-medium text-ink">{item.activity}</h4>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{item.notes}</p>
                          )}
                        </div>
                        {isOwner && (
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isOwner && (
                  <button
                    onClick={() => openAddDialog(day)}
                    className="text-sm text-amber hover:text-amber/80 font-medium flex items-center gap-2"
                  >
                    <Plus size={16} weight="bold" />
                    Add Activity
                  </button>
                )}
              </div>

              {dayIndex < days.length - 1 && (
                <div className="ml-8 my-6 border-t-2 border-dotted border-amber/20" />
              )}
            </div>
          );
        })}
      </div>

      {/* Add Activity Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-georgia">Add Activity — Day {dialogDay}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={newItem.time}
                onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
              />
            </div>
            <div>
              <Label>Activity *</Label>
              <Input
                placeholder="Activity name..."
                value={newItem.activity}
                onChange={(e) => setNewItem({ ...newItem, activity: e.target.value })}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Notes (optional)..."
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={addItem} className="gap-2 bg-amber hover:bg-amber/90 flex-1">
                <Plus size={16} weight="bold" />
                Add Activity
              </Button>
              <Button onClick={() => setDialogOpen(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
