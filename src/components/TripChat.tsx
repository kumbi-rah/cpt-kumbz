import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PaperPlaneTilt, Image as ImageIcon, User } from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  trip_id: string;
  user_id: string;
  message: string;
  photo_url: string | null;
  created_at: string;
  user_profile?: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface Props {
  tripId: string;
}

export default function TripChat({ tripId }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel(`trip-messages-${tripId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trip_messages',
          filter: `trip_id=eq.${tripId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('trip_messages')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (data) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('user_id, display_name, avatar_url')
              .eq('user_id', data.user_id)
              .single();
            const msg: Message = { ...data, user_profile: profile as Message['user_profile'] };
            setMessages((prev) => [...prev, msg]);
            scrollToBottom();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trip_messages')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user profiles for all unique user_ids
      const userIds = [...new Set((data || []).map((m) => m.user_id))];
      const { data: profiles } = userIds.length
        ? await supabase.from('user_profiles').select('user_id, display_name, avatar_url').in('user_id', userIds)
        : { data: [] };

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
      const enriched: Message[] = (data || []).map((m) => ({
        ...m,
        user_profile: profileMap.get(m.user_id) as Message['user_profile'],
      }));
      setMessages(enriched);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('trip_messages')
        .insert({
          trip_id: tripId,
          user_id: user!.id,
          message: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tripId}-${Date.now()}.${fileExt}`;
      const filePath = `chat-photos/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('trip-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get signed URL
      const { data: signedData } = await supabase.storage
        .from('trip-photos')
        .createSignedUrl(filePath, 86400);
      const photoSignedUrl = signedData?.signedUrl || "";

      // Send message with photo
      const { error: messageError } = await supabase
        .from('trip_messages')
        .insert({
          trip_id: tripId,
          user_id: user!.id,
          message: '📸 Shared a photo',
          photo_url: data.publicUrl,
        });

      if (messageError) throw messageError;

      toast.success('Photo shared!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="font-georgia italic text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-card">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-amber/10 flex items-center justify-center mb-4">
              <PaperPlaneTilt size={32} weight="duotone" className="text-amber" />
            </div>
            <p className="font-georgia text-lg text-ink mb-2">No messages yet</p>
            <p className="text-sm text-muted-foreground">
              Start the conversation with your crew!
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isOwnMessage = msg.user_id === user?.id;
              const displayName = msg.user_profile?.display_name || 'Unknown User';
              
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {msg.user_profile?.avatar_url ? (
                      <img
                        src={msg.user_profile.avatar_url}
                        alt={displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
                        <User size={20} weight="duotone" className="text-amber" />
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className={`text-sm font-medium ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                        {isOwnMessage ? 'You' : displayName}
                      </p>
                      <p className={`text-xs text-muted-foreground ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Photo */}
                    {msg.photo_url && (
                      <div className={`mb-2 ${isOwnMessage ? 'flex justify-end' : 'flex justify-start'}`}>
                        <img
                          src={msg.photo_url}
                          alt="Shared photo"
                          className="max-w-sm rounded-lg border shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(msg.photo_url!, '_blank')}
                        />
                      </div>
                    )}

                    {/* Message Text */}
                    <div
                      className={`inline-block px-4 py-2 rounded-2xl max-w-md ${
                        isOwnMessage
                          ? 'bg-amber text-white rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-shrink-0"
          >
            <ImageIcon size={20} weight={uploading ? "fill" : "duotone"} />
          </Button>

          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            className="flex-1"
          />

          <Button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="flex-shrink-0 bg-amber hover:bg-amber/90"
          >
            <PaperPlaneTilt size={20} weight="fill" />
          </Button>
        </div>
      </form>
    </div>
  );
}
