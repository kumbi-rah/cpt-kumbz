import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import CompassRose from "@/components/icons/CompassRose";
import TreasureMapScroll from "@/components/icons/TreasureMapScroll";
import ShipsWheel from "@/components/icons/ShipsWheel";
import AnchorIcon from "@/components/icons/AnchorIcon";
import { Settings } from "lucide-react";

interface Props {
  onCreateClick?: () => void;
}

export default function BottomNav({ onCreateClick }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const isHome = path === "/";
  const isTrips = path === "/trips";
  const isGlobe = path === "/globe";
  const isSettings = path === "/settings";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-nav border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto relative">
        {/* Home */}
        <button
          onClick={() => navigate("/")}
          className={`flex flex-col items-center gap-0.5 transition-colors ${isHome ? "text-amber" : "text-muted-foreground"}`}
        >
          <CompassRose size={24} />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        {/* Trips */}
        <button
          onClick={() => navigate("/trips")}
          className={`flex flex-col items-center gap-0.5 transition-colors ${isTrips ? "text-amber" : "text-muted-foreground"}`}
        >
          <TreasureMapScroll size={24} />
          <span className="text-[10px] font-medium">Trips</span>
        </button>

        {/* Center floating anchor button */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-5">
          <button
            onClick={onCreateClick}
            className="w-14 h-14 rounded-full bg-amber text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          >
            <AnchorIcon size={28} />
          </button>
        </div>

        {/* Spacer for center */}
        <div className="w-14" />

        {/* Globe */}
        <button
          onClick={() => navigate("/globe")}
          className={`flex flex-col items-center gap-0.5 transition-colors ${isGlobe ? "text-amber" : "text-muted-foreground"}`}
        >
          <ShipsWheel size={24} />
          <span className="text-[10px] font-medium">Globe</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => navigate("/settings")}
          className={`flex flex-col items-center gap-0.5 transition-colors ${isSettings ? "text-amber" : "text-muted-foreground"}`}
        >
          <Settings size={22} />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>
    </nav>
  );
}
