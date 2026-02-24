import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogo, Anchor } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CompassRose from "@/components/icons/CompassRose";

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) {
        toast.error(`⚓ ${error.message}`);
      } else {
        toast.success("⚓ Check your email for a password reset link!");
        setMode("login");
      }
      return;
    }

    const fn = mode === "login" ? signIn : signUp;
    const { error } = await fn(email, password);
    setLoading(false);
    if (error) {
      toast.error(`⚓ ${error.message}`);
    } else {
      if (mode === "signup") {
        toast.success("⚓ Check your email to confirm your account!");
      } else {
        navigate("/");
      }
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "linear-gradient(135deg, #F0EBE1 0%, #E8DFC8 100%)" }}
    >
      {/* Left panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 parchment-bg relative flex-col items-center justify-center p-12">
        <div className="grain-overlay" />
        <div className="light-leak" />
        <Anchor size={200} weight="duotone" className="absolute text-amber/10" />
        <div className="relative z-10 text-center">
          <CompassRose size={80} className="text-amber mx-auto mb-6" />
          <h1 className="font-georgia italic text-5xl text-ink mb-2">Captain Kumbz</h1>
          <p className="font-georgia text-lg text-muted-foreground mb-8">Adventures</p>
          <p className="treasure-map-text text-base text-muted-foreground italic max-w-xs mx-auto leading-relaxed">
            "Every voyage begins with a single step ashore — may yours lead to wonders untold."
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-5">
        <div className="w-full max-w-[420px]">
          {/* Logo — mobile only */}
          <div className="text-center mb-8 lg:hidden">
            <CompassRose size={64} className="text-amber mx-auto mb-3" />
            <h1 className="font-georgia italic text-3xl text-amber">Captain Kumbz</h1>
            <p className="text-[14px] text-muted-foreground">Adventures</p>
          </div>

          <div
            className="rounded-2xl p-10 shadow-lg"
            style={{
              background: "#FAF7F2",
              boxShadow: "0 8px 32px rgba(80,60,30,0.12)",
            }}
          >
            {/* Desktop header inside card */}
            <div className="hidden lg:block text-center mb-6">
              <CompassRose size={64} className="text-amber mx-auto mb-3" />
              <h2 className="font-georgia italic text-[28px] font-bold text-amber">Captain Kumbz</h2>
              <p className="text-[14px] text-muted-foreground">Adventures</p>
            </div>

            <h2 className="font-georgia text-lg font-bold text-ink mb-4 lg:text-center">
              {mode === "login" ? "Welcome Back" : mode === "signup" ? "Join the Adventure" : "Reset Password"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              {mode !== "forgot" && (
                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              )}
              {mode === "login" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs text-amber hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              <Button type="submit" className="w-full pirate-btn" disabled={loading}>
                {loading ? "..." : mode === "login" ? "Sign In" : mode === "signup" ? "Sign Up" : "Send Reset Link"}
              </Button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              style={{ background: "#FAF7F2", borderColor: "rgba(80,60,30,0.2)" }}
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: window.location.origin },
                });
                if (error) toast.error(`⚓ ${error.message}`);
              }}
            >
              <GoogleLogo size={18} weight="bold" />
              Continue with Google
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              {mode === "forgot" ? (
                <button type="button" onClick={() => setMode("login")} className="text-amber font-medium hover:underline">
                  Back to sign in
                </button>
              ) : (
                <>
                  {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => setMode(mode === "login" ? "signup" : "login")}
                    className="text-amber font-medium hover:underline"
                  >
                    {mode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </>
              )}
            </p>

            <p className="font-georgia italic text-[11px] text-muted-foreground text-center mt-5">
              Your voyages await, Captain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
