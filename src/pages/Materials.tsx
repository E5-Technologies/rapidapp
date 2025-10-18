import { Camera } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import CategoryScroll from "@/components/CategoryScroll";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import MaterialIdentificationDialog from "@/components/MaterialIdentificationDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Material {
  id: string;
  manufacturer_id: string;
  category: string;
  title: string;
  product_name: string;
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
  const [selectedCategory, setSelectedCategory] = useState("Valves");
  const [showDialog, setShowDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [identification, setIdentification] = useState<any>(null);
  const [matchedProducts, setMatchedProducts] = useState<any[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
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
          .eq('category', selectedCategory)
          .order('purchase_count', { ascending: false })
          .limit(50);

        if (error) throw error;
        
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
  }, [selectedCategory, toast]);

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
        
        <SearchBar placeholder="What material are you looking for?" />
        <CategoryScroll 
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </div>

      {/* Product List */}
      <div className="px-4 space-y-8 mt-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading materials...</div>
        ) : materials.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No materials found in this category.</div>
        ) : (
          // Group materials by manufacturer
          Object.entries(
            materials.reduce((acc, material) => {
              const manufacturerName = material.manufacturer?.name || 'Unknown';
              if (!acc[manufacturerName]) {
                acc[manufacturerName] = [];
              }
              acc[manufacturerName].push(material);
              return acc;
            }, {} as Record<string, Material[]>)
          ).map(([manufacturerName, manufacturerMaterials]) => (
            <div key={manufacturerName} className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground sticky top-[180px] bg-background py-2 z-[5]">
                {manufacturerName}
              </h2>
              <div className="space-y-4">
                {manufacturerMaterials.map((material) => (
                  <ProductCard
                    key={material.id}
                    company={material.manufacturer?.name || 'Unknown'}
                    logo={material.manufacturer?.logo_url || ''}
                    title={material.title}
                    product={material.product_name}
                    rating={material.rating}
                    image={material.image_url || ''}
                    dataSheet={material.datasheet_url}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Camera FAB */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageCapture}
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="fixed bottom-28 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg z-40 hover:bg-primary/90 transition-colors"
      >
        <Camera className="w-6 h-6" />
      </button>

      <MaterialIdentificationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        isAnalyzing={isAnalyzing}
        capturedImage={capturedImage}
        identification={identification}
        matchedProducts={matchedProducts}
      />

      <BottomNav />
    </div>
  );
};

export default Materials;
