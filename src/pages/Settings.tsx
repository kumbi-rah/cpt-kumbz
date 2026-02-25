import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MapPin, Moon, Sun, FloppyDisk } from "@phosphor-icons/react";

interface GeoResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function Settings() {
  const { user } = useAuth();
  const [homeCity, setHomeCity] = useState("");
  const [homeLat, setHomeLat] = useState("");
  const [homeLng, setHomeLng] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load user settings from Supabase
  useEffect(() => {
    loadSettings();
  }, [user]);

  // Apply theme on initial load from localStorage (before Supabase loads)
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
        console.error("Error loading settings:", error);
      }

      if (data) {
        setHomeCity(data.home_city || "");
        setHomeLat(data.home_lat?.toString() || "");
        setHomeLng(data.home_lng?.toString() || "");
        const t = (data.theme as "light" | "dark") || "light";
        setTheme(t);
        applyTheme(t);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (t: "light" | "dark") => {
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", t);
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
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast.error("⚓ Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleThemeToggle = (checked: boolean) => {
    const t = checked ? "dark" : "light";
    setTheme(t);
    applyTheme(t);
  };

  // Debounced city search for autocomplete
  const searchCities = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
        );
        const data: GeoResult[] = await response.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch (err) {
        console.error("Autocomplete error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  }, []);

  const handleCityInputChange = (value: string) => {
    setHomeCity(value);
    searchCities(value);
  };

  const selectSuggestion = (result: GeoResult) => {
    setHomeCity(result.display_name);
    setHomeLat(parseFloat(result.lat).toFixed(6));
    setHomeLng(parseFloat(result.lon).toFixed(6));
    setSuggestions([]);
    setShowSuggestions(false);
    toast.success(`📍 Selected: ${result.display_name}`);
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
              <div ref={containerRef} className="relative">
                <Label htmlFor="city" className="text-sm font-medium text-ink mb-2 block">
                  City or Address
                </Label>
                <Input
                  id="city"
                  placeholder="Start typing a city name..."
                  value={homeCity}
                  onChange={(e) => handleCityInputChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  autoComplete="off"
                />
                {homeLat && homeLng && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    📍 Coordinates set: {homeLat}, {homeLng}
                  </p>
                )}

                {/* Autocomplete dropdown */}
                {showSuggestions && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchLoading ? (
                      <div className="px-4 py-3 text-sm text-muted-foreground">Searching...</div>
                    ) : (
                      suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors border-b last:border-b-0 flex items-start gap-2"
                          onClick={() => selectSuggestion(s)}
                        >
                          <MapPin size={14} className="text-amber mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{s.display_name}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
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
