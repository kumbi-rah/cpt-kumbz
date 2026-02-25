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
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[260px] bg-nav border-r-2 border-border z-50">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 pt-7 pb-5">
        <CompassRose size={28} className="text-amber" />
        <div>
          <h1 className="font-georgia italic text-xl text-ink leading-tight">Captain Kumbz</h1>
          <p className="font-georgia text-[13px] text-muted-foreground -mt-0.5">Adventures</p>
        </div>
      </div>
      <div className="h-px bg-border mx-5" />

      {/* Nav links */}
      <nav className="flex flex-col gap-1.5 px-4 mt-5 flex-1">
        {navItems.map((item) => {
          const active = item.match(path);
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-[15px] font-medium transition-colors relative ${
                active
                  ? "text-amber bg-amber/10"
                  : "text-muted-foreground hover:text-ink hover:bg-accent/50"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r bg-amber" />
              )}
              <item.icon size={22} className={`flex-shrink-0 ${active ? "text-amber" : ""}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* New Voyage button */}
      <div className="px-5 pb-4">
        <button
          onClick={onCreateClick}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-lg bg-amber text-primary-foreground font-medium text-[15px] hover:bg-amber/90 transition-colors border border-amber/20"
        >
          <AnchorIcon size={20} />
          New Voyage
        </button>
      </div>

      {/* Log Out */}
      <div className="px-5 pb-7">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <SignOut size={18} weight="duotone" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
