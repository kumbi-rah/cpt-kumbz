import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import CreateTripDialog from "@/components/CreateTripDialog";
import Index from "./pages/Index";
import TripDetail from "./pages/TripDetail";
import GlobePage from "./pages/GlobePage";
import PublicSharePage from "./pages/PublicSharePage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
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
      <main className={`flex-1 ${user ? "md:ml-56" : ""}`}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/share/:shareToken" element={<PublicSharePage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
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
            path="/create"
            element={
              <ProtectedRoute>
                <Index />
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
