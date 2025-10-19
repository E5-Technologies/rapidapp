import { MapPin, Package, Star, Camera } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center h-20 px-6 relative">
        {/* Route */}
        <Link
          to="/route"
          className={`flex flex-col items-center gap-1 transition-colors ${
            location.pathname === "/route" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          <MapPin className="w-6 h-6" />
          <span className="text-xs font-medium">Route</span>
        </Link>

        {/* Camera Button - Centered and Elevated */}
        <button className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 rounded-full bg-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
          <Camera className="w-6 h-6 text-background" />
        </button>

        {/* Materials */}
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 transition-colors ${
            location.pathname === "/" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          <Package className="w-6 h-6" />
          <span className="text-xs font-medium">Materials</span>
        </Link>

        {/* Favorites */}
        <Link
          to="/favorites"
          className={`flex flex-col items-center gap-1 transition-colors ${
            location.pathname === "/favorites" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          <Star className="w-6 h-6" />
          <span className="text-xs font-medium">Favorites</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;
