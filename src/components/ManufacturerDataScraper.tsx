import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const MANUFACTURER_URLS = [
  "https://affinitysteel.com/",
  "https://basicenergyservices.com/",
  "https://www.blackmountainsand.com/",
  "https://buffalooilfieldsupply.com/",
  "https://candbwellservice.com/",
  "https://cimarronoilandgas.com/",
  "https://coastalmudsupply.com/",
  "https://ctsari.com/",
  "https://www.distributionnow.com/",
  "https://edgeindustries-usa.com/",
  "https://www.forumenergytechnologies.com/",
  "https://frontiersand.com/",
  "https://www.halliburton.com/",
  "https://www.hicrush.com/",
  "https://www.libertyoilfieldservices.com/",
  "https://mesquiteoiltools.com/",
  "https://www.nov.com/",
  "https://odessaseparatorinc.com/",
  "https://www.pattersonuti.com/",
  "https://permp.com/",
  "https://proppantsolutions.com/",
  "https://rockera.com/",
  "https://www.slb.com/",
  "https://www.smartsand.com/",
  "https://spraberry.com/",
  "https://www.superiorenergy.com/",
  "https://tdmaterials.com/",
  "https://www.tenaris.com/",
  "https://tpcgrp.com/",
  "https://www.tuskpermian.com/",
  "https://www.ussilica.com/",
  "https://www.vallourec.com/",
  "https://www.weatherford.com/",
  "https://wtc-inc.com/",
  "https://www.xtoenergy.com/",
  "https://www.anteromidstream.com/",
  "https://www.archrock.com/",
  "https://www.bakerhughes.com/",
  "https://bopproducts.com/",
  "https://chaseenergyservices.com/",
  "https://dragonproducts.com/",
  "https://energyswell.com/",
  "https://flowcoproductions.com/",
  "https://www.kimray.com/",
  "https://lariogroup.com/",
  "https://mammothenergyinc.com/",
  "https://www.nxtenergysolutions.com/",
  "https://www.oilstates.com/",
  "https://www.rpcinc.com/",
  "https://www.uswellservices.com/",
];

export const ManufacturerDataScraper = () => {
  const [isScraing, setIsScraping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const scrapeManufacturers = async () => {
    setIsScraping(true);
    setProgress(0);
    setResults(null);

    try {
      // Process in batches of 5 to avoid overwhelming the system
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < MANUFACTURER_URLS.length; i += batchSize) {
        batches.push(MANUFACTURER_URLS.slice(i, i + batchSize));
      }

      let allResults: any[] = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        
        console.log(`Processing batch ${i + 1}/${batches.length}...`);
        
        const { data, error } = await supabase.functions.invoke('scrape-manufacturer-data', {
          body: {
            manufacturerUrls: batch,
            materialCategory: 'valves pumps equipment'
          }
        });

        if (error) {
          console.error('Error scraping batch:', error);
          toast({
            title: "Batch Error",
            description: `Error processing batch ${i + 1}: ${error.message}`,
            variant: "destructive",
          });
        } else if (data) {
          allResults = [...allResults, ...data.results];
          console.log(`Batch ${i + 1} completed:`, data);
        }

        setProgress(((i + 1) / batches.length) * 100);
        
        // Add a small delay between batches
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      setResults({
        totalProcessed: MANUFACTURER_URLS.length,
        productsFound: allResults.length,
        results: allResults,
      });

      toast({
        title: "Scraping Complete",
        description: `Processed ${MANUFACTURER_URLS.length} manufacturers, found ${allResults.length} products`,
      });

    } catch (error) {
      console.error('Error scraping manufacturers:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to scrape manufacturers",
        variant: "destructive",
      });
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Manufacturer Data Scraper</h2>
        <p className="text-muted-foreground">
          This tool will scrape product information and images from {MANUFACTURER_URLS.length} manufacturer websites
          and update the materials database.
        </p>
        
        <Button 
          onClick={scrapeManufacturers} 
          disabled={isScraing}
          className="w-full"
        >
          {isScraing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping Manufacturers...
            </>
          ) : (
            `Scrape ${MANUFACTURER_URLS.length} Manufacturers`
          )}
        </Button>

        {isScraing && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              {Math.round(progress)}% complete
            </p>
          </div>
        )}

        {results && (
          <div className="bg-card rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">Results</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Manufacturers Processed</p>
                <p className="text-2xl font-bold">{results.totalProcessed}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Products Found</p>
                <p className="text-2xl font-bold">{results.productsFound}</p>
              </div>
            </div>
            
            {results.results && results.results.length > 0 && (
              <div className="mt-4 max-h-96 overflow-y-auto">
                <h4 className="font-medium mb-2">Detailed Results</h4>
                <div className="space-y-2">
                  {results.results.map((result: any, index: number) => (
                    <div key={index} className="text-sm p-2 bg-muted rounded">
                      <p className="font-medium">{result.manufacturer} - {result.product}</p>
                      <p className={result.success ? "text-green-600" : "text-red-600"}>
                        {result.success ? "✓ Success" : `✗ ${result.error}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
