import { Camera, Map } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const BottomNav = () => {
  const location = useLocation();
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      {/* Camera Button - Elevated */}
      <div className={`absolute left-1/2 -translate-x-1/2 -top-6 transition-all duration-300 ${
        isScrolling ? "opacity-0 scale-75 pointer-events-none" : "opacity-100 scale-100"
      }`}>
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
          <Map className="w-7 h-7" strokeWidth={2} />
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
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-7 h-7"
          >
            {/* Valve/pipe icon */}
            <circle cx="6" cy="12" r="2" />
            <circle cx="18" cy="12" r="2" />
            <line x1="8" y1="12" x2="16" y2="12" strokeWidth="3" />
            <line x1="6" y1="10" x2="6" y2="8" />
            <line x1="6" y1="16" x2="6" y2="14" />
            <line x1="18" y1="10" x2="18" y2="8" />
            <line x1="18" y1="16" x2="18" y2="14" />
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