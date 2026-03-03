import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import CreateTripDialog from "@/components/CreateTripDialog";
import Index from "./pages/Index";
import Trips from "./pages/Trips";
import TripDetail from "./pages/TripDetail";
import AdminUsers from "./pages/AdminUsers";
import GlobePage from "./pages/GlobePage";
import Settings from "./pages/Settings";
import ProfileSetup from "./pages/ProfileSetup";
import PublicSharePage from "./pages/PublicSharePage";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setCheckingProfile(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (error && error.code === "PGRST116") {
          // No profile found - redirect to setup
          navigate("/profile-setup", { replace: true });
        }
      } catch (err) {
        console.error("Error checking profile:", err);
      } finally {
        setCheckingProfile(false);
      }
    };

    if (!loading) {
      checkProfile();
    }
  }, [user, loading, navigate]);

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-georgia italic text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AppLayout() {
  const [createOpen, setCreateOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen w-full">
      {user && <SideNav onCreateClick={() => setCreateOpen(true)} />}
      <main className={`flex-1 overflow-x-hidden animate-page-enter ${user ? "md:ml-[260px]" : ""}`}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/share/:shareToken" element={<PublicSharePage />} />
          <Route
            path="/profile-setup"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index onCreateClick={() => setCreateOpen(true)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <Trips onCreateClick={() => setCreateOpen(true)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trip/:id"
            element={
              <ProtectedRoute>
                <TripDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/globe"
            element={
              <ProtectedRoute>
                <GlobePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <Index onCreateClick={() => setCreateOpen(true)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {user && <BottomNav onCreateClick={() => setCreateOpen(true)} />}
      <CreateTripDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
