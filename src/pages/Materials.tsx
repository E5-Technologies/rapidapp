import { Camera, Filter, Settings } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("all");
  const [manufacturers, setManufacturers] = useState<string[]>([]);
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
        
        // Extract unique manufacturers for filter
        const uniqueManufacturers = Array.from(
          new Set(data?.map(m => m.manufacturer?.name).filter(Boolean) || [])
        ).sort();
        setManufacturers(uniqueManufacturers as string[]);
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

  // Apply search filter
  useEffect(() => {
    if (!activeSearchQuery.trim()) {
      setMaterials(allMaterials);
      return;
    }

    const query = activeSearchQuery.toLowerCase().trim();
    const filtered = allMaterials.filter(material => {
      const title = material.title?.toLowerCase() || "";
      const productName = material.product_name?.toLowerCase() || "";
      const serialNumber = material.serial_number?.toLowerCase() || "";
      const modelNumber = material.model_number?.toLowerCase() || "";
      const manufacturerName = material.manufacturer?.name?.toLowerCase() || "";

      return (
        title.includes(query) ||
        productName.includes(query) ||
        serialNumber.includes(query) ||
        modelNumber.includes(query) ||
        manufacturerName.includes(query)
      );
    });

    setMaterials(filtered);
  }, [activeSearchQuery, allMaterials]);

  // Filter materials by manufacturer
  const filteredMaterials = selectedManufacturer === "all" 
    ? materials 
    : materials.filter(m => m.manufacturer?.name === selectedManufacturer);

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
      {/* Centered Search */}
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <h1 className="text-2xl font-semibold text-center mb-8">Search</h1>
        
        <div className="w-full max-w-md">
          <SearchBar
            placeholder="" 
            onChange={handleSearchChange}
            value={searchQuery}
            onCameraClick={() => fileInputRef.current?.click()}
          />
        </div>
        
        {/* Manufacturer Filter - Show when searching */}
        {(activeSearchQuery || filteredMaterials.length > 0) && (
          <div className="mt-4 flex items-center justify-center">
            <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
              <SelectTrigger className="w-8 h-8 border-none bg-muted/50 hover:bg-muted p-0">
                <Filter className="w-4 h-4 mx-auto" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50 text-xs">
                <SelectItem value="all" className="text-xs">All Manufacturers</SelectItem>
                {manufacturers.map((manufacturer) => (
                  <SelectItem key={manufacturer} value={manufacturer} className="text-xs">
                    {manufacturer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Product List - Only show when there's a search query or active filters */}
      {(activeSearchQuery || selectedManufacturer !== "all") && (
        <div className="px-4 space-y-8 mt-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading materials...</div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {activeSearchQuery ? `No materials found for "${activeSearchQuery}"` : "No materials found."}
            </div>
          ) : (
            // Materials ranked by popularity (purchase_count)
            filteredMaterials.map((material) => (
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
            ))
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
