import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ExternalLink, Phone, Mail, Camera, Upload, X, CheckCircle2, Image, FileText, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

interface MatchedMaterial {
  id: string;
  title: string;
  product_name: string;
  category: string;
  image_url: string | null;
  model_number?: string | null;
  serial_number?: string | null;
  rating: number;
  datasheet_url: string | null;
  manufacturer_id: string;
  manufacturer?: {
    id: string;
    name: string;
    logo_url: string | null;
  } | {
    id: string;
    name: string;
    logo_url: string | null;
  }[];
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
  productImage?: string;
  imageMatchConfidence?: number;
  matchDetails?: string;
  modelNumber?: string;
}

interface EquipmentIdentifierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialImage?: string | null;
}

const EquipmentIdentifierDialog = ({
  open,
  onOpenChange,
  initialImage,
}: EquipmentIdentifierDialogProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [identification, setIdentification] = useState<IdentificationResult | null>(null);
  const [matchedMaterial, setMatchedMaterial] = useState<MatchedMaterial | null>(null);
  const [similarMaterials, setSimilarMaterials] = useState<MatchedMaterial[]>([]);
  const [matchedSuppliers, setMatchedSuppliers] = useState<EquipmentSupplier[]>([]);
  const [catalogUrl, setCatalogUrl] = useState<string | null>(null);

  // Helper to get manufacturer name from material
  const getManufacturerName = (material: MatchedMaterial) => {
    if (Array.isArray(material.manufacturer)) {
      return material.manufacturer[0]?.name || 'Unknown';
    }
    return material.manufacturer?.name || 'Unknown';
  };

  const getManufacturerLogo = (material: MatchedMaterial) => {
    if (Array.isArray(material.manufacturer)) {
      return material.manufacturer[0]?.logo_url;
    }
    return material.manufacturer?.logo_url;
  };

  useEffect(() => {
    if (initialImage && open) {
      setCapturedImage(initialImage);
      analyzeImage(initialImage);
    }
  }, [initialImage, open]);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setCapturedImage(null);
      setIdentification(null);
      setMatchedMaterial(null);
      setSimilarMaterials([]);
      setMatchedSuppliers([]);
      setCatalogUrl(null);
      setIsAnalyzing(false);
    }
  }, [open]);

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
    setMatchedMaterial(null);
    setSimilarMaterials([]);
    setMatchedSuppliers([]);
    setCatalogUrl(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to use the equipment identifier");
        onOpenChange(false);
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
      setMatchedMaterial(result.matchedMaterial || null);
      setSimilarMaterials(result.similarMaterials || []);
      setMatchedSuppliers(result.matchedSuppliers || []);
      setCatalogUrl(result.catalogUrl || null);
      
      if (result.matchedMaterial) {
        toast.success(`Found: ${result.matchedMaterial.title}`);
      } else if (result.identification?.confidence > 70) {
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
    setMatchedMaterial(null);
    setSimilarMaterials([]);
    setMatchedSuppliers([]);
    setCatalogUrl(null);
  };

  const MaterialCard = ({ material, isExactMatch = false }: { material: MatchedMaterial; isExactMatch?: boolean }) => (
    <Card className={`overflow-hidden ${isExactMatch ? 'border-2 border-green-500 bg-green-50/50 dark:bg-green-950/20' : ''}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex gap-3">
          {material.image_url && (
            <img 
              src={material.image_url} 
              alt={material.title}
              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                {isExactMatch && (
                  <Badge variant="default" className="mb-1 bg-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Best Match
                  </Badge>
                )}
                <h3 className="font-semibold text-sm line-clamp-2">{material.title}</h3>
                <p className="text-xs text-muted-foreground">{getManufacturerName(material)}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-500">
                <Star className="w-3 h-3 fill-current" />
                {material.rating?.toFixed(1) || '4.0'}
              </div>
            </div>
            <Badge variant="secondary" className="mt-1 text-xs">{material.category}</Badge>
            {material.model_number && (
              <p className="text-xs text-muted-foreground mt-1">Model: {material.model_number}</p>
            )}
          </div>
        </div>
        
        {material.datasheet_url && (
          <Button size="sm" variant="outline" className="w-full" asChild>
            <a href={material.datasheet_url} target="_blank" rel="noopener noreferrer">
              <FileText className="w-4 h-4 mr-2" />
              View Data Sheet
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const SupplierCard = ({ supplier }: { supplier: EquipmentSupplier }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-base">{supplier.name}</h3>
            <Badge variant="secondary" className="mt-1">{supplier.category}</Badge>
            {supplier.contact_name && (
              <p className="text-sm text-muted-foreground mt-1">Contact: {supplier.contact_name}</p>
            )}
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
                Catalog
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Equipment Identifier</DialogTitle>
        </DialogHeader>
        
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <ScrollArea className="max-h-[75vh]">
          <div className="p-4 space-y-4">
            {/* Camera/Upload Buttons - Show when no image */}
            {!capturedImage && !isAnalyzing && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Capture Equipment Photo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Take a picture of industrial equipment and we'll find matching products in our database.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={handleCameraCapture} className="h-20 flex-col">
                      <Camera className="w-6 h-6 mb-1" />
                      Take Photo
                    </Button>
                    <Button onClick={handleGalleryUpload} variant="outline" className="h-20 flex-col">
                      <Upload className="w-6 h-6 mb-1" />
                      Upload
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Image Comparison */}
            {capturedImage && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Image Comparison</h3>
                  {!isAnalyzing && (
                    <Button variant="ghost" size="sm" onClick={clearIdentification}>
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Your Photo</p>
                    <img 
                      src={capturedImage} 
                      alt="Captured equipment" 
                      className="w-full h-36 object-cover rounded-lg border-2 border-primary"
                    />
                  </div>
                  {matchedMaterial?.image_url ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-muted-foreground">Database Match</p>
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      </div>
                      <img 
                        src={matchedMaterial.image_url} 
                        alt="Matched product" 
                        className="w-full h-36 object-cover rounded-lg border-2 border-green-500"
                      />
                      {identification?.imageMatchConfidence && (
                        <p className="text-xs text-green-600 text-center font-medium">
                          {identification.imageMatchConfidence}% visual match
                        </p>
                      )}
                    </div>
                  ) : identification?.productImage ? (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Matched Product</p>
                      <img 
                        src={identification.productImage} 
                        alt="Matched product" 
                        className="w-full h-36 object-cover rounded-lg border-2 border-green-500"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Database Match</p>
                      <div className="w-full h-36 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                        {isAnalyzing ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Searching database...</p>
                          </div>
                        ) : (
                          <Image className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analysis Status */}
            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-6 space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <div className="text-center">
                  <p className="font-medium">Analyzing Equipment...</p>
                  <p className="text-sm text-muted-foreground">Comparing against {'>'}12,000 products in our database</p>
                </div>
              </div>
            )}

            {/* Results */}
            {!isAnalyzing && (identification || matchedMaterial) && (
              <>
                {/* Matched Material from Database */}
                {matchedMaterial && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      We Found Your Equipment!
                    </h3>
                    <MaterialCard material={matchedMaterial} isExactMatch />
                  </div>
                )}

                {/* Identification Details (when no exact match) */}
                {!matchedMaterial && identification && (
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Identification Result</CardTitle>
                        <Badge variant={identification.confidence > 70 ? "default" : "secondary"}>
                          {identification.confidence}% confidence
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
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
                      </div>

                      {identification.description && (
                        <p className="text-sm text-muted-foreground">{identification.description}</p>
                      )}

                      {identification.features && identification.features.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {identification.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{feature}</Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Similar Materials */}
                {similarMaterials.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">
                      {matchedMaterial ? 'Similar Products' : 'Related Products'} ({similarMaterials.length})
                    </h3>
                    {similarMaterials.slice(0, 5).map(material => (
                      <MaterialCard key={material.id} material={material} />
                    ))}
                  </div>
                )}

                {/* Matched Suppliers */}
                {matchedSuppliers.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Suppliers ({matchedSuppliers.length})</h3>
                    {matchedSuppliers.map(supplier => (
                      <SupplierCard key={supplier.id} supplier={supplier} />
                    ))}
                  </div>
                )}

                {/* Catalog Link */}
                {catalogUrl && (
                  <a 
                    href={catalogUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Manufacturer Catalog
                  </a>
                )}

                {/* Try Again Button */}
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentIdentifierDialog;
