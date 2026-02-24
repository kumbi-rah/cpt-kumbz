import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fn = mode === "login" ? signIn : signUp;
    const { error } = await fn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      if (mode === "signup") {
        toast.success("Check your email to confirm your account!");
      } else {
        navigate("/");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-background">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Compass size={36} weight="duotone" className="text-amber" />
          </div>
          <h1 className="font-georgia italic text-3xl text-ink">Cpt. Kumbz</h1>
          <p className="font-georgia text-muted-foreground">Adventures</p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="font-georgia text-lg font-bold text-ink mb-4">
            {mode === "login" ? "Welcome Back" : "Join the Adventure"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full bg-amber hover:bg-amber/90 text-white" disabled={loading}>
              {loading ? "..." : mode === "login" ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-amber font-medium hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
