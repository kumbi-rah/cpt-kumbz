import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MapPin, Moon, Sun, FloppyDisk } from "@phosphor-icons/react";

export default function Settings() {
  const { user } = useAuth();
  const [homeCity, setHomeCity] = useState("");
  const [homeLat, setHomeLat] = useState("");
  const [homeLng, setHomeLng] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load user settings from Supabase
  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is fine for new users
        console.error("Error loading settings:", error);
      }

      if (data) {
        setHomeCity(data.home_city || "");
        setHomeLat(data.home_lat?.toString() || "");
        setHomeLng(data.home_lng?.toString() || "");
        setTheme((data.theme as "light" | "dark") || "light");
        
        // Apply theme
        if (data.theme === "dark") {
          document.documentElement.classList.add("dark");
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const settings = {
        user_id: user.id,
        home_city: homeCity || null,
        home_lat: homeLat ? parseFloat(homeLat) : null,
        home_lng: homeLng ? parseFloat(homeLng) : null,
        theme,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("user_settings")
        .upsert(settings, { onConflict: "user_id" });

      if (error) throw error;

      toast.success("⚓ Settings saved!");
      
      // Apply theme immediately
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast.error("⚓ Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  // Simple geocoding using Nominatim (OpenStreetMap)
  const geocodeCity = async () => {
    if (!homeCity.trim()) {
      toast.error("Please enter a city name");
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(homeCity)}&format=json&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setHomeLat(parseFloat(data[0].lat).toFixed(6));
        setHomeLng(parseFloat(data[0].lon).toFixed(6));
        toast.success(`📍 Found coordinates for ${data[0].display_name}`);
      } else {
        toast.error("City not found. Try being more specific (e.g., 'San Diego, California')");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      toast.error("Failed to find city");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-nav flex items-center justify-center">
        <p className="font-georgia italic text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-nav animate-scroll-unfold">
      <div className="max-w-3xl mx-auto px-5 pt-10 md:pt-14">
        <div className="mb-8">
          <h1 className="font-georgia text-3xl md:text-4xl font-bold text-ink">Settings</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-1">Customize your adventure experience</p>
        </div>

        <div className="space-y-8">
          {/* Home Location Section */}
          <div className="bg-card rounded-xl border p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <MapPin size={24} weight="duotone" className="text-amber" />
              <h2 className="font-georgia text-xl font-bold text-ink">My Home Location</h2>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Set your home base to see it on the globe and calculate distances from home to your trips.
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="city" className="text-sm font-medium text-ink mb-2 block">
                  City or Address
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="city"
                    placeholder="e.g., San Diego, California"
                    value={homeCity}
                    onChange={(e) => setHomeCity(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={geocodeCity} variant="outline" className="gap-2">
                    <MapPin size={16} />
                    Find
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Enter your city and click "Find" to get coordinates
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lat" className="text-sm font-medium text-ink mb-2 block">
                    Latitude
                  </Label>
                  <Input
                    id="lat"
                    placeholder="32.715736"
                    value={homeLat}
                    onChange={(e) => setHomeLat(e.target.value)}
                    type="number"
                    step="any"
                  />
                </div>
                <div>
                  <Label htmlFor="lng" className="text-sm font-medium text-ink mb-2 block">
                    Longitude
                  </Label>
                  <Input
                    id="lng"
                    placeholder="-117.161087"
                    value={homeLng}
                    onChange={(e) => setHomeLng(e.target.value)}
                    type="number"
                    step="any"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Theme Section */}
          <div className="bg-card rounded-xl border p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              {theme === "dark" ? (
                <Moon size={24} weight="duotone" className="text-amber" />
              ) : (
                <Sun size={24} weight="duotone" className="text-amber" />
              )}
              <h2 className="font-georgia text-xl font-bold text-ink">Appearance</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Dark Mode</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={handleThemeToggle}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="gap-2 bg-amber text-primary-foreground hover:bg-amber/90 px-8 py-3 text-base"
            >
              <FloppyDisk size={18} weight="bold" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
