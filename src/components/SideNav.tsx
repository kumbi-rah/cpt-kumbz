import { useLocation, useNavigate } from "react-router-dom";
import { SignOut } from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";
import CompassRose from "@/components/icons/CompassRose";
import TreasureMapScroll from "@/components/icons/TreasureMapScroll";
import ShipsWheel from "@/components/icons/ShipsWheel";
import AnchorIcon from "@/components/icons/AnchorIcon";

interface Props {
  onCreateClick?: () => void;
}

export default function SideNav({ onCreateClick }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const path = location.pathname;

  const navItems = [
    { label: "Home", icon: CompassRose, route: "/", match: (p: string) => p === "/" },
    { label: "Trips", icon: TreasureMapScroll, route: "/trips", match: (p: string) => p === "/trips" },
    { label: "Globe", icon: ShipsWheel, route: "/globe", match: (p: string) => p === "/globe" },
  ];

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[200px] bg-nav border-r border-border z-50">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 pt-6 pb-4">
        <CompassRose size={24} className="text-amber" />
        <div>
          <h1 className="font-georgia italic text-lg text-ink leading-tight">Captain Kumbz</h1>
          <p className="font-georgia text-[10px] text-muted-foreground -mt-0.5">Adventures</p>
        </div>
      </div>

      <div className="h-px bg-border mx-4" />

      {/* Nav links */}
      <nav className="flex flex-col gap-1 px-3 mt-4 flex-1">
        {navItems.map((item) => {
          const active = item.match(path);
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                active
                  ? "text-amber"
                  : "text-muted-foreground hover:text-ink hover:bg-accent/50"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r bg-amber" />
              )}
              <item.icon size={20} className={`flex-shrink-0 ${active ? "text-amber" : ""}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* New Voyage button */}
      <div className="px-4 pb-4">
        <button
          onClick={onCreateClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber text-primary-foreground font-medium text-sm hover:bg-amber/90 transition-colors"
        >
          <AnchorIcon size={18} />
          New Voyage
        </button>
      </div>

      {/* Log Out */}
      <div className="px-4 pb-6">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <SignOut size={16} weight="duotone" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
