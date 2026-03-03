import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Backpack, Pencil } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  tripId: string;
  isOwner: boolean;
}

export default function TripPacking({ tripId, isOwner }: Props) {
  const [packingList, setPackingList] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const openEditDialog = () => {
    setDraftList(packingList);
    setDialogOpen(true);
  };

  const savePackingList = async () => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({ packing_list: draftList })
        .eq('id', tripId);

      if (error) throw error;

      setPackingList(draftList);
      setDialogOpen(false);
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
        {isOwner && (
          <Button onClick={openEditDialog} variant="outline" className="gap-2">
            <Pencil size={18} />
            {packingList ? 'Edit' : 'Create'}
          </Button>
        )}
      </div>

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
            <Button onClick={openEditDialog} className="gap-2 bg-amber hover:bg-amber/90">
              <Pencil size={18} />
              Create Packing List
            </Button>
          )}
        </div>
      )}

      {/* Edit Packing List Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-georgia">Edit Packing List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
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
- Shampoo`}
              rows={14}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Use bullet points (-) and headers for better organization
            </p>
            <div className="flex gap-2 pt-2">
              <Button onClick={savePackingList} className="gap-2 bg-amber hover:bg-amber/90 flex-1">
                Save Changes
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
