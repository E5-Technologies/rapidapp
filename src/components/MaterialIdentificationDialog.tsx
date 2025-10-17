import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IdentificationResult {
  category: string;
  type: string;
  manufacturer: string;
  material?: string;
  confidence: number;
  features: string[];
  searchTerms: string[];
}

interface MatchedProduct {
  company: string;
  logo: string;
  title: string;
  product: string;
  rating: number;
  image: string;
  dataSheet?: string;
}

interface MaterialIdentificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAnalyzing: boolean;
  capturedImage: string | null;
  identification: IdentificationResult | null;
  matchedProducts: MatchedProduct[];
}

const MaterialIdentificationDialog = ({
  open,
  onOpenChange,
  isAnalyzing,
  capturedImage,
  identification,
  matchedProducts,
}: MaterialIdentificationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Material Identification</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* Captured Image */}
            {capturedImage && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Captured Image</h3>
                <img 
                  src={capturedImage} 
                  alt="Captured material" 
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Analysis Status */}
            {isAnalyzing && (
              <div className="flex items-center justify-center py-8 space-x-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-muted-foreground">Analyzing image with AI...</p>
              </div>
            )}

            {/* Identification Results */}
            {identification && !isAnalyzing && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Identified Material</h3>
                    <Badge variant={identification.confidence > 70 ? "default" : "secondary"}>
                      {identification.confidence}% confidence
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <p className="font-medium">{identification.category}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium">{identification.type}</p>
                    </div>
                    {identification.manufacturer && identification.manufacturer !== "unknown" && (
                      <div>
                        <span className="text-muted-foreground">Manufacturer:</span>
                        <p className="font-medium">{identification.manufacturer}</p>
                      </div>
                    )}
                    {identification.material && (
                      <div>
                        <span className="text-muted-foreground">Material:</span>
                        <p className="font-medium">{identification.material}</p>
                      </div>
                    )}
                  </div>

                  {identification.features && identification.features.length > 0 && (
                    <div>
                      <span className="text-muted-foreground text-sm">Features:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {identification.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Matched Products */}
                {matchedProducts.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Matching Products</h3>
                    <div className="space-y-3">
                      {matchedProducts.map((product, idx) => (
                        <div key={idx} className="bg-card border rounded-lg p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <img 
                              src={product.logo} 
                              alt={product.company} 
                              className="w-8 h-8 object-contain"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{product.company}</h4>
                              <p className="text-xs text-muted-foreground">{product.title}</p>
                              <p className="text-sm font-medium mt-1">{product.product}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i} className={i < product.rating ? "text-yellow-500" : "text-muted"}>
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            <img 
                              src={product.image} 
                              alt={product.product} 
                              className="w-20 h-20 object-cover rounded"
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button className="flex-1" size="sm">
                              Order
                            </Button>
                            {product.dataSheet && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex-1"
                                asChild
                              >
                                <a 
                                  href={product.dataSheet} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1"
                                >
                                  Data Sheet
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {matchedProducts.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No matching products found in the catalog.
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialIdentificationDialog;
