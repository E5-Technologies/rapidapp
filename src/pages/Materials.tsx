import { Camera, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import logo from "@/assets/rapid-logo.png";
import { Link } from "react-router-dom";

import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import MaterialIdentificationDialog from "@/components/MaterialIdentificationDialog";
import MaterialSearchDialog from "@/components/MaterialSearchDialog";
import SalesContactDialog from "@/components/SalesContactDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

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
  const [showDialog, setShowDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [identification, setIdentification] = useState<any>(null);
  const [matchedProducts, setMatchedProducts] = useState<any[]>([]);
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

  // Fetch materials from database
  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('materials')
          .select(`
            *,
            manufacturer:manufacturers(name, logo_url)
          `)
          .order('purchase_count', { ascending: false })
          .limit(200);

        if (error) throw error;
        
        setAllMaterials(data || []);
        setMaterials(data || []);
      } catch (error) {
        console.error('Error fetching materials:', error);
        toast({
          title: "Error loading materials",
          description: "Could not load materials. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [toast]);

  // Apply search filter with exact match detection
  useEffect(() => {
    if (!activeSearchQuery.trim()) {
      setMaterials(allMaterials);
      setExactMatch(null);
      setOtherResults([]);
      return;
    }

    const query = activeSearchQuery.toLowerCase().trim();
    
    // Score each material based on how well it matches
    const scoredMaterials = allMaterials.map(material => {
      const title = material.title?.toLowerCase() || "";
      const productName = material.product_name?.toLowerCase() || "";
      const serialNumber = material.serial_number?.toLowerCase() || "";
      const modelNumber = material.model_number?.toLowerCase() || "";
      const manufacturerName = material.manufacturer?.name?.toLowerCase() || "";
      
      let score = 0;
      
      // Exact matches get highest score
      if (serialNumber === query || modelNumber === query) score = 100;
      else if (title === query || productName === query) score = 90;
      // Starts with query gets high score
      else if (serialNumber.startsWith(query) || modelNumber.startsWith(query)) score = 80;
      else if (title.startsWith(query) || productName.startsWith(query)) score = 70;
      // Contains query gets medium score
      else if (serialNumber.includes(query) || modelNumber.includes(query)) score = 50;
      else if (title.includes(query) || productName.includes(query)) score = 40;
      else if (manufacturerName.includes(query)) score = 30;
      
      return { material, score };
    }).filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    const filtered = scoredMaterials.map(item => item.material);
    
    // If we have a high-scoring match (80+), treat it as exact match
    if (scoredMaterials.length > 0 && scoredMaterials[0].score >= 80) {
      setExactMatch(scoredMaterials[0].material);
      setOtherResults(filtered.slice(1, 21)); // Get up to 20 other results
      setMaterials(filtered.slice(0, 21)); // Include exact match + others
    } else {
      setExactMatch(null);
      setOtherResults([]);
      setMaterials(filtered.slice(0, 20)); // Show up to 20 search results
    }
  }, [activeSearchQuery, allMaterials]);

  async function handleImageCapture(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        setCapturedImage(base64Image);
        setShowDialog(true);
        setIsAnalyzing(true);
        setIdentification(null);
        setMatchedProducts([]);

        try {
          // Call edge function to identify material
          const { data, error } = await supabase.functions.invoke('identify-material', {
            body: { image: base64Image }
          });

          if (error) throw error;

          console.log("Identification result:", data);
          setIdentification(data);

          // Find matching products based on identification
          const matches = await findMatchingProducts(data);
          setMatchedProducts(matches);

          toast({
            title: "Material Identified",
            description: `Found ${matches.length} matching products`,
          });
        } catch (error) {
          console.error("Error identifying material:", error);
          toast({
            title: "Analysis Failed",
            description: "Could not identify the material. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error capturing image:", error);
      toast({
        title: "Capture Failed",
        description: "Could not capture image. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function findMatchingProducts(identification: any) {
    if (!identification || !identification.category) return [];

    try {
      // Fetch matching products from database
      const { data, error } = await supabase
        .from('materials')
        .select(`
          *,
          manufacturer:manufacturers(name, logo_url)
        `)
        .eq('category', identification.category)
        .order('purchase_count', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Filter products based on search terms and type
      const searchTerms = [
        identification.type?.toLowerCase(),
        identification.manufacturer?.toLowerCase(),
        ...(identification.searchTerms || []).map((term: string) => term.toLowerCase())
      ].filter(Boolean);

      const matches = (data || []).filter(material => {
        const productText = `${material.manufacturer?.name} ${material.title} ${material.product_name}`.toLowerCase();
        return searchTerms.some(term => productText.includes(term));
      });

      // Return top 5 matches
      return matches.slice(0, 5).map(material => ({
        company: material.manufacturer?.name || 'Unknown',
        logo: material.manufacturer?.logo_url || '',
        title: material.title,
        product: material.product_name,
        rating: material.rating,
        image: material.image_url || '',
        dataSheet: material.datasheet_url
      }));
    } catch (error) {
      console.error('Error finding matching products:', error);
      return [];
    }
  }

  // Handle search input with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setActiveSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
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
          <h1 className="text-4xl font-bold text-foreground mb-8">Material Search</h1>
          <div className="w-full max-w-2xl">
            <SearchBar
              placeholder="Material Description, Serial Number, Model Number etc."
              value={searchQuery}
              onChange={handleSearchChange}
              onCameraClick={() => fileInputRef.current?.click()}
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
              onCameraClick={() => fileInputRef.current?.click()}
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
                    onContactClick={() => handleContactClick(material.manufacturer_id, material.manufacturer?.name || 'Unknown')}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Camera FAB */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageCapture}
      />
      <MaterialIdentificationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        isAnalyzing={isAnalyzing}
        capturedImage={capturedImage}
        identification={identification}
        matchedProducts={matchedProducts}
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
