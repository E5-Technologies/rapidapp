import { Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import logo from "@/assets/rapid-logo.png";
import { Link } from "react-router-dom";

import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import EquipmentIdentifierDialog from "@/components/EquipmentIdentifierDialog";
import MaterialSearchDialog from "@/components/MaterialSearchDialog";
import SalesContactDialog from "@/components/SalesContactDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Material {
  id: string;
  manufacturer_id: string;
  category: string;
  title: string;
  product_name: string;
  serial_number?: string | null;
  model_number?: string | null;
  rating: number;
  image_url: string | null;
  datasheet_url: string | null;
  purchase_count: number;
  manufacturer?: {
    name: string;
    logo_url: string | null;
  };
}

const Materials = () => {
  const [showEquipmentDialog, setShowEquipmentDialog] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [selectedManufacturerForContact, setSelectedManufacturerForContact] = useState<{ id: string; name: string } | null>(null);
  const [exactMatch, setExactMatch] = useState<Material | null>(null);
  const [otherResults, setOtherResults] = useState<Material[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Search materials from database - server-side search for all 12,785+ items
  const searchMaterials = async (query: string) => {
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from('materials')
        .select(`
          *,
          manufacturer:manufacturers(name, logo_url)
        `);

      if (query.trim()) {
        // Server-side search using ilike for flexible matching
        const searchTerm = `%${query.trim()}%`;
        queryBuilder = queryBuilder.or(
          `title.ilike.${searchTerm},product_name.ilike.${searchTerm},model_number.ilike.${searchTerm},serial_number.ilike.${searchTerm},category.ilike.${searchTerm}`
        );
      }

      const { data, error } = await queryBuilder
        .order('purchase_count', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error searching materials:', error);
      toast({
        title: "Search error",
        description: "Could not search materials. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Initial load - don't fetch anything until user searches
  useEffect(() => {
    // Load a sample of popular items for initial display
    const loadInitialMaterials = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('materials')
          .select(`
            *,
            manufacturer:manufacturers(name, logo_url)
          `)
          .order('purchase_count', { ascending: false })
          .limit(20);

        if (error) throw error;
        setAllMaterials(data || []);
      } catch (error) {
        console.error('Error loading materials:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialMaterials();
  }, []);

  // Apply server-side search when query changes
  useEffect(() => {
    if (!activeSearchQuery.trim()) {
      setMaterials(allMaterials);
      setExactMatch(null);
      setOtherResults([]);
      return;
    }

    // Perform server-side search
    const performSearch = async () => {
      const results = await searchMaterials(activeSearchQuery);
      
      if (results.length === 0) {
        setMaterials([]);
        setExactMatch(null);
        setOtherResults([]);
        return;
      }

      const query = activeSearchQuery.toLowerCase().trim();
      
      // Score results to find best match
      const scoredMaterials = results.map(material => {
        const title = material.title?.toLowerCase() || "";
        const productName = material.product_name?.toLowerCase() || "";
        const serialNumber = material.serial_number?.toLowerCase() || "";
        const modelNumber = material.model_number?.toLowerCase() || "";
        
        let score = 0;
        
        if (serialNumber === query || modelNumber === query) score = 100;
        else if (title === query || productName === query) score = 95;
        else if (serialNumber?.startsWith(query) || modelNumber?.startsWith(query)) score = 90;
        else if (title.startsWith(query) || productName.startsWith(query)) score = 85;
        else if (serialNumber?.includes(query) || modelNumber?.includes(query)) score = 75;
        else if (title.includes(query) || productName.includes(query)) score = 70;
        else score = 50;
        
        return { material, score };
      }).sort((a, b) => b.score - a.score);

      // If top result has high score, show as exact match
      if (scoredMaterials[0].score >= 85) {
        setExactMatch(scoredMaterials[0].material);
        setOtherResults(scoredMaterials.slice(1).map(s => s.material));
        setMaterials(scoredMaterials.map(s => s.material));
      } else {
        setExactMatch(null);
        setOtherResults([]);
        setMaterials(scoredMaterials.map(s => s.material));
      }
    };

    performSearch();
  }, [activeSearchQuery]);

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  };

  const handleFileCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setCapturedImage(base64);
        setShowEquipmentDialog(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleEquipmentDialogChange = (open: boolean) => {
    setShowEquipmentDialog(open);
    if (!open) {
      setCapturedImage(null);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearchSubmit = () => {
    setActiveSearchQuery(searchQuery);
  };

  const handleContactClick = (manufacturerId: string, manufacturerName: string) => {
    setSelectedManufacturerForContact({ id: manufacturerId, name: manufacturerName });
    setShowContactDialog(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
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
      </div>

      {/* Search Bar - Only show centered when no search results */}
      {!activeSearchQuery && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
          <h1 className="text-4xl font-bold text-foreground mb-4">Material Search</h1>
          <p className="text-muted-foreground mb-6 text-center">
            Search across <span className="font-semibold text-foreground">12,785+</span> equipment items or take a photo to identify
          </p>
          <div className="w-full max-w-2xl">
            <SearchBar
              placeholder="Material Description, Serial Number, Model Number etc."
              value={searchQuery}
              onChange={handleSearchChange}
              onEnterPress={handleSearchSubmit}
              onSearchClick={handleSearchSubmit}
              onCameraClick={handleCameraClick}
            />
          </div>
        </div>
      )}

      {/* Search Bar - Compact version at top when showing results */}
      {activeSearchQuery && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <h1 className="text-4xl font-bold text-foreground mb-6">Material Search</h1>
          <div className="w-full max-w-2xl mb-8">
            <SearchBar
              placeholder="Material Description, Serial Number, Model Number etc."
              value={searchQuery}
              onChange={handleSearchChange}
              onEnterPress={handleSearchSubmit}
              onSearchClick={handleSearchSubmit}
              onCameraClick={handleCameraClick}
            />
          </div>
        </div>
      )}

      {/* Product List - Only show when there's a search query or active filters */}
      {activeSearchQuery && (
        <div className="px-4 space-y-8 mt-4 pb-24">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading materials...</div>
          ) : materials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {activeSearchQuery ? `No materials found for "${activeSearchQuery}"` : "No materials found."}
            </div>
          ) : exactMatch ? (
            // Exact match found - show "We Found Your Material!" section
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-6">We Found Your Material!</h2>
                <ProductCard
                  key={exactMatch.id}
                  company={exactMatch.manufacturer?.name || "Unknown"}
                  logo={exactMatch.manufacturer?.logo_url || ""}
                  title={exactMatch.title}
                  product={exactMatch.product_name}
                  rating={exactMatch.rating}
                  image={exactMatch.image_url || ""}
                  dataSheet={exactMatch.datasheet_url}
                  manufacturerId={exactMatch.manufacturer_id}
                  category={exactMatch.category}
                  onContactClick={() => handleContactClick(exactMatch.manufacturer_id, exactMatch.manufacturer?.name || "Unknown")}
                />
              </div>
              
              {otherResults.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-6">Other Suggestions</h2>
                  <div className="space-y-8">
                    {otherResults.map((material) => (
                      <ProductCard
                        key={material.id}
                        company={material.manufacturer?.name || "Unknown"}
                        logo={material.manufacturer?.logo_url || ""}
                        title={material.title}
                        product={material.product_name}
                        rating={material.rating}
                        image={material.image_url || ""}
                        dataSheet={material.datasheet_url}
                        manufacturerId={material.manufacturer_id}
                        category={material.category}
                        onContactClick={() => handleContactClick(material.manufacturer_id, material.manufacturer?.name || "Unknown")}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            // No exact match - show "Search Results"
            <>
              <h2 className="text-3xl font-bold text-foreground mb-6">Search Results</h2>
              <div className="space-y-8">
                {materials.map((material) => (
                  <ProductCard
                    key={material.id}
                    company={material.manufacturer?.name || 'Unknown'}
                    logo={material.manufacturer?.logo_url || ''}
                    title={material.title}
                    product={material.product_name}
                    rating={material.rating}
                    image={material.image_url || ''}
                    dataSheet={material.datasheet_url}
                    manufacturerId={material.manufacturer_id}
                    category={material.category}
                    onContactClick={() => handleContactClick(material.manufacturer_id, material.manufacturer?.name || 'Unknown')}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Camera input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileCapture}
      />
      
      <EquipmentIdentifierDialog
        open={showEquipmentDialog}
        onOpenChange={handleEquipmentDialogChange}
        initialImage={capturedImage}
      />

      <MaterialSearchDialog
        open={showSearchDialog}
        onOpenChange={setShowSearchDialog}
        isSearching={isSearching}
        searchResult={searchResult}
      />

      <SalesContactDialog
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
        manufacturerId={selectedManufacturerForContact?.id || ''}
        manufacturerName={selectedManufacturerForContact?.name || ''}
        userRegion="Gulf Coast"
      />

      <BottomNav />
    </div>
  );
};

export default Materials;
