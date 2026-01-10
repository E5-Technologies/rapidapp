import { useState, useRef } from "react";
import { Camera, Upload, Search, ArrowLeft, ExternalLink, Phone, Mail, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

interface EquipmentSupplier {
  id: string;
  name: string;
  category: string;
  catalog_url: string | null;
  phone: string | null;
  email: string | null;
  contact_name: string | null;
  description: string | null;
}

interface IdentificationResult {
  category: string;
  type: string;
  manufacturer: string;
  material?: string;
  size?: string;
  confidence: number;
  features: string[];
  description?: string;
  searchTerms: string[];
}

const EquipmentFinder = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [identification, setIdentification] = useState<IdentificationResult | null>(null);
  const [matchedSuppliers, setMatchedSuppliers] = useState<EquipmentSupplier[]>([]);

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["equipment-suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment_suppliers")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as EquipmentSupplier[];
    },
  });

  const categories = [...new Set(suppliers.map(s => s.category))].sort();

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = !searchQuery || 
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || supplier.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setCapturedImage(base64);
        analyzeImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  };

  const handleGalleryUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  };

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    setIdentification(null);
    setMatchedSuppliers([]);
    setActiveTab("identify");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to use the equipment identifier");
        navigate("/auth");
        return;
      }

      const response = await supabase.functions.invoke("identify-material", {
        body: { image: imageData },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      setIdentification(result.identification);
      setMatchedSuppliers(result.matchedSuppliers || []);
      
      if (result.identification?.confidence > 70) {
        toast.success(`Identified: ${result.identification.type}`);
      } else {
        toast.info("Equipment identified with low confidence");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearIdentification = () => {
    setCapturedImage(null);
    setIdentification(null);
    setMatchedSuppliers([]);
  };

  const SupplierCard = ({ supplier }: { supplier: EquipmentSupplier }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-base">{supplier.name}</h3>
            <Badge variant="secondary" className="mt-1">{supplier.category}</Badge>
          </div>
        </div>
        
        {supplier.description && (
          <p className="text-sm text-muted-foreground">{supplier.description}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {supplier.catalog_url && (
            <Button size="sm" variant="default" asChild>
              <a href={supplier.catalog_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                View Catalog
              </a>
            </Button>
          )}
          {supplier.phone && (
            <Button size="sm" variant="outline" asChild>
              <a href={`tel:${supplier.phone}`}>
                <Phone className="w-4 h-4 mr-1" />
                Call
              </a>
            </Button>
          )}
          {supplier.email && (
            <Button size="sm" variant="outline" asChild>
              <a href={`mailto:${supplier.email}`}>
                <Mail className="w-4 h-4 mr-1" />
                Email
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Equipment Finder</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Suppliers</TabsTrigger>
            <TabsTrigger value="identify">Identify Equipment</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 pt-4">
        {/* Browse Tab */}
        <TabsContent value="browse" className="mt-0 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              <Button
                size="sm"
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  size="sm"
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* Supplier List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {filteredSuppliers.length} suppliers found
              </p>
              {filteredSuppliers.map(supplier => (
                <SupplierCard key={supplier.id} supplier={supplier} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Identify Tab */}
        <TabsContent value="identify" className="mt-0 space-y-4">
          {/* Camera/Upload Buttons */}
          {!capturedImage && !isAnalyzing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Take a Photo of Equipment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Take a picture of any industrial equipment in the field and our AI will identify it and find matching suppliers.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleCameraCapture} className="h-24 flex-col">
                    <Camera className="w-8 h-8 mb-2" />
                    Take Photo
                  </Button>
                  <Button onClick={handleGalleryUpload} variant="outline" className="h-24 flex-col">
                    <Upload className="w-8 h-8 mb-2" />
                    Upload Image
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Captured Image */}
          {capturedImage && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Captured Image</h3>
                  <Button variant="ghost" size="icon" onClick={clearIdentification}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <img 
                  src={capturedImage} 
                  alt="Captured equipment" 
                  className="w-full h-48 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Analysis Status */}
          {isAnalyzing && (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Analyzing equipment with AI...</p>
              </CardContent>
            </Card>
          )}

          {/* Identification Results */}
          {identification && !isAnalyzing && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Identification Result</CardTitle>
                    <Badge variant={identification.confidence > 70 ? "default" : "secondary"}>
                      {identification.confidence}% confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Category</span>
                      <p className="font-medium">{identification.category}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type</span>
                      <p className="font-medium">{identification.type}</p>
                    </div>
                    {identification.manufacturer && identification.manufacturer !== "Unknown" && (
                      <div>
                        <span className="text-muted-foreground">Manufacturer</span>
                        <p className="font-medium">{identification.manufacturer}</p>
                      </div>
                    )}
                    {identification.material && (
                      <div>
                        <span className="text-muted-foreground">Material</span>
                        <p className="font-medium">{identification.material}</p>
                      </div>
                    )}
                    {identification.size && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Size/Specs</span>
                        <p className="font-medium">{identification.size}</p>
                      </div>
                    )}
                  </div>

                  {identification.description && (
                    <div>
                      <span className="text-muted-foreground text-sm">Description</span>
                      <p className="text-sm mt-1">{identification.description}</p>
                    </div>
                  )}

                  {identification.features && identification.features.length > 0 && (
                    <div>
                      <span className="text-muted-foreground text-sm">Features</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {identification.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline">{feature}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Matched Suppliers */}
              {matchedSuppliers.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-semibold">Matching Suppliers ({matchedSuppliers.length})</h3>
                  {matchedSuppliers.map(supplier => (
                    <SupplierCard key={supplier.id} supplier={supplier} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <p>No matching suppliers found in the database.</p>
                    <Button 
                      variant="link" 
                      onClick={() => {
                        setActiveTab("browse");
                        setSelectedCategory(identification.category);
                      }}
                    >
                      Browse {identification.category} suppliers
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* New Identification Button */}
              <Button 
                onClick={clearIdentification} 
                variant="outline" 
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                Identify Another Equipment
              </Button>
            </>
          )}
        </TabsContent>
      </Tabs>

      <BottomNav />
    </div>
  );
};

export default EquipmentFinder;
