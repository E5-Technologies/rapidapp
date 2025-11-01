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
import { supabase } from "@/integrations/supabase/client";

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
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const { toast } = useToast();

  // Comprehensive oil and gas well database with coordinates
  const [allLocations, setAllLocations] = useState<WellLocation[]>([]);

  const [filteredLocations, setFilteredLocations] = useState<WellLocation[]>([]);
  const [isLoadingWells, setIsLoadingWells] = useState(false);

  // Fetch well data from DrillingEdge on component mount
  useEffect(() => {
    const fetchWellData = async () => {
      setIsLoadingWells(true);
      try {
        console.log('Fetching well data from DrillingEdge...');
        const { data, error } = await supabase.functions.invoke('fetch-well-data');
        
        if (error) {
          console.error('Error fetching well data:', error);
          toast({
            title: "Well Data Error",
            description: "Could not fetch well data. Please try again.",
            variant: "destructive",
          });
          setIsLoadingWells(false);
          return;
        }

        if (data?.success && data.wells) {
          const externalWells: WellLocation[] = data.wells.map((well: any) => ({
            name: `${well.name} (API: ${well.apiNumber})`,
            type: "other" as const,
            lat: well.lat,
            lng: well.lng,
            operator: well.operator,
            field: well.location,
          }));
          
          setAllLocations(externalWells);
          console.log(`Loaded ${externalWells.length} wells from DrillingEdge`);
          toast({
            title: "Well Data Loaded",
            description: `Loaded ${externalWells.length} wells and leases`,
          });
        }
      } catch (err) {
        console.error('Error:', err);
        toast({
          title: "Loading Error",
          description: "Failed to load well data",
          variant: "destructive",
        });
      } finally {
        setIsLoadingWells(false);
      }
    };

    fetchWellData();
  }, [toast]);

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

  // Filter locations based on search query with fuzzy matching
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLocations([]);
    } else {
      const query = searchQuery.toLowerCase();
      
      // First pass: exact and partial matches
      let filtered = allLocations.filter(
        (location) =>
          location.name.toLowerCase().includes(query) ||
          location.operator?.toLowerCase().includes(query) ||
          location.field?.toLowerCase().includes(query)
      );
      
      // If we have fewer than 10 results, add similar matches
      if (filtered.length < 10) {
        const words = query.split(/\s+/);
        const similarMatches = allLocations.filter(location => {
          // Skip if already in filtered results
          if (filtered.some(f => f.name === location.name)) return false;
          
          // Check if any search word partially matches any part of the location data
          return words.some(word => 
            word.length > 2 && (
              location.name.toLowerCase().includes(word) ||
              location.operator?.toLowerCase().includes(word) ||
              location.field?.toLowerCase().includes(word) ||
              location.type.toLowerCase().includes(word)
            )
          );
        });
        
        // Combine and limit to reasonable number
        filtered = [...filtered, ...similarMatches].slice(0, 20);
      }
      
      setFilteredLocations(filtered);
    }
  }, [searchQuery, allLocations]);

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

    setIsRouting(!isRouting);
    
    if (!isRouting) {
      toast({
        title: "Route Started",
        description: `Calculating route to ${selectedLocation.name}`,
      });
    } else {
      setRouteInfo(null);
      toast({
        title: "Route Ended",
        description: "Navigation cancelled",
      });
    }
  };

  const handleRouteCalculated = (distance: number, duration: number) => {
    setRouteInfo({ distance, duration });
  };

  const handleLocationSelect = (location: WellLocation) => {
    setSelectedLocation(location);
    setIsRouting(false);
    setRouteInfo(null);
    if (view === "list") {
      setView("map");
    }
  };

  const handleSearchEnter = () => {
    // Switch to list view to show suggestions when Enter is pressed
    if (searchQuery.trim() !== "") {
      setView("list");
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
          suggestions={filteredLocations}
          onSuggestionSelect={handleLocationSelect}
          onEnterPress={handleSearchEnter}
          value={searchQuery}
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
              isRouting={isRouting}
              onRouteCalculated={handleRouteCalculated}
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
                
                {routeInfo ? (
                  <div className="bg-muted/50 rounded-lg p-2 mb-4">
                    <p className="text-xs font-medium">
                      Distance: {routeInfo.distance.toFixed(1)} miles
                    </p>
                    <p className="text-xs font-medium">
                      Duration: {Math.round(routeInfo.duration)} min
                    </p>
                  </div>
                ) : userLocation && (
                  <div className="bg-muted/50 rounded-lg p-2 mb-4">
                    <p className="text-xs font-medium">
                      Distance: {calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        selectedLocation.lat,
                        selectedLocation.lng
                      ).toFixed(1)} miles (straight line)
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
                variant={isRouting ? "destructive" : "default"}
                className="w-full rounded-full h-12 text-base font-semibold"
              >
                <Navigation className="w-5 h-5 mr-2" />
                {isRouting ? "End Route" : "Start Route"}
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
                  operator={location.operator}
                  field={location.field}
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
