import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Camera, Anchor } from "@phosphor-icons/react";

export default function ProfileSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error);
      }

      if (data) {
        setIsNewUser(false);
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url || "");
      } else {
        // New user - pre-fill with email username
        const emailUsername = user.email?.split("@")[0] || "";
        setDisplayName(emailUsername);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${user!.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("trip-photos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("trip-photos")
        .getPublicUrl(filePath);

      setAvatarUrl(data.publicUrl);
      toast.success("📸 Avatar uploaded!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!displayName.trim()) {
      toast.error("Please enter a display name");
      return;
    }

    setSaving(true);
    try {
      const profileData = {
        user_id: user.id,
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("user_profiles")
        .upsert(profileData, { onConflict: "user_id" });

      if (error) throw error;

      toast.success("⚓ Profile saved!");
      
      // Redirect to home if new user, otherwise stay on page
      if (isNewUser) {
        navigate("/");
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-nav flex items-center justify-center">
        <p className="font-georgia italic text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-nav animate-scroll-unfold">
      <div className="max-w-2xl mx-auto px-5 pt-10 md:pt-14">
        <div className="mb-8 text-center">
          <h1 className="font-georgia text-3xl md:text-4xl font-bold text-ink">
            {isNewUser ? "Welcome Aboard, Captain!" : "Your Profile"}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mt-1">
            {isNewUser ? "Set up your profile to get started" : "Update your information"}
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 md:p-8 shadow-sm space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-amber/20"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-amber/10 border-4 border-amber/20 flex items-center justify-center">
                  <User size={48} weight="duotone" className="text-amber" />
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-amber hover:bg-amber/90 flex items-center justify-center cursor-pointer border-2 border-card transition-colors"
              >
                <Camera size={20} weight="bold" className="text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {uploading ? "Uploading..." : "Click camera icon to upload photo"}
            </p>
          </div>

          {/* Display Name */}
          <div>
            <Label htmlFor="displayName" className="text-sm font-medium text-ink mb-2 block">
              Display Name *
            </Label>
            <Input
              id="displayName"
              placeholder="e.g., Captain Kumbi"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              This is how you'll appear to other crew members
            </p>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio" className="text-sm font-medium text-ink mb-2 block">
              Bio (Optional)
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell your crew a bit about yourself... (e.g., 'Adventure seeker 🏔️ | Coffee enthusiast ☕')"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {bio.length}/200 characters
            </p>
          </div>

          {/* Email (Read-only) */}
          <div>
            <Label className="text-sm font-medium text-ink mb-2 block">Email</Label>
            <Input value={user?.email || ""} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground mt-1.5">
              Used for login and notifications
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4">
            {!isNewUser && (
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={saving}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving || !displayName.trim()}
              className="gap-2 bg-amber text-primary-foreground hover:bg-amber/90 px-8"
            >
              <Anchor size={18} weight="bold" />
              {saving ? "Saving..." : isNewUser ? "Set Sail!" : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Stats Preview (if not new user) */}
        {!isNewUser && (
          <div className="mt-6 bg-card rounded-xl border p-6 shadow-sm">
            <p className="text-sm font-medium text-ink mb-3">Profile Preview</p>
            <div className="flex items-start gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center">
                  <User size={28} weight="duotone" className="text-amber" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-ink">{displayName || "Your Name"}</p>
                {bio && (
                  <p className="text-sm text-muted-foreground mt-1">{bio}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">{user?.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
