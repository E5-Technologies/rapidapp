import { Download } from "lucide-react";
import LocationListItem from "@/components/LocationListItem";
import BottomNav from "@/components/BottomNav";
import logo from "@/assets/rapid-logo.png";

const Favorites = () => {
  const favorites = [
    { name: "Red Tank 19 CTB", status: undefined, type: "tank" as const, hasDownload: true },
    { name: "Red Tank 19 CGL", status: undefined, type: "tank" as const, hasDownload: false },
    { name: "Lost Tank 5 Fed 3", status: undefined, type: "fed" as const, hasDownload: false },
    { name: "Lost Tank 5 Fed 2", status: undefined, type: "fed" as const, hasDownload: false },
    { name: "Lost Tank 5 Fed 1", status: undefined, type: "fed" as const, hasDownload: false },
    { name: "Avogato 19 Fed 2", status: undefined, type: "fed" as const, hasDownload: false },
    { name: "Avogato 19 Fed 1", status: undefined, type: "fed" as const, hasDownload: false },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10 pt-2">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-sm font-medium">9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 bg-foreground rounded-sm opacity-70" />
            <div className="w-4 h-3 bg-foreground rounded-sm opacity-70" />
            <div className="w-4 h-3 bg-foreground rounded-sm opacity-70" />
          </div>
        </div>
        
        <div className="flex items-center px-4 py-1">
          <img src={logo} alt="Rapid Logo" className="h-24 w-auto" />
        </div>
        
        <h1 className="text-2xl font-bold px-4 py-3">Favorites</h1>
      </div>

      {/* Favorites List */}
      <div className="bg-card mt-4">
        {favorites.map((location, index) => (
          <div key={index} className="relative">
            <LocationListItem {...location} />
            {location.hasDownload && (
              <Download className="w-4 h-4 absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Favorites;
