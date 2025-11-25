import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Top 50 Valve Manufacturers
const VALVE_MANUFACTURERS = [
  "https://www.emerson.com/en-us",
  "https://www.flowserve.com",
  "https://www.ksb.com",
  "https://www.slb.com/cameron",
  "https://www.craneco.com",
  "https://www.imiplc.com",
  "https://www.velan.com",
  "https://www.neles.com",
  "https://www.circor.com",
  "https://www.ascocontrols.com",
  "https://www.swagelok.com",
  "https://www.tyco.com",
  "https://www.curtisswright.com",
  "https://www.averydennison.com",
  "https://www.bray.com",
  "https://www.dezurik.com",
  "https://www.tycoflow.com",
  "https://www.fujikin.com",
  "https://www.habonim.com",
  "https://www.kitz.co.jp",
  "https://www.okano-valve.co.jp",
  "https://www.samsoncontrols.com",
  "https://www.spiraxsarco.com",
  "https://www.triaircorp.com",
  "https://www.valvitalia.com",
  "https://www.watts.com",
  "https://www.weir.com",
  "https://www.worcester.com",
  "https://www.apollo-valves.com",
  "https://www.burkert.com",
  "https://www.danfoss.com",
  "https://www.dresser.com",
  "https://www.fivalco.it",
  "https://www.gemu-group.com",
  "https://www.gnvalve.com",
  "https://www.hoke.com",
  "https://www.jordan-valve.com",
  "https://www.keystone-valves.com",
  "https://www.masoneilan.com",
  "https://www.mogas.com",
  "https://www.nibco.com",
  "https://www.nordstromvalves.com",
  "https://www.rotork.com",
  "https://www.schubert-salzer.com",
  "https://www.seg-america.com",
  "https://www.skf.com",
  "https://www.triaircorp.com",
  "https://www.valcor.com",
  "https://www.valtorc.com",
  "https://www.xomox.com",
];

// Top 50 Pump Manufacturers
const PUMP_MANUFACTURERS = [
  "https://www.xylem.com",
  "https://www.grundfos.com",
  "https://www.sulzer.com",
  "https://www.flowserve.com",
  "https://www.ksb.com",
  "https://www.gouldspumps.com",
  "https://www.pentair.com",
  "https://www.ebara.com",
  "https://www.wilo.com",
  "https://www.ruhrpumpen.com",
  "https://www.tsurumi.com",
  "https://www.bakerhughes.com",
  "https://www.weir.com",
  "https://www.metso.com",
  "https://www.idexcorp.com",
  "https://www.armstrong-intl.com",
  "https://www.blackmer.com",
  "https://www.caprari.com",
  "https://www.carverump.com",
  "https://www.cat-pumps.com",
  "https://www.deming.com",
  "https://www.flowrox.com",
  "https://www.gorman-rupp.com",
  "https://www.hydromatic.com",
  "https://www.iwakipumps.com",
  "https://www.kirloskar.com",
  "https://www.liberty-pumps.com",
  "https://www.milton-roy.com",
  "https://www.pulsafeeder.com",
  "https://www.roper.com",
  "https://www.seepex.com",
  "https://www.shurflo.com",
  "https://www.spxflow.com",
  "https://www.sterling-sihi.com",
  "https://www.sundyne.com",
  "https://www.tuthill.com",
  "https://www.viking-pump.com",
  "https://www.warrenrupp.com",
  "https://www.watson-marlow.com",
  "https://www.weinman.com",
  "https://www.wilden.com",
  "https://www.zoeller.com",
  "https://www.allweiler.com",
  "https://www.calpeda.com",
  "https://www.dab-pumps.com",
  "https://www.grunbeck.com",
  "https://www.hayward.com",
  "https://www.hermetic-pumpen.com",
  "https://www.pedrollo.com",
  "https://www.wanner.com",
];

// Top 50 Piping Manufacturers
const PIPING_MANUFACTURERS = [
  "https://www.victaulic.com",
  "https://www.tenaris.com",
  "https://www.vallourec.com",
  "https://www.nov.com",
  "https://www.tpco.com",
  "https://www.tmk-group.com",
  "https://www.usssteel.com",
  "https://www.arcelormittal.com",
  "https://www.nucor.com",
  "https://www.nipponsteelpipe.com",
  "https://www.jfe-holdings.com",
  "https://www.severstal.com",
  "https://www.evraz.com",
  "https://www.mmk.ru",
  "https://www.sandvik.com",
  "https://www.georg-fischer.com",
  "https://www.charlotte-pipe.com",
  "https://www.jm-eagle.com",
  "https://www.aliaxis.com",
  "https://www.wavin.com",
  "https://www.uponor.com",
  "https://www.pipelife.com",
  "https://www.geberit.com",
  "https://www.rehau.com",
  "https://www.tigre.com",
  "https://www.astral.com",
  "https://www.supreme.in",
  "https://www.finolex.com",
  "https://www.prince-pipes.com",
  "https://www.polyplastics.in",
  "https://www.anvil-intl.com",
  "https://www.bonney-forge.com",
  "https://www.butech.com",
  "https://www.champion-piping.com",
  "https://www.core-pipe.com",
  "https://www.fitting.com",
  "https://www.hackney-ladish.com",
  "https://www.hillfoot.com",
  "https://www.jain-irrigation.com",
  "https://www.kennametal.com",
  "https://www.megabond.com",
  "https://www.mexichem.com",
  "https://www.norma-group.com",
  "https://www.parakar.com",
  "https://www.ratnamani.com",
  "https://www.sumitomo-steel.com",
  "https://www.taisei-kogyo.com",
  "https://www.tubeturns.com",
  "https://www.unimech.com",
  "https://www.vikinggroup.net",
];

// Top 50 Instrumentation Manufacturers
const INSTRUMENTATION_MANUFACTURERS = [
  "https://www.emerson.com",
  "https://www.honeywellprocess.com",
  "https://www.abb.com",
  "https://www.siemens.com",
  "https://www.rockwellautomation.com",
  "https://www.schneider-electric.com",
  "https://www.yokogawa.com",
  "https://www.endress.com",
  "https://www.krohne.com",
  "https://www.vega.com",
  "https://www.fluke.com",
  "https://www.tektronix.com",
  "https://www.keysight.com",
  "https://www.omega.com",
  "https://www.parker.com",
  "https://www.swagelok.com",
  "https://www.wika.com",
  "https://www.rosemount.com",
  "https://www.festo.com",
  "https://www.burkert.com",
  "https://www.asco.com",
  "https://www.dwyer-inst.com",
  "https://www.ametek.com",
  "https://www.brooks.com",
  "https://www.keyence.com",
  "https://www.turck.com",
  "https://www.pepperl-fuchs.com",
  "https://www.sick.com",
  "https://www.balluff.com",
  "https://www.ifm.com",
  "https://www.baumer.com",
  "https://www.banner.com",
  "https://www.cognex.com",
  "https://www.omron.com",
  "https://www.mitsubishi-electric.com",
  "https://www.panasonic.com",
  "https://www.fuji-electric.com",
  "https://www.azbil.com",
  "https://www.horiba.com",
  "https://www.shimadzu.com",
  "https://www.metrohm.com",
  "https://www.mettler.com",
  "https://www.hach.com",
  "https://www.thermo.com",
  "https://www.agilent.com",
  "https://www.waters.com",
  "https://www.perkinelmer.com",
  "https://www.beckman.com",
  "https://www.bio-rad.com",
  "https://www.ge.com",
];

// Top 50 Electrical Equipment Manufacturers
const ELECTRICAL_MANUFACTURERS = [
  "https://www.siemens.com",
  "https://www.abb.com",
  "https://www.schneider-electric.com",
  "https://www.ge.com",
  "https://www.eaton.com",
  "https://www.mitsubishi-electric.com",
  "https://www.legrand.com",
  "https://www.hitachi.com",
  "https://www.toshiba.com",
  "https://www.fuji-electric.com",
  "https://www.rockwellautomation.com",
  "https://www.emerson.com",
  "https://www.hubbell.com",
  "https://www.nvent.com",
  "https://www.cooper.com",
  "https://www.cutler-hammer.com",
  "https://www.square-d.com",
  "https://www.westinghouse.com",
  "https://www.allen-bradley.com",
  "https://www.phoenix-contact.com",
  "https://www.weidmuller.com",
  "https://www.wago.com",
  "https://www.murrelektronik.com",
  "https://www.wieland-electric.com",
  "https://www.staubli.com",
  "https://www.harting.com",
  "https://www.lapp.com",
  "https://www.helukabel.com",
  "https://www.omron.com",
  "https://www.idec.com",
  "https://www.moeller.com",
  "https://www.lovato.com",
  "https://www.telemecanique.com",
  "https://www.carlo-gavazzi.com",
  "https://www.finder.com",
  "https://www.hengstler.com",
  "https://www.kubler.com",
  "https://www.sick.com",
  "https://www.pepperl-fuchs.com",
  "https://www.turck.com",
  "https://www.ifm.com",
  "https://www.balluff.com",
  "https://www.contrinex.com",
  "https://www.baumer.com",
  "https://www.wenglor.com",
  "https://www.di-soric.com",
  "https://www.leuze.com",
  "https://www.keyence.com",
  "https://www.cognex.com",
  "https://www.banner.com",
];

// Top 50 Vessel Manufacturers
const VESSEL_MANUFACTURERS = [
  "https://www.chartindustries.com",
  "https://www.pentair.com",
  "https://www.nooter.com",
  "https://www.cbi.com",
  "https://www.bhge.com",
  "https://www.mcdermott.com",
  "https://www.fluor.com",
  "https://www.tecnimont.com",
  "https://www.saipem.com",
  "https://www.petrofac.com",
  "https://www.jacobs.com",
  "https://www.amec.com",
  "https://www.wood.com",
  "https://www.worleyparsons.com",
  "https://www.samsung-eng.com",
  "https://www.doosan.com",
  "https://www.hyundai-ep.com",
  "https://www.jgc.com",
  "https://www.chiyoda-corp.com",
  "https://www.toyo-eng.com",
  "https://www.mitsubishi-eng.com",
  "https://www.foster-wheeler.com",
  "https://www.l-and-t.com",
  "https://www.larsentoubro.com",
  "https://www.punj-lloyd.com",
  "https://www.indianoil.in",
  "https://www.bpcl.com",
  "https://www.hpcl.com",
  "https://www.reliance.com",
  "https://www.cairnindia.com",
  "https://www.ongc.com",
  "https://www.gail.co.in",
  "https://www.iocl.com",
  "https://www.nrl.co.in",
  "https://www.cpcl.co.in",
  "https://www.mrpl.co.in",
  "https://www.hmel.in",
  "https://www.essar.com",
  "https://www.tatasteel.com",
  "https://www.jindalsteel.com",
  "https://www.sail.co.in",
  "https://www.ispat.com",
  "https://www.bhushan.com",
  "https://www.lloyds-steel.com",
  "https://www.uttam-galva.com",
  "https://www.visakhaind.com",
  "https://www.bhel.com",
  "https://www.thermax.com",
  "https://www.godrej.com",
  "https://www.walchandnagar.com",
];

const MANUFACTURER_URLS = [
  ...VALVE_MANUFACTURERS,
  ...PUMP_MANUFACTURERS,
  ...PIPING_MANUFACTURERS,
  ...INSTRUMENTATION_MANUFACTURERS,
  ...ELECTRICAL_MANUFACTURERS,
  ...VESSEL_MANUFACTURERS,
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
          This tool will scrape product information and images from {MANUFACTURER_URLS.length} top manufacturer websites 
          across 6 categories (50 per category) and update the materials database.
        </p>
        <div className="grid grid-cols-3 gap-2 text-sm bg-muted/50 p-3 rounded-lg">
          <div><span className="font-medium">Valves:</span> {VALVE_MANUFACTURERS.length}</div>
          <div><span className="font-medium">Pumps:</span> {PUMP_MANUFACTURERS.length}</div>
          <div><span className="font-medium">Piping:</span> {PIPING_MANUFACTURERS.length}</div>
          <div><span className="font-medium">Instrumentation:</span> {INSTRUMENTATION_MANUFACTURERS.length}</div>
          <div><span className="font-medium">Electrical:</span> {ELECTRICAL_MANUFACTURERS.length}</div>
          <div><span className="font-medium">Vessels:</span> {VESSEL_MANUFACTURERS.length}</div>
        </div>
        
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
