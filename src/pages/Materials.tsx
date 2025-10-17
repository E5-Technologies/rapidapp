import { Camera } from "lucide-react";
import { useState, useRef } from "react";
import SearchBar from "@/components/SearchBar";
import CategoryScroll from "@/components/CategoryScroll";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import MaterialIdentificationDialog from "@/components/MaterialIdentificationDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Import manufacturer logos
import emersonLogo from "@/assets/logos/emerson.png";
import cameronLogo from "@/assets/logos/cameron.png";
import flowserveLogo from "@/assets/logos/flowserve.png";
import bakerHughesLogo from "@/assets/logos/baker-hughes.png";
import velanLogo from "@/assets/logos/velan.png";
import craneLogo from "@/assets/logos/crane.png";
import parkerLogo from "@/assets/logos/parker.png";
import imiLogo from "@/assets/logos/imi.png";
import nelesLogo from "@/assets/logos/neles.png";
import metsoLogo from "@/assets/logos/metso.png";
import ksbLogo from "@/assets/logos/ksb.png";
import swagelokLogo from "@/assets/logos/swagelok.png";
import tycoLogo from "@/assets/logos/tyco.png";
import circorLogo from "@/assets/logos/circor.png";
import ascoLogo from "@/assets/logos/asco.png";

// Pump manufacturer logos
import grundfosLogo from "@/assets/logos/grundfos.png";
import xylemLogo from "@/assets/logos/xylem.png";
import sulzerLogo from "@/assets/logos/sulzer.png";
import ittGouldsLogo from "@/assets/logos/itt-goulds.png";
import weirLogo from "@/assets/logos/weir.png";
import ebaraLogo from "@/assets/logos/ebara.png";
import wiloLogo from "@/assets/logos/wilo.png";
import pentairLogo from "@/assets/logos/pentair.png";
import tsurumiLogo from "@/assets/logos/tsurumi.png";
import ruhrpumpenLogo from "@/assets/logos/ruhrpumpen.png";

const Materials = () => {
  const [selectedCategory, setSelectedCategory] = useState("Valves");
  const [showDialog, setShowDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [identification, setIdentification] = useState<any>(null);
  const [matchedProducts, setMatchedProducts] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const valveProducts = [
    // Emerson (Fisher) - Stainless Steel Materials
    { company: "Emerson", logo: emersonLogo, title: "Control Valve", product: "Fisher EZ Series", rating: 5, image: "https://www.emerson.com/documents/automation/product-catalog-fisher-ez-valve-en-122052.pdf.image.jpg", dataSheet: "https://www.emerson.com/documents/automation/product-catalog-fisher-ez-valve-en-122052.pdf" },
    { company: "Emerson", logo: emersonLogo, title: "Globe Valve", product: "Fisher ED Series", rating: 5, image: "https://www.emerson.com/documents/automation/product-catalog-fisher-ed-valve-en-123842.pdf.image.jpg", dataSheet: "https://www.emerson.com/documents/automation/product-catalog-fisher-ed-valve-en-123842.pdf" },
    { company: "Emerson", logo: emersonLogo, title: "Ball Valve", product: "Fisher Vee-Ball V150", rating: 5, image: "https://www.emerson.com/documents/automation/product-catalog-fisher-v150-v200-v300-vee-ball-valve-en-123656.pdf.image.jpg", dataSheet: "https://www.emerson.com/documents/automation/product-catalog-fisher-v150-v200-v300-vee-ball-valve-en-123656.pdf" },
    { company: "Emerson", logo: emersonLogo, title: "Butterfly Valve", product: "Fisher 8560 Series", rating: 4, image: "https://www.emerson.com/documents/automation/product-catalog-fisher-8560-control-valve-en-123843.pdf.image.jpg", dataSheet: "https://www.emerson.com/documents/automation/product-catalog-fisher-8560-control-valve-en-123843.pdf" },
    
    // Cameron (Schlumberger) - Carbon Steel Materials
    { company: "Cameron", logo: cameronLogo, title: "Gate Valve", product: "WKM 370 Series", rating: 5, image: "https://cdn.thomasnet.com/ccp/30138640/156766.jpg", dataSheet: "https://www.slb.com/-/media/files/cameron/product-catalogs/wkm-370-gate-valve.pdf" },
    { company: "Cameron", logo: cameronLogo, title: "Ball Valve", product: "Cameron T-31 Trunnion", rating: 5, image: "https://cdn.thomasnet.com/ccp/30138640/156767.jpg", dataSheet: "https://www.slb.com/-/media/files/cameron/product-catalogs/t31-ball-valve.pdf" },
    { company: "Cameron", logo: cameronLogo, title: "Check Valve", product: "WKM Piston Check", rating: 4, image: "https://cdn.thomasnet.com/ccp/30138640/156768.jpg", dataSheet: "https://www.slb.com/-/media/files/cameron/product-catalogs/wkm-piston-check-valve.pdf" },
    { company: "Cameron", logo: cameronLogo, title: "Gate Valve", product: "WKM 350 Series", rating: 5, image: "https://cdn.thomasnet.com/ccp/30138640/156769.jpg", dataSheet: "https://www.slb.com/-/media/files/cameron/product-catalogs/wkm-350-gate-valve.pdf" },

    // Flowserve - Brass Materials
    { company: "Flowserve", logo: flowserveLogo, title: "Gate Valve", product: "Durco Mark 3", rating: 5, image: "https://www.flowserve.com/sites/default/files/2018-08/durco-mark-3.jpg", dataSheet: "https://www.flowserve.com/en/products/valves/durco-mark-3-datasheet" },
    { company: "Flowserve", logo: flowserveLogo, title: "Globe Valve", product: "Worcester 39 Series", rating: 4, image: "https://www.flowserve.com/sites/default/files/2018-08/worcester-39-series.jpg", dataSheet: "https://www.flowserve.com/en/products/valves/worcester-39-datasheet" },
    { company: "Flowserve", logo: flowserveLogo, title: "Ball Valve", product: "Worcester R-Series", rating: 5, image: "https://www.flowserve.com/sites/default/files/2018-08/worcester-r-series.jpg", dataSheet: "https://www.flowserve.com/en/products/valves/worcester-r-series-datasheet" },
    { company: "Flowserve", logo: flowserveLogo, title: "Butterfly Valve", product: "Atomac HP", rating: 4, image: "https://www.flowserve.com/sites/default/files/2018-08/atomac-hp.jpg", dataSheet: "https://www.flowserve.com/en/products/valves/atomac-hp-datasheet" },
    { company: "Flowserve", logo: flowserveLogo, title: "Control Valve", product: "Valtek Mark One", rating: 5, image: "https://www.flowserve.com/sites/default/files/2018-08/valtek-mark-one.jpg", dataSheet: "https://www.flowserve.com/en/products/valves/valtek-mark-one-datasheet" },

    // Baker Hughes - Cast Iron Materials
    { company: "Baker Hughes", logo: bakerHughesLogo, title: "Gate Valve", product: "Masoneilan 8800", rating: 5, image: "https://www.bakerhughes.com/sites/bakerhughes/files/masoneilan-8800.jpg", dataSheet: "https://www.bakerhughes.com/masoneilan-8800-datasheet" },
    { company: "Baker Hughes", logo: bakerHughesLogo, title: "Control Valve", product: "Masoneilan Camflex II", rating: 5, image: "https://www.bakerhughes.com/sites/bakerhughes/files/masoneilan-camflex-ii.jpg", dataSheet: "https://www.bakerhughes.com/masoneilan-camflex-ii-datasheet" },
    { company: "Baker Hughes", logo: bakerHughesLogo, title: "Safety Valve", product: "Consolidated 1900 Series", rating: 5, image: "https://www.bakerhughes.com/sites/bakerhughes/files/consolidated-1900.jpg", dataSheet: "https://www.bakerhughes.com/consolidated-1900-datasheet" },
    { company: "Baker Hughes", logo: bakerHughesLogo, title: "Ball Valve", product: "Bently 3-Way", rating: 4, image: "https://www.bakerhughes.com/sites/bakerhughes/files/bently-3way.jpg", dataSheet: "https://www.bakerhughes.com/bently-3way-datasheet" },

    // Velan - Duplex Stainless Materials
    { company: "Velan", logo: velanLogo, title: "Gate Valve", product: "Velan ABV Series", rating: 5, image: "https://www.velan.com/sites/default/files/styles/product_image/public/velan-abv-series.jpg", dataSheet: "https://www.velan.com/en/products/abv-series-datasheet" },
    { company: "Velan", logo: velanLogo, title: "Globe Valve", product: "Velan HP Globe", rating: 4, image: "https://www.velan.com/sites/default/files/styles/product_image/public/velan-hp-globe.jpg", dataSheet: "https://www.velan.com/en/products/hp-globe-datasheet" },
    { company: "Velan", logo: velanLogo, title: "Check Valve", product: "Velan Swing Check", rating: 4, image: "https://www.velan.com/sites/default/files/styles/product_image/public/velan-swing-check.jpg", dataSheet: "https://www.velan.com/en/products/swing-check-datasheet" },
    { company: "Velan", logo: velanLogo, title: "Ball Valve", product: "Velan VTP Series", rating: 5, image: "https://www.velan.com/sites/default/files/styles/product_image/public/velan-vtp.jpg", dataSheet: "https://www.velan.com/en/products/vtp-series-datasheet" },

    // Crane - Bronze Materials
    { company: "Crane", logo: craneLogo, title: "Gate Valve", product: "Crane 400 Series", rating: 4, image: "https://cranevalves.com/wp-content/uploads/2021/05/crane-400-series.jpg", dataSheet: "https://cranevalves.com/datasheets/crane-400-series.pdf" },
    { company: "Crane", logo: craneLogo, title: "Globe Valve", product: "Crane 300 Series", rating: 4, image: "https://cranevalves.com/wp-content/uploads/2021/05/crane-300-series.jpg", dataSheet: "https://cranevalves.com/datasheets/crane-300-series.pdf" },
    { company: "Crane", logo: craneLogo, title: "Ball Valve", product: "Crane Pacific", rating: 5, image: "https://cranevalves.com/wp-content/uploads/2021/05/crane-pacific.jpg", dataSheet: "https://cranevalves.com/datasheets/crane-pacific.pdf" },
    { company: "Crane", logo: craneLogo, title: "Check Valve", product: "Crane Dual Plate", rating: 4, image: "https://cranevalves.com/wp-content/uploads/2021/05/crane-dual-plate.jpg", dataSheet: "https://cranevalves.com/datasheets/crane-dual-plate.pdf" },

    // Parker Hannifin - Aluminum Materials
    { company: "Parker Hannifin", logo: parkerLogo, title: "Ball Valve", product: "Parker BV Series", rating: 5, image: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_4-BV.jpg", dataSheet: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_4-BV.pdf" },
    { company: "Parker Hannifin", logo: parkerLogo, title: "Needle Valve", product: "Parker 4N Series", rating: 5, image: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_4N.jpg", dataSheet: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_4N.pdf" },
    { company: "Parker Hannifin", logo: parkerLogo, title: "Check Valve", product: "Parker CV Series", rating: 4, image: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_CV.jpg", dataSheet: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_CV.pdf" },
    { company: "Parker Hannifin", logo: parkerLogo, title: "Solenoid Valve", product: "Parker Skinner", rating: 5, image: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_Skinner.jpg", dataSheet: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_Skinner.pdf" },

    // IMI Critical Engineering - Alloy Steel Materials
    { company: "IMI Critical", logo: imiLogo, title: "Control Valve", product: "IMI CCI Drag", rating: 5, image: "https://www.imi-critical.com/sites/default/files/cci-drag-valve.jpg", dataSheet: "https://www.imi-critical.com/cci-drag-datasheet.pdf" },
    { company: "IMI Critical", logo: imiLogo, title: "Safety Valve", product: "IMI Truflo", rating: 5, image: "https://www.imi-critical.com/sites/default/files/truflo-valve.jpg", dataSheet: "https://www.imi-critical.com/truflo-datasheet.pdf" },
    { company: "IMI Critical", logo: imiLogo, title: "Ball Valve", product: "IMI Severe Service", rating: 4, image: "https://www.imi-critical.com/sites/default/files/severe-service-valve.jpg", dataSheet: "https://www.imi-critical.com/severe-service-datasheet.pdf" },

    // Neles (Valmet) - Stainless Steel Materials
    { company: "Neles", logo: nelesLogo, title: "Ball Valve", product: "Neles Neldisc", rating: 5, image: "https://www.neles.com/globalassets/images/products/neldisc-valve.jpg", dataSheet: "https://www.neles.com/datasheets/neldisc-datasheet.pdf" },
    { company: "Neles", logo: nelesLogo, title: "Control Valve", product: "Neles Globe", rating: 5, image: "https://www.neles.com/globalassets/images/products/neles-globe-valve.jpg", dataSheet: "https://www.neles.com/datasheets/neles-globe-datasheet.pdf" },
    { company: "Neles", logo: nelesLogo, title: "Butterfly Valve", product: "Neles Easyflow", rating: 4, image: "https://www.neles.com/globalassets/images/products/easyflow-valve.jpg", dataSheet: "https://www.neles.com/datasheets/easyflow-datasheet.pdf" },

    // Metso - Titanium Materials
    { company: "Metso", logo: metsoLogo, title: "Ball Valve", product: "Metso Neles Q-Series", rating: 5, image: "https://www.metso.com/globalassets/images/products/q-series-valve.jpg", dataSheet: "https://www.metso.com/datasheets/q-series-datasheet.pdf" },
    { company: "Metso", logo: metsoLogo, title: "Butterfly Valve", product: "Metso ND9000", rating: 4, image: "https://www.metso.com/globalassets/images/products/nd9000-valve.jpg", dataSheet: "https://www.metso.com/datasheets/nd9000-datasheet.pdf" },
    { company: "Metso", logo: metsoLogo, title: "Control Valve", product: "Metso V-Series", rating: 5, image: "https://www.metso.com/globalassets/images/products/v-series-valve.jpg", dataSheet: "https://www.metso.com/datasheets/v-series-datasheet.pdf" },

    // KSB - Ductile Iron Materials
    { company: "KSB", logo: ksbLogo, title: "Gate Valve", product: "KSB BOA-W", rating: 5, image: "https://www.ksb.com/blob/ksb-com/112896/data/BOA-W-gate-valve.jpg", dataSheet: "https://www.ksb.com/datasheets/boa-w-datasheet.pdf" },
    { company: "KSB", logo: ksbLogo, title: "Globe Valve", product: "KSB NORI Series", rating: 4, image: "https://www.ksb.com/blob/ksb-com/112897/data/NORI-globe-valve.jpg", dataSheet: "https://www.ksb.com/datasheets/nori-datasheet.pdf" },
    { company: "KSB", logo: ksbLogo, title: "Check Valve", product: "KSB BOAX-W", rating: 4, image: "https://www.ksb.com/blob/ksb-com/112898/data/BOAX-W-check-valve.jpg", dataSheet: "https://www.ksb.com/datasheets/boax-w-datasheet.pdf" },

    // Swagelok - 316 Stainless Steel Materials
    { company: "Swagelok", logo: swagelokLogo, title: "Ball Valve", product: "Swagelok SS Series", rating: 5, image: "https://www.swagelok.com/images/products/ball-valves/ss-series-ball-valve.jpg", dataSheet: "https://www.swagelok.com/datasheets/ss-series-ball-valve.pdf" },
    { company: "Swagelok", logo: swagelokLogo, title: "Needle Valve", product: "Swagelok 31 Series", rating: 5, image: "https://www.swagelok.com/images/products/needle-valves/31-series-needle-valve.jpg", dataSheet: "https://www.swagelok.com/datasheets/31-series-needle-valve.pdf" },
    { company: "Swagelok", logo: swagelokLogo, title: "Check Valve", product: "Swagelok CH Series", rating: 5, image: "https://www.swagelok.com/images/products/check-valves/ch-series-check-valve.jpg", dataSheet: "https://www.swagelok.com/datasheets/ch-series-check-valve.pdf" },

    // Tyco (Pentair) - Cast Steel Materials
    { company: "Tyco", logo: tycoLogo, title: "Butterfly Valve", product: "Tyco HP-W Series", rating: 4, image: "https://www.pentair.com/content/dam/extranet/nam/pentair-valves-controls/products/tyco-hp-w.jpg", dataSheet: "https://www.pentair.com/datasheets/tyco-hp-w.pdf" },
    { company: "Tyco", logo: tycoLogo, title: "Ball Valve", product: "Tyco Keystone", rating: 5, image: "https://www.pentair.com/content/dam/extranet/nam/pentair-valves-controls/products/tyco-keystone.jpg", dataSheet: "https://www.pentair.com/datasheets/tyco-keystone.pdf" },

    // CIRCOR - Forged Steel Materials
    { company: "CIRCOR", logo: circorLogo, title: "Gate Valve", product: "KF API 6A", rating: 5, image: "https://www.circor.com/sites/default/files/kf-api-6a-valve.jpg", dataSheet: "https://www.circor.com/datasheets/kf-api-6a.pdf" },
    { company: "CIRCOR", logo: circorLogo, title: "Ball Valve", product: "Spence D-2000", rating: 4, image: "https://www.circor.com/sites/default/files/spence-d2000-valve.jpg", dataSheet: "https://www.circor.com/datasheets/spence-d2000.pdf" },

    // Asco (Emerson) - Brass & Stainless Materials
    { company: "Asco", logo: ascoLogo, title: "Solenoid Valve", product: "Asco 8320 Series", rating: 5, image: "https://www.emerson.com/documents/automation/product-catalog-asco-8320-series-en-123844.pdf.image.jpg", dataSheet: "https://www.emerson.com/documents/automation/product-catalog-asco-8320-series-en-123844.pdf" },
    { company: "Asco", logo: ascoLogo, title: "Process Valve", product: "Asco Numatics", rating: 4, image: "https://www.emerson.com/documents/automation/product-catalog-asco-numatics-en-123845.pdf.image.jpg", dataSheet: "https://www.emerson.com/documents/automation/product-catalog-asco-numatics-en-123845.pdf" },
  ];

  const pumpProducts = [
    // Grundfos - Centrifugal Pumps
    { company: "Grundfos", logo: grundfosLogo, title: "Centrifugal Pump", product: "Grundfos CR Series", rating: 5, image: "https://product-selection.grundfos.com/img/CR_cutmodel_99177762.jpg", dataSheet: "https://www.grundfos.com/products/cr-cre-cri-crie-crn-crne.pdf" },
    { company: "Grundfos", logo: grundfosLogo, title: "Multistage Pump", product: "Grundfos CRN Series", rating: 5, image: "https://product-selection.grundfos.com/img/CRN_cutmodel_99177763.jpg", dataSheet: "https://www.grundfos.com/products/crn-series.pdf" },
    { company: "Grundfos", logo: grundfosLogo, title: "Submersible Pump", product: "Grundfos SP Series", rating: 5, image: "https://product-selection.grundfos.com/img/SP_cutmodel_99177764.jpg", dataSheet: "https://www.grundfos.com/products/sp-series.pdf" },
    { company: "Grundfos", logo: grundfosLogo, title: "Booster Pump", product: "Grundfos CME Series", rating: 4, image: "https://product-selection.grundfos.com/img/CME_cutmodel_99177765.jpg", dataSheet: "https://www.grundfos.com/products/cme-series.pdf" },

    // KSB - Industrial Pumps
    { company: "KSB", logo: ksbLogo, title: "End Suction Pump", product: "KSB Etanorm", rating: 5, image: "https://www.ksb.com/blob/ksb-com/112900/data/etanorm-pump.jpg", dataSheet: "https://www.ksb.com/datasheets/etanorm.pdf" },
    { company: "KSB", logo: ksbLogo, title: "Multistage Pump", product: "KSB Multitec", rating: 5, image: "https://www.ksb.com/blob/ksb-com/112901/data/multitec-pump.jpg", dataSheet: "https://www.ksb.com/datasheets/multitec.pdf" },
    { company: "KSB", logo: ksbLogo, title: "Split Case Pump", product: "KSB Omega", rating: 4, image: "https://www.ksb.com/blob/ksb-com/112902/data/omega-pump.jpg", dataSheet: "https://www.ksb.com/datasheets/omega.pdf" },
    { company: "KSB", logo: ksbLogo, title: "Chemical Pump", product: "KSB Etachrom", rating: 5, image: "https://www.ksb.com/blob/ksb-com/112903/data/etachrom-pump.jpg", dataSheet: "https://www.ksb.com/datasheets/etachrom.pdf" },

    // Flowserve - Process Pumps
    { company: "Flowserve", logo: flowserveLogo, title: "ANSI Pump", product: "Flowserve Durco Mark 3", rating: 5, image: "https://www.flowserve.com/sites/default/files/2018-08/durco-mark-3-pump.jpg", dataSheet: "https://www.flowserve.com/durco-mark-3-pump-datasheet.pdf" },
    { company: "Flowserve", logo: flowserveLogo, title: "API Pump", product: "Flowserve Durco BK", rating: 5, image: "https://www.flowserve.com/sites/default/files/2018-08/durco-bk-pump.jpg", dataSheet: "https://www.flowserve.com/durco-bk-pump-datasheet.pdf" },
    { company: "Flowserve", logo: flowserveLogo, title: "Vertical Pump", product: "Flowserve IDP", rating: 4, image: "https://www.flowserve.com/sites/default/files/2018-08/idp-pump.jpg", dataSheet: "https://www.flowserve.com/idp-pump-datasheet.pdf" },
    { company: "Flowserve", logo: flowserveLogo, title: "Slurry Pump", product: "Flowserve Wilson Snyder", rating: 5, image: "https://www.flowserve.com/sites/default/files/2018-08/wilson-snyder-pump.jpg", dataSheet: "https://www.flowserve.com/wilson-snyder-pump-datasheet.pdf" },

    // Sulzer - Heavy Duty Pumps
    { company: "Sulzer", logo: sulzerLogo, title: "Process Pump", product: "Sulzer CPT Series", rating: 5, image: "https://www.sulzer.com/-/media/Images/Products/Pumps/cpt-series.jpg", dataSheet: "https://www.sulzer.com/datasheets/cpt-series.pdf" },
    { company: "Sulzer", logo: sulzerLogo, title: "Multistage Pump", product: "Sulzer MSD Series", rating: 5, image: "https://www.sulzer.com/-/media/Images/Products/Pumps/msd-series.jpg", dataSheet: "https://www.sulzer.com/datasheets/msd-series.pdf" },
    { company: "Sulzer", logo: sulzerLogo, title: "API Pump", product: "Sulzer HPT Series", rating: 4, image: "https://www.sulzer.com/-/media/Images/Products/Pumps/hpt-series.jpg", dataSheet: "https://www.sulzer.com/datasheets/hpt-series.pdf" },
    { company: "Sulzer", logo: sulzerLogo, title: "Slurry Pump", product: "Sulzer AHP Series", rating: 5, image: "https://www.sulzer.com/-/media/Images/Products/Pumps/ahp-series.jpg", dataSheet: "https://www.sulzer.com/datasheets/ahp-series.pdf" },

    // Xylem (Bell & Gossett) - HVAC Pumps
    { company: "Xylem", logo: xylemLogo, title: "Circulator Pump", product: "Bell & Gossett Series 100", rating: 5, image: "https://www.xylem.com/siteassets/brand/bell-gossett/products/series-100.jpg", dataSheet: "https://www.xylem.com/datasheets/series-100.pdf" },
    { company: "Xylem", logo: xylemLogo, title: "In-Line Pump", product: "Bell & Gossett e1510", rating: 4, image: "https://www.xylem.com/siteassets/brand/bell-gossett/products/e1510.jpg", dataSheet: "https://www.xylem.com/datasheets/e1510.pdf" },
    { company: "Xylem", logo: xylemLogo, title: "Split Case Pump", product: "Bell & Gossett VSX", rating: 5, image: "https://www.xylem.com/siteassets/brand/bell-gossett/products/vsx.jpg", dataSheet: "https://www.xylem.com/datasheets/vsx.pdf" },

    // Wilo - Building Services Pumps
    { company: "Wilo", logo: wiloLogo, title: "Circulator Pump", product: "Wilo-Stratos PICO", rating: 5, image: "https://wilo.com/dam/jcr/stratos-pico.jpg", dataSheet: "https://wilo.com/datasheets/stratos-pico.pdf" },
    { company: "Wilo", logo: wiloLogo, title: "Inline Pump", product: "Wilo-VeroLine IPL", rating: 4, image: "https://wilo.com/dam/jcr/veroline-ipl.jpg", dataSheet: "https://wilo.com/datasheets/veroline-ipl.pdf" },
    { company: "Wilo", logo: wiloLogo, title: "Booster Pump", product: "Wilo-Economy MHIL", rating: 5, image: "https://wilo.com/dam/jcr/economy-mhil.jpg", dataSheet: "https://wilo.com/datasheets/economy-mhil.pdf" },

    // ITT Goulds - Industrial Pumps
    { company: "ITT Goulds", logo: ittGouldsLogo, title: "ANSI Pump", product: "Goulds 3196", rating: 5, image: "https://www.itt.com/goulds/products/3196-pump.jpg", dataSheet: "https://www.itt.com/goulds/datasheets/3196.pdf" },
    { company: "ITT Goulds", logo: ittGouldsLogo, title: "API Pump", product: "Goulds 3700", rating: 5, image: "https://www.itt.com/goulds/products/3700-pump.jpg", dataSheet: "https://www.itt.com/goulds/datasheets/3700.pdf" },
    { company: "ITT Goulds", logo: ittGouldsLogo, title: "Slurry Pump", product: "Goulds XHD", rating: 4, image: "https://www.itt.com/goulds/products/xhd-pump.jpg", dataSheet: "https://www.itt.com/goulds/datasheets/xhd.pdf" },

    // Ebara - Water Treatment Pumps
    { company: "Ebara", logo: ebaraLogo, title: "Submersible Pump", product: "Ebara DW Series", rating: 5, image: "https://www.ebara.com/products/dw-series.jpg", dataSheet: "https://www.ebara.com/datasheets/dw-series.pdf" },
    { company: "Ebara", logo: ebaraLogo, title: "Vertical Pump", product: "Ebara EVS Series", rating: 4, image: "https://www.ebara.com/products/evs-series.jpg", dataSheet: "https://www.ebara.com/datasheets/evs-series.pdf" },

    // Pentair - Pool & Water Pumps
    { company: "Pentair", logo: pentairLogo, title: "Centrifugal Pump", product: "Pentair Berkeley B Series", rating: 5, image: "https://www.pentair.com/content/dam/pentair/products/berkeley-b-series.jpg", dataSheet: "https://www.pentair.com/datasheets/berkeley-b-series.pdf" },
    { company: "Pentair", logo: pentairLogo, title: "Turbine Pump", product: "Pentair Aurora 540", rating: 4, image: "https://www.pentair.com/content/dam/pentair/products/aurora-540.jpg", dataSheet: "https://www.pentair.com/datasheets/aurora-540.pdf" },

    // Tsurumi - Submersible Pumps
    { company: "Tsurumi", logo: tsurumiLogo, title: "Submersible Pump", product: "Tsurumi KTZ Series", rating: 5, image: "https://www.tsurumipump.com/products/ktz-series.jpg", dataSheet: "https://www.tsurumipump.com/datasheets/ktz-series.pdf" },
    { company: "Tsurumi", logo: tsurumiLogo, title: "Dewatering Pump", product: "Tsurumi LB Series", rating: 4, image: "https://www.tsurumipump.com/products/lb-series.jpg", dataSheet: "https://www.tsurumipump.com/datasheets/lb-series.pdf" },

    // Ruhrpumpen - Oil & Gas Pumps
    { company: "Ruhrpumpen", logo: ruhrpumpenLogo, title: "API Pump", product: "Ruhrpumpen RGO Series", rating: 5, image: "https://www.ruhrpumpen.com/products/rgo-series.jpg", dataSheet: "https://www.ruhrpumpen.com/datasheets/rgo-series.pdf" },
    { company: "Ruhrpumpen", logo: ruhrpumpenLogo, title: "Pipeline Pump", product: "Ruhrpumpen RVP Series", rating: 4, image: "https://www.ruhrpumpen.com/products/rvp-series.jpg", dataSheet: "https://www.ruhrpumpen.com/datasheets/rvp-series.pdf" },

    // Weir - Mining Pumps
    { company: "Weir", logo: weirLogo, title: "Slurry Pump", product: "Weir Warman AH", rating: 5, image: "https://www.global.weir/products/warman-ah.jpg", dataSheet: "https://www.global.weir/datasheets/warman-ah.pdf" },
    { company: "Weir", logo: weirLogo, title: "Vertical Pump", product: "Weir Hazleton SP", rating: 4, image: "https://www.global.weir/products/hazleton-sp.jpg", dataSheet: "https://www.global.weir/datasheets/hazleton-sp.pdf" },
  ];

  const pipingProducts = [
    // Victaulic - Grooved Piping
    { company: "Victaulic", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Grooved Coupling", product: "Victaulic Style 77", rating: 5, image: "https://www.victaulic.com/-/media/images/products/style-77.jpg", dataSheet: "https://www.victaulic.com/datasheets/style-77.pdf" },
    { company: "Victaulic", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Flexible Coupling", product: "Victaulic Style 107N", rating: 5, image: "https://www.victaulic.com/-/media/images/products/style-107n.jpg", dataSheet: "https://www.victaulic.com/datasheets/style-107n.pdf" },
    { company: "Victaulic", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Rigid Coupling", product: "Victaulic Style 177N", rating: 4, image: "https://www.victaulic.com/-/media/images/products/style-177n.jpg", dataSheet: "https://www.victaulic.com/datasheets/style-177n.pdf" },

    // Anvil - Pipe Fittings
    { company: "Anvil", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Malleable Elbow", product: "Anvil Fig. 90", rating: 5, image: "https://www.anvilintl.com/products/fig-90-elbow.jpg", dataSheet: "https://www.anvilintl.com/datasheets/fig-90.pdf" },
    { company: "Anvil", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Tee Fitting", product: "Anvil Fig. 130", rating: 5, image: "https://www.anvilintl.com/products/fig-130-tee.jpg", dataSheet: "https://www.anvilintl.com/datasheets/fig-130.pdf" },
    { company: "Anvil", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Reducer", product: "Anvil Fig. 240", rating: 4, image: "https://www.anvilintl.com/products/fig-240-reducer.jpg", dataSheet: "https://www.anvilintl.com/datasheets/fig-240.pdf" },

    // Spears - PVC Piping
    { company: "Spears", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "PVC Schedule 80", product: "Spears 8808 Series", rating: 5, image: "https://www.spearsmfg.com/products/8808-series.jpg", dataSheet: "https://www.spearsmfg.com/datasheets/8808-series.pdf" },
    { company: "Spears", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "PVC Ball Valve", product: "Spears 2630 Series", rating: 4, image: "https://www.spearsmfg.com/products/2630-series.jpg", dataSheet: "https://www.spearsmfg.com/datasheets/2630-series.pdf" },
    { company: "Spears", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "CPVC Fitting", product: "Spears 4800 Series", rating: 5, image: "https://www.spearsmfg.com/products/4800-series.jpg", dataSheet: "https://www.spearsmfg.com/datasheets/4800-series.pdf" },

    // Uponor - PEX Piping
    { company: "Uponor", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "PEX-a Tubing", product: "Uponor AquaPEX", rating: 5, image: "https://www.uponor.com/products/aquapex.jpg", dataSheet: "https://www.uponor.com/datasheets/aquapex.pdf" },
    { company: "Uponor", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "ProPEX Fitting", product: "Uponor LF4525", rating: 5, image: "https://www.uponor.com/products/lf4525.jpg", dataSheet: "https://www.uponor.com/datasheets/lf4525.pdf" },

    // Mueller - Copper Piping
    { company: "Mueller", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Type L Copper", product: "Mueller Streamline", rating: 5, image: "https://www.muellerindustries.com/products/streamline.jpg", dataSheet: "https://www.muellerindustries.com/datasheets/streamline.pdf" },
    { company: "Mueller", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Copper Fitting", product: "Mueller Wrot W04000", rating: 4, image: "https://www.muellerindustries.com/products/w04000.jpg", dataSheet: "https://www.muellerindustries.com/datasheets/w04000.pdf" },
  ];

  const instrumentationProducts = [
    // Rosemount (Emerson) - Pressure Transmitters
    { company: "Rosemount", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Pressure Transmitter", product: "Rosemount 3051", rating: 5, image: "https://www.emerson.com/documents/automation/product-catalog-rosemount-3051-en-123846.pdf.image.jpg", dataSheet: "https://www.emerson.com/documents/automation/product-catalog-rosemount-3051-en-123846.pdf" },
    { company: "Rosemount", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Temperature Transmitter", product: "Rosemount 3144P", rating: 5, image: "https://www.emerson.com/documents/automation/product-catalog-rosemount-3144p-en-123847.pdf.image.jpg", dataSheet: "https://www.emerson.com/documents/automation/product-catalog-rosemount-3144p-en-123847.pdf" },
    { company: "Rosemount", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Flow Meter", product: "Rosemount 8800D", rating: 4, image: "https://www.emerson.com/documents/automation/product-catalog-rosemount-8800d-en-123848.pdf.image.jpg", dataSheet: "https://www.emerson.com/documents/automation/product-catalog-rosemount-8800d-en-123848.pdf" },

    // Endress+Hauser - Process Instruments
    { company: "Endress+Hauser", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Level Transmitter", product: "E+H Micropilot FMR57", rating: 5, image: "https://www.endress.com/products/fmr57.jpg", dataSheet: "https://www.endress.com/datasheets/fmr57.pdf" },
    { company: "Endress+Hauser", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Flow Meter", product: "E+H Proline Promag", rating: 5, image: "https://www.endress.com/products/promag.jpg", dataSheet: "https://www.endress.com/datasheets/promag.pdf" },
    { company: "Endress+Hauser", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "pH Sensor", product: "E+H Orbisint CPS11D", rating: 4, image: "https://www.endress.com/products/cps11d.jpg", dataSheet: "https://www.endress.com/datasheets/cps11d.pdf" },

    // Yokogawa - Analyzers
    { company: "Yokogawa", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Pressure Transmitter", product: "Yokogawa EJA Series", rating: 5, image: "https://www.yokogawa.com/products/eja-series.jpg", dataSheet: "https://www.yokogawa.com/datasheets/eja-series.pdf" },
    { company: "Yokogawa", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Flow Meter", product: "Yokogawa ROTAMASS", rating: 5, image: "https://www.yokogawa.com/products/rotamass.jpg", dataSheet: "https://www.yokogawa.com/datasheets/rotamass.pdf" },
    { company: "Yokogawa", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Temperature Transmitter", product: "Yokogawa YTA Series", rating: 4, image: "https://www.yokogawa.com/products/yta-series.jpg", dataSheet: "https://www.yokogawa.com/datasheets/yta-series.pdf" },

    // Honeywell - Control Systems
    { company: "Honeywell", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Pressure Sensor", product: "Honeywell STG Series", rating: 5, image: "https://www.honeywell.com/products/stg-series.jpg", dataSheet: "https://www.honeywell.com/datasheets/stg-series.pdf" },
    { company: "Honeywell", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Temperature Sensor", product: "Honeywell RTD", rating: 4, image: "https://www.honeywell.com/products/rtd.jpg", dataSheet: "https://www.honeywell.com/datasheets/rtd.pdf" },

    // Siemens - Process Instruments
    { company: "Siemens", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Flow Meter", product: "Siemens SITRANS F", rating: 5, image: "https://www.siemens.com/products/sitrans-f.jpg", dataSheet: "https://www.siemens.com/datasheets/sitrans-f.pdf" },
    { company: "Siemens", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Pressure Transmitter", product: "Siemens SITRANS P", rating: 5, image: "https://www.siemens.com/products/sitrans-p.jpg", dataSheet: "https://www.siemens.com/datasheets/sitrans-p.pdf" },
  ];

  const electricalProducts = [
    // ABB - Motors & Drives
    { company: "ABB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "VFD Drive", product: "ABB ACS880", rating: 5, image: "https://www.abb.com/products/acs880.jpg", dataSheet: "https://www.abb.com/datasheets/acs880.pdf" },
    { company: "ABB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Electric Motor", product: "ABB M3BP Series", rating: 5, image: "https://www.abb.com/products/m3bp.jpg", dataSheet: "https://www.abb.com/datasheets/m3bp.pdf" },
    { company: "ABB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Circuit Breaker", product: "ABB Tmax XT", rating: 4, image: "https://www.abb.com/products/tmax-xt.jpg", dataSheet: "https://www.abb.com/datasheets/tmax-xt.pdf" },

    // Schneider Electric - Power Distribution
    { company: "Schneider Electric", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Motor Starter", product: "Schneider TeSys D", rating: 5, image: "https://www.se.com/products/tesys-d.jpg", dataSheet: "https://www.se.com/datasheets/tesys-d.pdf" },
    { company: "Schneider Electric", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "VFD Drive", product: "Schneider Altivar 320", rating: 5, image: "https://www.se.com/products/altivar-320.jpg", dataSheet: "https://www.se.com/datasheets/altivar-320.pdf" },
    { company: "Schneider Electric", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Circuit Breaker", product: "Schneider Masterpact MTZ", rating: 4, image: "https://www.se.com/products/masterpact-mtz.jpg", dataSheet: "https://www.se.com/datasheets/masterpact-mtz.pdf" },

    // Siemens - Automation
    { company: "Siemens", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "VFD Drive", product: "Siemens SINAMICS G120", rating: 5, image: "https://www.siemens.com/products/sinamics-g120.jpg", dataSheet: "https://www.siemens.com/datasheets/sinamics-g120.pdf" },
    { company: "Siemens", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Motor Starter", product: "Siemens SIRIUS 3RT", rating: 5, image: "https://www.siemens.com/products/sirius-3rt.jpg", dataSheet: "https://www.siemens.com/datasheets/sirius-3rt.pdf" },
    { company: "Siemens", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Circuit Breaker", product: "Siemens SENTRON 3VA", rating: 4, image: "https://www.siemens.com/products/sentron-3va.jpg", dataSheet: "https://www.siemens.com/datasheets/sentron-3va.pdf" },

    // Eaton - Power Management
    { company: "Eaton", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Circuit Breaker", product: "Eaton Magnum DS", rating: 5, image: "https://www.eaton.com/products/magnum-ds.jpg", dataSheet: "https://www.eaton.com/datasheets/magnum-ds.pdf" },
    { company: "Eaton", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Motor Starter", product: "Eaton XTCE Series", rating: 4, image: "https://www.eaton.com/products/xtce.jpg", dataSheet: "https://www.eaton.com/datasheets/xtce.pdf" },

    // Rockwell Automation - Industrial Control
    { company: "Rockwell", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "VFD Drive", product: "Rockwell PowerFlex 525", rating: 5, image: "https://www.rockwellautomation.com/products/powerflex-525.jpg", dataSheet: "https://www.rockwellautomation.com/datasheets/powerflex-525.pdf" },
    { company: "Rockwell", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Motor Starter", product: "Rockwell SMC-50", rating: 5, image: "https://www.rockwellautomation.com/products/smc-50.jpg", dataSheet: "https://www.rockwellautomation.com/datasheets/smc-50.pdf" },
  ];

  const vesselsProducts = [
    // Nooter - Pressure Vessels
    { company: "Nooter", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Pressure Vessel", product: "Nooter ASME U-Stamp", rating: 5, image: "https://www.nooter.com/products/pressure-vessel.jpg", dataSheet: "https://www.nooter.com/datasheets/pressure-vessel.pdf" },
    { company: "Nooter", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Heat Exchanger", product: "Nooter Shell & Tube", rating: 5, image: "https://www.nooter.com/products/heat-exchanger.jpg", dataSheet: "https://www.nooter.com/datasheets/heat-exchanger.pdf" },

    // CB&I (McDermott) - Storage Tanks
    { company: "McDermott", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Storage Tank", product: "CB&I Cone Roof", rating: 5, image: "https://www.mcdermott.com/products/cone-roof-tank.jpg", dataSheet: "https://www.mcdermott.com/datasheets/cone-roof-tank.pdf" },
    { company: "McDermott", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Floating Roof Tank", product: "CB&I IFR Tank", rating: 5, image: "https://www.mcdermott.com/products/ifr-tank.jpg", dataSheet: "https://www.mcdermott.com/datasheets/ifr-tank.pdf" },

    // Chartwell - Process Vessels
    { company: "Chartwell", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Reactor Vessel", product: "Chartwell CSTR", rating: 5, image: "https://www.chartwell.com/products/cstr.jpg", dataSheet: "https://www.chartwell.com/datasheets/cstr.pdf" },
    { company: "Chartwell", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Distillation Column", product: "Chartwell Trayed Tower", rating: 4, image: "https://www.chartwell.com/products/trayed-tower.jpg", dataSheet: "https://www.chartwell.com/datasheets/trayed-tower.pdf" },

    // Matrix Service - Field Erected Tanks
    { company: "Matrix Service", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "API 650 Tank", product: "Matrix FET Series", rating: 5, image: "https://www.matrixservice.com/products/fet-series.jpg", dataSheet: "https://www.matrixservice.com/datasheets/fet-series.pdf" },
    { company: "Matrix Service", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Spherical Tank", product: "Matrix LPG Sphere", rating: 5, image: "https://www.matrixservice.com/products/lpg-sphere.jpg", dataSheet: "https://www.matrixservice.com/datasheets/lpg-sphere.pdf" },

    // L&T - Pressure Vessels
    { company: "L&T", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Pressure Vessel", product: "L&T ASME VIII", rating: 5, image: "https://www.larsentoubro.com/products/asme-viii.jpg", dataSheet: "https://www.larsentoubro.com/datasheets/asme-viii.pdf" },
    { company: "L&T", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Reactor", product: "L&T Hydrocracker", rating: 4, image: "https://www.larsentoubro.com/products/hydrocracker.jpg", dataSheet: "https://www.larsentoubro.com/datasheets/hydrocracker.pdf" },
  ];

  const products = 
    selectedCategory === "Valves" ? valveProducts :
    selectedCategory === "Pumps" ? pumpProducts :
    selectedCategory === "Piping" ? pipingProducts :
    selectedCategory === "Instrumentation" ? instrumentationProducts :
    selectedCategory === "Electrical" ? electricalProducts :
    selectedCategory === "Vessels" ? vesselsProducts :
    [];

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
      <div className="px-4 space-y-4 mt-4">
        {products.map((product, index) => (
          <ProductCard key={index} {...product} />
        ))}
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
          const matches = findMatchingProducts(data);
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

  function findMatchingProducts(identification: any) {
    if (!identification || !identification.category) return [];

    // Get all products for the identified category
    let categoryProducts: any[] = [];
    switch (identification.category) {
      case "Valves":
        categoryProducts = valveProducts;
        break;
      case "Pumps":
        categoryProducts = pumpProducts;
        break;
      case "Piping":
        categoryProducts = pipingProducts;
        break;
      case "Instrumentation":
        categoryProducts = instrumentationProducts;
        break;
      case "Electrical":
        categoryProducts = electricalProducts;
        break;
      case "Vessels":
        categoryProducts = vesselsProducts;
        break;
      default:
        return [];
    }

    // Filter products based on search terms and type
    const searchTerms = [
      identification.type?.toLowerCase(),
      identification.manufacturer?.toLowerCase(),
      ...(identification.searchTerms || []).map((term: string) => term.toLowerCase())
    ].filter(Boolean);

    const matches = categoryProducts.filter(product => {
      const productText = `${product.company} ${product.title} ${product.product}`.toLowerCase();
      return searchTerms.some(term => productText.includes(term));
    });

    // Return top 5 matches
    return matches.slice(0, 5);
  }
};

export default Materials;
