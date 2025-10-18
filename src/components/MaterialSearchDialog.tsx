import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, Phone, Mail, Globe, FileText, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SalesContact {
  region: string;
  phone: string | null;
  email: string | null;
  website: string | null;
}

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

interface MaterialSearchResult {
  manufacturer: string;
  productName: string;
  modelNumber: string;
  imageUrl: string | null;
  datasheetUrl: string | null;
  specifications: string[];
  description: string;
  salesContact: SalesContact;
  searchResults?: SearchResult[];
}

interface MaterialSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSearching: boolean;
  searchResult: MaterialSearchResult | null;
}

const MaterialSearchDialog = ({ 
  open, 
  onOpenChange, 
  isSearching, 
  searchResult 
}: MaterialSearchDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isSearching ? "Searching..." : "Material Information"}
          </DialogTitle>
        </DialogHeader>

        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Searching the web for material information...</p>
          </div>
        ) : searchResult ? (
          <div className="space-y-6">
            {/* Material Header */}
            <div className="space-y-2">
              <div className="flex items-start gap-4">
                {searchResult.imageUrl && (
                  <img 
                    src={searchResult.imageUrl} 
                    alt={searchResult.productName}
                    className="w-24 h-24 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{searchResult.productName}</h3>
                  <p className="text-sm text-muted-foreground">{searchResult.manufacturer}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{searchResult.modelNumber}</span>
                  </div>
                </div>
              </div>
              {searchResult.description && (
                <p className="text-sm text-muted-foreground mt-2">{searchResult.description}</p>
              )}
            </div>

            <Separator />

            {/* Specifications */}
            {searchResult.specifications && searchResult.specifications.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Key Specifications
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {searchResult.specifications.map((spec, index) => (
                    <li key={index}>{spec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Data Sheet */}
            {searchResult.datasheetUrl && (
              <div>
                <Button asChild variant="outline" className="w-full">
                  <a 
                    href={searchResult.datasheetUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Data Sheet
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </a>
                </Button>
              </div>
            )}

            <Separator />

            {/* Sales Contact */}
            <div>
              <h4 className="font-semibold mb-3">Sales Contact ({searchResult.salesContact.region})</h4>
              <div className="space-y-2">
                {searchResult.salesContact.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-primary" />
                    <a 
                      href={`tel:${searchResult.salesContact.phone}`}
                      className="text-primary hover:underline"
                    >
                      {searchResult.salesContact.phone}
                    </a>
                  </div>
                )}
                {searchResult.salesContact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-primary" />
                    <a 
                      href={`mailto:${searchResult.salesContact.email}`}
                      className="text-primary hover:underline"
                    >
                      {searchResult.salesContact.email}
                    </a>
                  </div>
                )}
                {searchResult.salesContact.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-primary" />
                    <a 
                      href={searchResult.salesContact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      Visit Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {!searchResult.salesContact.phone && !searchResult.salesContact.email && !searchResult.salesContact.website && (
                  <p className="text-sm text-muted-foreground">Contact information not found. Please visit the manufacturer's website.</p>
                )}
              </div>
            </div>

            {/* Search Results References */}
            {searchResult.searchResults && searchResult.searchResults.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Reference Links</h4>
                  <div className="space-y-2">
                    {searchResult.searchResults.map((result, index) => (
                      <a
                        key={index}
                        href={result.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 rounded border hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{result.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{result.snippet}</p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No results found. Try a different serial or model number.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MaterialSearchDialog;