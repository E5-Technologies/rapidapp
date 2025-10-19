import { Camera } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      {/* Camera Button - Elevated */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-6">
        <button className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
          <Camera className="w-6 h-6 text-background" strokeWidth={1.5} />
        </button>
      </div>

      {/* Navigation Items */}
      <div className="max-w-lg mx-auto grid grid-cols-3 h-24 px-6 pt-2">
        {/* Route */}
        <Link
          to="/route"
          className={`flex flex-col items-center justify-center gap-2 transition-colors ${
            location.pathname === "/route" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-7 h-7"
          >
            <path d="M6 18c0-2 2-4 4-4s4 2 4 4m4-8c0-2-2-4-4-4s-4 2-4 4" />
          </svg>
          <span className="text-xs font-semibold">Route</span>
        </Link>

        {/* Materials */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-2 transition-colors ${
            location.pathname === "/" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-7 h-7"
          >
            <rect x="4" y="10" width="4" height="4" rx="1" />
            <rect x="16" y="10" width="4" height="4" rx="1" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <span className="text-xs font-semibold">Materials</span>
        </Link>

        {/* Favorites */}
        <Link
          to="/favorites"
          className={`flex flex-col items-center justify-center gap-2 transition-colors ${
            location.pathname === "/favorites" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-7 h-7"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
          <span className="text-xs font-semibold">Favorites</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;