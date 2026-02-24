import { useLocation, useNavigate } from "react-router-dom";
import { House, Plus, GlobeHemisphereWest, Compass, SignOut } from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  onCreateClick?: () => void;
}

export default function SideNav({ onCreateClick }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const isHome = location.pathname === "/";
  const isGlobe = location.pathname === "/globe";

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-56 bg-nav border-r border-border z-50">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 pt-6 pb-4">
        <Compass size={24} weight="duotone" className="text-amber" />
        <div>
          <h1 className="font-georgia italic text-lg text-ink leading-tight">Cpt. Kumbz</h1>
          <p className="font-georgia text-[10px] text-muted-foreground -mt-0.5">Adventures</p>
        </div>
      </div>

      <div className="h-px bg-border mx-4" />

      {/* Nav links */}
      <nav className="flex flex-col gap-1 px-3 mt-4 flex-1">
        <button
          onClick={() => navigate("/")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isHome ? "bg-accent text-amber" : "text-muted-foreground hover:text-ink hover:bg-accent/50"
          }`}
        >
          <House size={20} weight="duotone" />
          Home
        </button>
        <button
          onClick={() => navigate("/globe")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isGlobe ? "bg-accent text-teal" : "text-muted-foreground hover:text-ink hover:bg-accent/50"
          }`}
        >
          <GlobeHemisphereWest size={20} weight="duotone" />
          Globe
        </button>
      </nav>

      {/* Create button */}
      <div className="px-4 pb-4">
        <button
          onClick={onCreateClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber text-primary-foreground font-medium text-sm hover:bg-amber/90 transition-colors"
        >
          <Plus size={18} weight="bold" />
          New Trip
        </button>
      </div>

      {/* Logout */}
      <div className="px-4 pb-6">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <SignOut size={20} weight="duotone" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
