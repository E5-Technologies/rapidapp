import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Image, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IdentificationResult {
  category: string;
  type: string;
  manufacturer: string;
  material?: string;
  confidence: number;
  features: string[];
  searchTerms: string[];
  productImage?: string;
  imageMatchConfidence?: number;
  matchDetails?: string;
  modelNumber?: string;
}

interface MatchedProduct {
  company: string;
  logo: string;
  title: string;
  product: string;
  rating: number;
  image: string;
  dataSheet?: string;
  catalog_url?: string;
}

interface MaterialIdentificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAnalyzing: boolean;
  capturedImage: string | null;
  identification: IdentificationResult | null;
  matchedProducts: MatchedProduct[];
  scrapedImages?: string[];
  catalogUrl?: string;
}

const MaterialIdentificationDialog = ({
  open,
  onOpenChange,
  isAnalyzing,
  capturedImage,
  identification,
  matchedProducts,
  scrapedImages = [],
  catalogUrl,
}: MaterialIdentificationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Material Identification</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* Captured vs Matched Image Comparison */}
            {capturedImage && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Image Comparison</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Your Photo</p>
                    <img 
                      src={capturedImage} 
                      alt="Captured material" 
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
                      <p className="text-xs text-muted-foreground">Searching Catalog...</p>
                      <div className="w-full h-36 bg-muted rounded-lg flex items-center justify-center">
                        {isAnalyzing ? (
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
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
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <div className="text-center space-y-1">
                  <p className="font-medium">Analyzing Image...</p>
                  <p className="text-sm text-muted-foreground">
                    Searching manufacturer catalogs for matching products
                  </p>
                </div>
              </div>
            )}

            {/* Identification Results */}
            {identification && !isAnalyzing && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Identified Equipment</h3>
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
                    {identification.manufacturer && identification.manufacturer !== "Unknown" && (
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
                    {identification.modelNumber && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Model:</span>
                        <p className="font-medium">{identification.modelNumber}</p>
                      </div>
                    )}
                  </div>

                  {identification.matchDetails && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">{identification.matchDetails}</p>
                    </div>
                  )}

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
                </div>

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
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border hover:border-primary cursor-pointer transition-colors"
                          onClick={() => window.open(img, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Products */}
                {matchedProducts.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Matching Suppliers</h3>
                    <div className="space-y-3">
                      {matchedProducts.map((product, idx) => (
                        <div key={idx} className="bg-card border rounded-lg p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            {product.logo && (
                              <img 
                                src={product.logo} 
                                alt={product.company} 
                                className="w-8 h-8 object-contain"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                              />
                            )}
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
                            {(product.image || identification?.productImage) && (
                              <img 
                                src={product.image || identification?.productImage} 
                                alt={product.product} 
                                className="w-20 h-20 object-cover rounded"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                              />
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button className="flex-1" size="sm">
                              Order
                            </Button>
                            {(product.dataSheet || product.catalog_url) && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex-1"
                                asChild
                              >
                                <a 
                                  href={product.dataSheet || product.catalog_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1"
                                >
                                  {product.dataSheet ? 'Data Sheet' : 'Catalog'}
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
                    No matching suppliers found in the catalog.
                    {catalogUrl && (
                      <p className="text-xs mt-1">
                        Try viewing the <a href={catalogUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">manufacturer catalog</a> directly.
                      </p>
                    )}
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
