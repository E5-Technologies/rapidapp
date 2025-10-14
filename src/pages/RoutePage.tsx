import { useState } from "react";
import { Camera, Download, Pin, Star, X } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import ViewToggle from "@/components/ViewToggle";
import LocationListItem from "@/components/LocationListItem";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

const Route = () => {
  const [view, setView] = useState<"map" | "list">("map");
  const [selectedLocation, setSelectedLocation] = useState<string | null>("Red Tank 19 CTB");

  const locations = [
    { name: "Red Tank 19 CTB", status: "routing" as const, type: "tank" as const },
    { name: "Red Tank 19 CGL", status: undefined, type: "tank" as const },
    { name: "Lost Tank 5 Fed 3", status: undefined, type: "fed" as const },
    { name: "Lost Tank 5 Fed 2", status: undefined, type: "fed" as const },
    { name: "Lost Tank 5 Fed 1", status: undefined, type: "fed" as const },
    { name: "Avogato 19 Fed 2", status: undefined, type: "fed" as const },
    { name: "Avogato 19 Fed 1", status: undefined, type: "fed" as const },
    { name: "Headchog 56 CTB", status: undefined, type: "tank" as const },
    { name: "Headchog 56 Fed 3", status: undefined, type: "fed" as const },
    { name: "Headchog 56 Fed 2", status: undefined, type: "fed" as const },
    { name: "Headchog 56 Fed 1", status: undefined, type: "fed" as const },
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
        
        <div className="py-3">
          <ViewToggle view={view} onViewChange={setView} />
        </div>
        
        <SearchBar placeholder="What are you craving?" onFilterClick={() => {}} />
      </div>

      {/* Map or List View */}
      {view === "map" ? (
        <div className="relative h-[calc(100vh-240px)]">
          {/* Map Placeholder */}
          <div className="w-full h-full bg-muted/30 relative overflow-hidden">
            <img 
              src="https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-104.991531,39.742043,12,0/800x600@2x?access_token=pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTJyaXU4Z3gwMXM3MmtvZnI2cTBhaHNrIn0.HWjUBcJNrhHjy0-5r2HUpA"
              alt="Map"
              className="w-full h-full object-cover"
            />
            
            {/* Current Location Marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg" />
            </div>
          </div>

          {/* Location Detail Card */}
          {selectedLocation && (
            <div className="absolute bottom-4 left-4 right-4 bg-card rounded-2xl p-4 shadow-2xl">
              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
              
              <h3 className="font-bold text-lg mb-1">{selectedLocation}</h3>
              <p className="text-sm text-muted-foreground mb-4">30.37492, 104.3847</p>
              
              <div className="flex items-center gap-4 mb-4">
                <button className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center">
                    <Star className="w-5 h-5" />
                  </div>
                  <span className="text-xs">Favorites</span>
                </button>
                
                <button className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <span className="text-xs">Download</span>
                </button>
                
                <button className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center">
                    <Pin className="w-5 h-5" />
                  </div>
                  <span className="text-xs">Pin</span>
                </button>
              </div>
              
              <Button className="w-full rounded-full h-12 text-base font-semibold">
                Go To Route
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card">
          {locations.map((location, index) => (
            <LocationListItem key={index} {...location} />
          ))}
        </div>
      )}

      {/* Camera FAB */}
      <button className="fixed bottom-28 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg z-40">
        <Camera className="w-6 h-6" />
      </button>

      <BottomNav />
    </div>
  );
};

export default Route;
