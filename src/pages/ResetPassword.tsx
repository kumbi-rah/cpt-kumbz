import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Compass } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    } else {
      // Also listen for auth state change in case token is processed async
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          setReady(true);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Compass size={36} weight="duotone" className="text-amber" />
          </div>
          <h1 className="font-georgia italic text-3xl text-ink">Cpt. Kumbz</h1>
          <p className="font-georgia text-muted-foreground">Adventures</p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="font-georgia text-lg font-bold text-ink mb-4">Set New Password</h2>
          {!ready ? (
            <p className="text-sm text-muted-foreground">
              Verifying your reset link… If this doesn't update, try clicking the link in your email again.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
              />
              <Button type="submit" className="w-full bg-amber hover:bg-amber/90 text-white" disabled={loading}>
                {loading ? "..." : "Update Password"}
              </Button>
            </form>
          )}
          <p className="text-xs text-muted-foreground text-center mt-4">
            <button type="button" onClick={() => navigate("/auth")} className="text-amber hover:underline">
              Back to sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
