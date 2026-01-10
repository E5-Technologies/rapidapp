import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ExternalLink, Phone, Mail, Camera, Upload, X, CheckCircle2, Image } from "lucide-react";
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
  const [matchedSuppliers, setMatchedSuppliers] = useState<EquipmentSupplier[]>([]);
  const [scrapedImages, setScrapedImages] = useState<string[]>([]);
  const [catalogUrl, setCatalogUrl] = useState<string | null>(null);

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
      setMatchedSuppliers([]);
      setScrapedImages([]);
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
    setMatchedSuppliers([]);
    setScrapedImages([]);
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
      setMatchedSuppliers(result.matchedSuppliers || []);
      setScrapedImages(result.scrapedImages || []);
      setCatalogUrl(result.catalogUrl || null);
      
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
    setScrapedImages([]);
    setCatalogUrl(null);
  };

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
                Data Sheet
              </a>
            </Button>
          )}
          {supplier.phone && (
            <Button size="sm" variant="outline" asChild>
              <a href={`tel:${supplier.phone}`}>
                <Phone className="w-4 h-4 mr-1" />
                {supplier.phone}
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
                    Take a picture of industrial equipment and our AI will identify it and find matching suppliers.
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
                  {identification?.productImage ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-muted-foreground">Matched Product</p>
                        {identification.imageMatchConfidence && identification.imageMatchConfidence > 60 && (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                      <img 
                        src={identification.productImage} 
                        alt="Matched product" 
                        className="w-full h-36 object-cover rounded-lg border-2 border-green-500"
                      />
                      {identification.imageMatchConfidence && (
                        <p className="text-xs text-muted-foreground text-center">
                          {identification.imageMatchConfidence}% visual match
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Catalog Match</p>
                      <div className="w-full h-36 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                        {isAnalyzing ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Searching catalogs...</p>
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
                  <p className="text-sm text-muted-foreground">Searching manufacturer catalogs for matching products</p>
                </div>
              </div>
            )}

            {/* Identification Results */}
            {identification && !isAnalyzing && (
              <>
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Identification Result</CardTitle>
                      <Badge variant={identification.confidence > 70 ? "default" : "secondary"}>
                        {identification.confidence}% match
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
                      {identification.size && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Size/Specs</span>
                          <p className="font-medium">{identification.size}</p>
                        </div>
                      )}
                      {identification.modelNumber && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Model</span>
                          <p className="font-medium">{identification.modelNumber}</p>
                        </div>
                      )}
                    </div>

                    {identification.matchDetails && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">{identification.matchDetails}</p>
                      </div>
                    )}

                    {identification.description && (
                      <div>
                        <span className="text-muted-foreground text-sm">Description</span>
                        <p className="text-sm mt-1">{identification.description}</p>
                      </div>
                    )}

                    {identification.features && identification.features.length > 0 && (
                      <div>
                        <span className="text-muted-foreground text-sm">Features</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {identification.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{feature}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {catalogUrl && (
                      <a 
                        href={catalogUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Manufacturer Catalog
                      </a>
                    )}
                  </CardContent>
                </Card>

                {/* Scraped Product Images */}
                {scrapedImages.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Similar Products from Catalog</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {scrapedImages.slice(0, 5).map((img, idx) => (
                        <img 
                          key={idx}
                          src={img} 
                          alt={`Catalog product ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border hover:border-primary cursor-pointer transition-colors"
                          onClick={() => window.open(img, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Suppliers */}
                {matchedSuppliers.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Matching Suppliers ({matchedSuppliers.length})</h3>
                    {matchedSuppliers.map(supplier => (
                      <SupplierCard key={supplier.id} supplier={supplier} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No matching suppliers found in the database.</p>
                  </div>
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentIdentifierDialog;
