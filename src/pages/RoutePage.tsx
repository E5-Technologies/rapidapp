import { useState, useEffect } from "react";
import { Download, Pin, Star, X, Navigation, Settings } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import logo from "@/assets/rapid-logo.png";
import { Link } from "react-router-dom";

import ViewToggle from "@/components/ViewToggle";
import LocationListItem from "@/components/LocationListItem";
import BottomNav from "@/components/BottomNav";
import InteractiveMap from "@/components/InteractiveMap";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface WellLocation {
  name: string;
  status?: "routing";
  type: "tank" | "fed" | "other";
  lat: number;
  lng: number;
  operator?: string;
  field?: string;
}

const Route = () => {
  const [view, setView] = useState<"map" | "list">("map");
  const [selectedLocation, setSelectedLocation] = useState<WellLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const { toast } = useToast();

  // Comprehensive oil and gas well database with coordinates
  const allLocations: WellLocation[] = [
    // Permian Basin - Texas
    { name: "Permian HZ-1", type: "other", lat: 31.8457, lng: -102.3676, operator: "ExxonMobil", field: "Permian Basin" },
    { name: "Permian HZ-2", type: "other", lat: 31.8523, lng: -102.3821, operator: "Chevron", field: "Permian Basin" },
    { name: "Wolfcamp A-15", type: "other", lat: 31.9234, lng: -102.4567, operator: "Pioneer Natural", field: "Midland Basin" },
    { name: "Spraberry 44-7H", type: "other", lat: 31.7654, lng: -102.2345, operator: "Diamondback", field: "Spraberry" },
    { name: "Delaware Basin #3", type: "other", lat: 32.0123, lng: -103.5678, operator: "Occidental", field: "Delaware Basin" },
    
    // Eagle Ford Shale - Texas
    { name: "Eagle Ford 1H", type: "other", lat: 28.4234, lng: -98.4567, operator: "EOG Resources", field: "Eagle Ford" },
    { name: "Eagle Ford 2H", type: "other", lat: 28.5678, lng: -98.3456, operator: "ConocoPhillips", field: "Eagle Ford" },
    { name: "Karnes County #12", type: "other", lat: 28.8901, lng: -97.8765, operator: "Marathon Oil", field: "Eagle Ford" },
    
    // Bakken Formation - North Dakota
    { name: "Bakken Unit 1-15H", type: "other", lat: 47.7589, lng: -103.2314, operator: "Continental", field: "Bakken" },
    { name: "Bakken TF-152H", type: "other", lat: 47.8234, lng: -103.4567, operator: "Whiting Petroleum", field: "Bakken" },
    { name: "Three Forks 44-3H", type: "other", lat: 48.0123, lng: -103.6789, operator: "Hess", field: "Three Forks" },
    { name: "Mountrail 156-94", type: "other", lat: 48.1234, lng: -102.8901, operator: "Oasis Petroleum", field: "Bakken" },
    
    // DJ Basin - Colorado
    { name: "Wattenberg 32-14", type: "other", lat: 40.2345, lng: -104.6789, operator: "PDC Energy", field: "Wattenberg" },
    { name: "Niobrara A-21H", type: "other", lat: 40.1234, lng: -104.5678, operator: "Civitas", field: "DJ Basin" },
    { name: "Codell 15-22", type: "other", lat: 40.3456, lng: -104.7890, operator: "Occidental", field: "DJ Basin" },
    
    // Haynesville Shale - Louisiana
    { name: "Haynesville 1H", type: "other", lat: 32.5234, lng: -93.8765, operator: "Chesapeake", field: "Haynesville" },
    { name: "Cotton Valley #8", type: "other", lat: 32.4567, lng: -93.9876, operator: "Encana", field: "Haynesville" },
    
    // Marcellus Shale - Pennsylvania
    { name: "Marcellus 4H", type: "other", lat: 41.7654, lng: -77.8901, operator: "Range Resources", field: "Marcellus" },
    { name: "Marcellus 7H", type: "other", lat: 41.8765, lng: -77.7890, operator: "EQT Corporation", field: "Marcellus" },
    
    // Tank Batteries
    { name: "Permian Central TB", type: "tank", lat: 31.9567, lng: -102.4321, operator: "Devon Energy", field: "Permian Basin" },
    { name: "Midland Basin TB-1", type: "tank", lat: 31.8890, lng: -102.1234, operator: "Pioneer Natural", field: "Midland Basin" },
    { name: "Spraberry Tank Battery", type: "tank", lat: 31.8123, lng: -102.3567, operator: "Diamondback", field: "Spraberry" },
    { name: "Delaware TB-5", type: "tank", lat: 32.0456, lng: -103.4567, operator: "Occidental", field: "Delaware Basin" },
    { name: "Eagle Ford Tank Battery", type: "tank", lat: 28.5123, lng: -98.2345, operator: "EOG Resources", field: "Eagle Ford" },
    { name: "Bakken Central TB", type: "tank", lat: 47.8901, lng: -103.3456, operator: "Continental", field: "Bakken" },
    { name: "Wattenberg TB-2", type: "tank", lat: 40.1890, lng: -104.6234, operator: "PDC Energy", field: "Wattenberg" },
    { name: "Haynesville Tank Battery", type: "tank", lat: 32.4890, lng: -93.9234, operator: "Chesapeake", field: "Haynesville" },
    { name: "Marcellus TB-3", type: "tank", lat: 41.8234, lng: -77.8345, operator: "Range Resources", field: "Marcellus" },
    
    // Legacy locations with updated coordinates
    { name: "Red Tank 19 CTB", type: "tank", lat: 31.7234, lng: -102.5678, operator: "Devon Energy", field: "Permian Basin" },
    { name: "Red Tank 19 CGL", type: "tank", lat: 31.7345, lng: -102.5789, operator: "Devon Energy", field: "Permian Basin" },
    { name: "Lost Tank 5 Fed 3", type: "fed", lat: 31.8456, lng: -102.6890, operator: "Devon Energy", field: "Permian Basin" },
    { name: "Lost Tank 5 Fed 2", type: "fed", lat: 31.8567, lng: -102.6901, operator: "Devon Energy", field: "Permian Basin" },
    { name: "Lost Tank 5 Fed 1", type: "fed", lat: 31.8678, lng: -102.7012, operator: "Devon Energy", field: "Permian Basin" },
    { name: "Avogato 19 Fed 2", type: "fed", lat: 31.9789, lng: -102.8123, operator: "Apache", field: "Permian Basin" },
    { name: "Avogato 19 Fed 1", type: "fed", lat: 31.9890, lng: -102.8234, operator: "Apache", field: "Permian Basin" },
    { name: "Headchog 56 CTB", type: "tank", lat: 32.0901, lng: -102.9345, operator: "Apache", field: "Permian Basin" },
    { name: "Headchog 56 Fed 3", type: "fed", lat: 32.1012, lng: -102.9456, operator: "Apache", field: "Permian Basin" },
    { name: "Headchog 56 Fed 2", type: "fed", lat: 32.1123, lng: -102.9567, operator: "Apache", field: "Permian Basin" },
    { name: "Headchog 56 Fed 1", type: "fed", lat: 32.1234, lng: -102.9678, operator: "Apache", field: "Permian Basin" },
  ];

  const [filteredLocations, setFilteredLocations] = useState<WellLocation[]>(allLocations);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Could not get your current location. Using default location.",
            variant: "destructive",
          });
          // Default to Midland, Texas (heart of Permian Basin)
          setUserLocation({ lat: 31.9973, lng: -102.0779 });
        }
      );
    } else {
      // Default location if geolocation not supported
      setUserLocation({ lat: 31.9973, lng: -102.0779 });
    }
  }, [toast]);

  // Filter locations based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLocations([]);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allLocations.filter(
        (location) =>
          location.name.toLowerCase().includes(query) ||
          location.operator?.toLowerCase().includes(query) ||
          location.field?.toLowerCase().includes(query)
      );
      setFilteredLocations(filtered);
    }
  }, [searchQuery]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleStartRoute = () => {
    if (!selectedLocation || !userLocation) {
      toast({
        title: "Cannot Start Route",
        description: "Location data not available",
        variant: "destructive",
      });
      return;
    }

    setIsRouting(true);
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      selectedLocation.lat,
      selectedLocation.lng
    );

    toast({
      title: "Route Started",
      description: `Navigating to ${selectedLocation.name} (${distance.toFixed(1)} miles away)`,
    });

    // Open in Google Maps for actual navigation
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedLocation.lat},${selectedLocation.lng}&travelmode=driving`;
    window.open(mapsUrl, "_blank");
  };

  const handleLocationSelect = (location: WellLocation) => {
    setSelectedLocation(location);
    if (view === "list") {
      setView("map");
    }
  };

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
        
        <div className="flex items-center justify-between px-4 py-1">
          <div className="w-5" />
          <img src={logo} alt="Rapid Logo" className="h-10 w-auto" />
          <Link to="/settings">
            <Settings className="w-5 h-5 text-foreground hover:text-primary transition-colors" />
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold px-4 py-2">Location</h1>
        
        <div className="py-3">
          <ViewToggle view={view} onViewChange={setView} />
        </div>
        
        <SearchBar
          placeholder="Search wells, operators, or fields..." 
          onFilterClick={() => {}}
          onChange={(value) => setSearchQuery(value)}
        />
      </div>

      {/* Map or List View */}
      {view === "map" ? (
        <div className="relative h-[calc(100vh-240px)]">
          {/* Interactive Satellite Map */}
          <div className="w-full h-full bg-muted/30 relative overflow-hidden">
            <InteractiveMap 
              userLocation={userLocation}
              selectedLocation={selectedLocation}
            />

            {/* Search Results Indicator */}
            {searchQuery && filteredLocations.length > 0 && !selectedLocation && (
              <div className="absolute top-4 left-4 right-4 bg-card/95 backdrop-blur rounded-lg p-3 shadow-lg">
                <p className="text-sm font-medium">
                  Found {filteredLocations.length} well{filteredLocations.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Select from list below to view location
                </p>
              </div>
            )}
          </div>

          {/* Location Detail Card */}
          {selectedLocation && (
            <div className="absolute bottom-4 left-4 right-4 bg-card rounded-2xl p-4 shadow-2xl">
              <button
                onClick={() => {
                  setSelectedLocation(null);
                  setIsRouting(false);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="pr-8">
                <h3 className="font-bold text-lg mb-1">{selectedLocation.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
                </p>
                {selectedLocation.operator && (
                  <p className="text-xs text-muted-foreground">
                    Operator: {selectedLocation.operator}
                  </p>
                )}
                {selectedLocation.field && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Field: {selectedLocation.field}
                  </p>
                )}
                
                {userLocation && (
                  <div className="bg-muted/50 rounded-lg p-2 mb-4">
                    <p className="text-xs font-medium">
                      Distance: {calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        selectedLocation.lat,
                        selectedLocation.lng
                      ).toFixed(1)} miles
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <button className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center hover:bg-muted/50 transition-colors">
                    <Star className="w-5 h-5" />
                  </div>
                  <span className="text-xs">Favorites</span>
                </button>
                
                <button className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center hover:bg-muted/50 transition-colors">
                    <Download className="w-5 h-5" />
                  </div>
                  <span className="text-xs">Download</span>
                </button>
                
                <button className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center hover:bg-muted/50 transition-colors">
                    <Pin className="w-5 h-5" />
                  </div>
                  <span className="text-xs">Pin</span>
                </button>
              </div>
              
              <Button 
                onClick={handleStartRoute}
                disabled={!userLocation}
                className="w-full rounded-full h-12 text-base font-semibold"
              >
                <Navigation className="w-5 h-5 mr-2" />
                {isRouting ? "Navigate in Maps" : "Start Route"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card max-h-[calc(100vh-240px)] overflow-y-auto">
          {searchQuery.trim() === "" ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground text-lg">Start searching to find wells</p>
              <p className="text-sm text-muted-foreground mt-2">Search by well name, operator, or field</p>
            </div>
          ) : filteredLocations.length > 0 ? (
            filteredLocations.map((location, index) => (
              <div key={index} onClick={() => handleLocationSelect(location)}>
                <LocationListItem 
                  name={location.name}
                  status={location.name === selectedLocation?.name ? "routing" : undefined}
                  type={location.type}
                />
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No wells found matching "{searchQuery}"</p>
              <p className="text-sm text-muted-foreground mt-2">Try searching by well name, operator, or field</p>
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Route;
