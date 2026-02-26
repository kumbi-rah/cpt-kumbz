import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Backpack, Pencil } from "@phosphor-icons/react";

interface Props {
  tripId: string;
  isOwner: boolean;
}

export default function TripPacking({ tripId, isOwner }: Props) {
  const [packingList, setPackingList] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draftList, setDraftList] = useState("");

  useEffect(() => {
    loadPackingList();
  }, [tripId]);

  const loadPackingList = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('packing_list')
        .eq('id', tripId)
        .single();

      if (error) throw error;
      setPackingList(data?.packing_list || "");
    } catch (error) {
      console.error('Error loading packing list:', error);
      toast.error('Failed to load packing list');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    setDraftList(packingList);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraftList("");
  };

  const savePackingList = async () => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({ packing_list: draftList })
        .eq('id', tripId);

      if (error) throw error;

      setPackingList(draftList);
      setEditing(false);
      toast.success('Packing list saved!');
    } catch (error) {
      console.error('Error saving packing list:', error);
      toast.error('Failed to save packing list');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="font-georgia italic text-muted-foreground">Loading packing list...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-georgia text-2xl font-bold text-ink">Packing List</h2>
        {isOwner && !editing && (
          <Button onClick={startEdit} variant="outline" className="gap-2">
            <Pencil size={18} />
            Edit
          </Button>
        )}
      </div>

      {editing ? (
        // Edit Mode
        <div className="space-y-4">
          <div>
            <Textarea
              value={draftList}
              onChange={(e) => setDraftList(e.target.value)}
              placeholder={`Enter your packing list here...

Example:
Clothing:
- Shirts x3
- Pants x2
- Jacket

Toiletries:
- Toothbrush
- Sunscreen
- Shampoo

Electronics:
- Phone charger
- Camera
- Power adapter`}
              rows={20}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Tip: Use bullet points (-) and headers for better organization
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={savePackingList} className="gap-2 bg-amber hover:bg-amber/90">
              Save Changes
            </Button>
            <Button onClick={cancelEdit} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        // View Mode
        <div>
          {packingList ? (
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <pre className="whitespace-pre-wrap font-sans text-sm text-ink">
                {packingList}
              </pre>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-4">
                <Backpack size={32} weight="duotone" className="text-amber" />
              </div>
              <p className="font-georgia text-lg text-muted-foreground mb-4">
                No packing list yet
              </p>
              {isOwner && (
                <Button onClick={startEdit} className="gap-2 bg-amber hover:bg-amber/90">
                  <Pencil size={18} />
                  Create Packing List
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
