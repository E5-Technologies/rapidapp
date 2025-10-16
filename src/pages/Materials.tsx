import { Camera } from "lucide-react";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import CategoryScroll from "@/components/CategoryScroll";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";

const Materials = () => {
  const [selectedCategory, setSelectedCategory] = useState("Valves");

  const valveProducts = [
    // Emerson (Fisher) - Stainless Steel Materials
    { company: "Emerson", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Fisher EZ Series", rating: 5, image: "https://www.emerson.com/documents/automation/product-catalog-fisher-ez-valve-en-122052.pdf.image.jpg", dataSheet: "https://www.emerson.com/documents/automation/product-catalog-fisher-ez-valve-en-122052.pdf" },
    { company: "Emerson", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "Fisher ED Series", rating: 5, image: "https://www.emerson.com/documents/automation/product-catalog-fisher-ed-valve-en-123842.pdf.image.jpg", dataSheet: "https://www.emerson.com/documents/automation/product-catalog-fisher-ed-valve-en-123842.pdf" },
    { company: "Emerson", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Fisher Vee-Ball V150", rating: 5, image: "https://www.emerson.com/documents/automation/product-catalog-fisher-v150-v200-v300-vee-ball-valve-en-123656.pdf.image.jpg", dataSheet: "https://www.emerson.com/documents/automation/product-catalog-fisher-v150-v200-v300-vee-ball-valve-en-123656.pdf" },
    { company: "Emerson", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Fisher 8560 Series", rating: 4, image: "https://www.emerson.com/documents/automation/product-catalog-fisher-8560-control-valve-en-123843.pdf.image.jpg", dataSheet: "https://www.emerson.com/documents/automation/product-catalog-fisher-8560-control-valve-en-123843.pdf" },
    
    // Cameron (Schlumberger) - Carbon Steel Materials
    { company: "Cameron", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "WKM 370 Series", rating: 5, image: "https://cdn.thomasnet.com/ccp/30138640/156766.jpg", dataSheet: "https://www.slb.com/-/media/files/cameron/product-catalogs/wkm-370-gate-valve.pdf" },
    { company: "Cameron", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Cameron T-31 Trunnion", rating: 5, image: "https://cdn.thomasnet.com/ccp/30138640/156767.jpg", dataSheet: "https://www.slb.com/-/media/files/cameron/product-catalogs/t31-ball-valve.pdf" },
    { company: "Cameron", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "WKM Piston Check", rating: 4, image: "https://cdn.thomasnet.com/ccp/30138640/156768.jpg", dataSheet: "https://www.slb.com/-/media/files/cameron/product-catalogs/wkm-piston-check-valve.pdf" },
    { company: "Cameron", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "WKM 350 Series", rating: 5, image: "https://cdn.thomasnet.com/ccp/30138640/156769.jpg", dataSheet: "https://www.slb.com/-/media/files/cameron/product-catalogs/wkm-350-gate-valve.pdf" },

    // Flowserve - Brass Materials
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "Durco Mark 3", rating: 5, image: "https://www.flowserve.com/sites/default/files/2018-08/durco-mark-3.jpg", dataSheet: "https://www.flowserve.com/en/products/valves/durco-mark-3-datasheet" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "Worcester 39 Series", rating: 4, image: "https://www.flowserve.com/sites/default/files/2018-08/worcester-39-series.jpg", dataSheet: "https://www.flowserve.com/en/products/valves/worcester-39-datasheet" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Worcester R-Series", rating: 5, image: "https://www.flowserve.com/sites/default/files/2018-08/worcester-r-series.jpg", dataSheet: "https://www.flowserve.com/en/products/valves/worcester-r-series-datasheet" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Atomac HP", rating: 4, image: "https://www.flowserve.com/sites/default/files/2018-08/atomac-hp.jpg", dataSheet: "https://www.flowserve.com/en/products/valves/atomac-hp-datasheet" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Valtek Mark One", rating: 5, image: "https://www.flowserve.com/sites/default/files/2018-08/valtek-mark-one.jpg", dataSheet: "https://www.flowserve.com/en/products/valves/valtek-mark-one-datasheet" },

    // Baker Hughes - Cast Iron Materials
    { company: "Baker Hughes", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "Masoneilan 8800", rating: 5, image: "https://www.bakerhughes.com/sites/bakerhughes/files/masoneilan-8800.jpg", dataSheet: "https://www.bakerhughes.com/masoneilan-8800-datasheet" },
    { company: "Baker Hughes", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Masoneilan Camflex II", rating: 5, image: "https://www.bakerhughes.com/sites/bakerhughes/files/masoneilan-camflex-ii.jpg", dataSheet: "https://www.bakerhughes.com/masoneilan-camflex-ii-datasheet" },
    { company: "Baker Hughes", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Safety Valve", product: "Consolidated 1900 Series", rating: 5, image: "https://www.bakerhughes.com/sites/bakerhughes/files/consolidated-1900.jpg", dataSheet: "https://www.bakerhughes.com/consolidated-1900-datasheet" },
    { company: "Baker Hughes", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Bently 3-Way", rating: 4, image: "https://www.bakerhughes.com/sites/bakerhughes/files/bently-3way.jpg", dataSheet: "https://www.bakerhughes.com/bently-3way-datasheet" },

    // Velan - Duplex Stainless Materials
    { company: "Velan", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "Velan ABV Series", rating: 5, image: "https://www.velan.com/sites/default/files/styles/product_image/public/velan-abv-series.jpg", dataSheet: "https://www.velan.com/en/products/abv-series-datasheet" },
    { company: "Velan", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "Velan HP Globe", rating: 4, image: "https://www.velan.com/sites/default/files/styles/product_image/public/velan-hp-globe.jpg", dataSheet: "https://www.velan.com/en/products/hp-globe-datasheet" },
    { company: "Velan", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "Velan Swing Check", rating: 4, image: "https://www.velan.com/sites/default/files/styles/product_image/public/velan-swing-check.jpg", dataSheet: "https://www.velan.com/en/products/swing-check-datasheet" },
    { company: "Velan", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Velan VTP Series", rating: 5, image: "https://www.velan.com/sites/default/files/styles/product_image/public/velan-vtp.jpg", dataSheet: "https://www.velan.com/en/products/vtp-series-datasheet" },

    // Crane - Bronze Materials
    { company: "Crane", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "Crane 400 Series", rating: 4, image: "https://cranevalves.com/wp-content/uploads/2021/05/crane-400-series.jpg", dataSheet: "https://cranevalves.com/datasheets/crane-400-series.pdf" },
    { company: "Crane", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "Crane 300 Series", rating: 4, image: "https://cranevalves.com/wp-content/uploads/2021/05/crane-300-series.jpg", dataSheet: "https://cranevalves.com/datasheets/crane-300-series.pdf" },
    { company: "Crane", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Crane Pacific", rating: 5, image: "https://cranevalves.com/wp-content/uploads/2021/05/crane-pacific.jpg", dataSheet: "https://cranevalves.com/datasheets/crane-pacific.pdf" },
    { company: "Crane", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "Crane Dual Plate", rating: 4, image: "https://cranevalves.com/wp-content/uploads/2021/05/crane-dual-plate.jpg", dataSheet: "https://cranevalves.com/datasheets/crane-dual-plate.pdf" },

    // Parker Hannifin - Aluminum Materials
    { company: "Parker Hannifin", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Parker BV Series", rating: 5, image: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_4-BV.jpg", dataSheet: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_4-BV.pdf" },
    { company: "Parker Hannifin", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Needle Valve", product: "Parker 4N Series", rating: 5, image: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_4N.jpg", dataSheet: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_4N.pdf" },
    { company: "Parker Hannifin", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "Parker CV Series", rating: 4, image: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_CV.jpg", dataSheet: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_CV.pdf" },
    { company: "Parker Hannifin", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Solenoid Valve", product: "Parker Skinner", rating: 5, image: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_Skinner.jpg", dataSheet: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_Skinner.pdf" },

    // IMI Critical Engineering - Alloy Steel Materials
    { company: "IMI Critical", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "IMI CCI Drag", rating: 5, image: "https://www.imi-critical.com/sites/default/files/cci-drag-valve.jpg", dataSheet: "https://www.imi-critical.com/cci-drag-datasheet.pdf" },
    { company: "IMI Critical", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Safety Valve", product: "IMI Truflo", rating: 5, image: "https://www.imi-critical.com/sites/default/files/truflo-valve.jpg", dataSheet: "https://www.imi-critical.com/truflo-datasheet.pdf" },
    { company: "IMI Critical", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "IMI Severe Service", rating: 4, image: "https://www.imi-critical.com/sites/default/files/severe-service-valve.jpg", dataSheet: "https://www.imi-critical.com/severe-service-datasheet.pdf" },

    // Neles (Valmet) - Stainless Steel Materials
    { company: "Neles", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Neles Neldisc", rating: 5, image: "https://www.neles.com/globalassets/images/products/neldisc-valve.jpg", dataSheet: "https://www.neles.com/datasheets/neldisc-datasheet.pdf" },
    { company: "Neles", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Neles Globe", rating: 5, image: "https://www.neles.com/globalassets/images/products/neles-globe-valve.jpg", dataSheet: "https://www.neles.com/datasheets/neles-globe-datasheet.pdf" },
    { company: "Neles", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Neles Easyflow", rating: 4, image: "https://www.neles.com/globalassets/images/products/easyflow-valve.jpg", dataSheet: "https://www.neles.com/datasheets/easyflow-datasheet.pdf" },

    // Metso - Titanium Materials
    { company: "Metso", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Metso Neles Q-Series", rating: 5, image: "https://www.metso.com/globalassets/images/products/q-series-valve.jpg", dataSheet: "https://www.metso.com/datasheets/q-series-datasheet.pdf" },
    { company: "Metso", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Metso ND9000", rating: 4, image: "https://www.metso.com/globalassets/images/products/nd9000-valve.jpg", dataSheet: "https://www.metso.com/datasheets/nd9000-datasheet.pdf" },
    { company: "Metso", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Metso V-Series", rating: 5, image: "https://www.metso.com/globalassets/images/products/v-series-valve.jpg", dataSheet: "https://www.metso.com/datasheets/v-series-datasheet.pdf" },

    // KSB - Ductile Iron Materials
    { company: "KSB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "KSB BOA-W", rating: 5, image: "https://www.ksb.com/blob/ksb-com/112896/data/BOA-W-gate-valve.jpg", dataSheet: "https://www.ksb.com/datasheets/boa-w-datasheet.pdf" },
    { company: "KSB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "KSB NORI Series", rating: 4, image: "https://www.ksb.com/blob/ksb-com/112897/data/NORI-globe-valve.jpg", dataSheet: "https://www.ksb.com/datasheets/nori-datasheet.pdf" },
    { company: "KSB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "KSB BOAX-W", rating: 4, image: "https://www.ksb.com/blob/ksb-com/112898/data/BOAX-W-check-valve.jpg", dataSheet: "https://www.ksb.com/datasheets/boax-w-datasheet.pdf" },

    // Swagelok - 316 Stainless Steel Materials
    { company: "Swagelok", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Swagelok SS Series", rating: 5, image: "https://www.swagelok.com/images/products/ball-valves/ss-series-ball-valve.jpg", dataSheet: "https://www.swagelok.com/datasheets/ss-series-ball-valve.pdf" },
    { company: "Swagelok", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Needle Valve", product: "Swagelok 31 Series", rating: 5, image: "https://www.swagelok.com/images/products/needle-valves/31-series-needle-valve.jpg", dataSheet: "https://www.swagelok.com/datasheets/31-series-needle-valve.pdf" },
    { company: "Swagelok", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "Swagelok CH Series", rating: 5, image: "https://www.swagelok.com/images/products/check-valves/ch-series-check-valve.jpg", dataSheet: "https://www.swagelok.com/datasheets/ch-series-check-valve.pdf" },

    // Tyco (Pentair) - Cast Steel Materials
    { company: "Tyco", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Tyco HP-W Series", rating: 4, image: "https://www.pentair.com/content/dam/extranet/nam/pentair-valves-controls/products/tyco-hp-w.jpg", dataSheet: "https://www.pentair.com/datasheets/tyco-hp-w.pdf" },
    { company: "Tyco", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Tyco Keystone", rating: 5, image: "https://www.pentair.com/content/dam/extranet/nam/pentair-valves-controls/products/tyco-keystone.jpg", dataSheet: "https://www.pentair.com/datasheets/tyco-keystone.pdf" },

    // CIRCOR - Forged Steel Materials
    { company: "CIRCOR", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "KF API 6A", rating: 5, image: "https://www.circor.com/sites/default/files/kf-api-6a-valve.jpg", dataSheet: "https://www.circor.com/datasheets/kf-api-6a.pdf" },
    { company: "CIRCOR", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Spence D-2000", rating: 4, image: "https://www.circor.com/sites/default/files/spence-d2000-valve.jpg", dataSheet: "https://www.circor.com/datasheets/spence-d2000.pdf" },

    // Asco (Emerson) - Brass & Stainless Materials
    { company: "Asco", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Solenoid Valve", product: "Asco 8320 Series", rating: 5, image: "https://www.emerson.com/documents/automation/product-catalog-asco-8320-series-en-123844.pdf.image.jpg", dataSheet: "https://www.emerson.com/documents/automation/product-catalog-asco-8320-series-en-123844.pdf" },
    { company: "Asco", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Process Valve", product: "Asco Numatics", rating: 4, image: "https://www.emerson.com/documents/automation/product-catalog-asco-numatics-en-123845.pdf.image.jpg", dataSheet: "https://www.emerson.com/documents/automation/product-catalog-asco-numatics-en-123845.pdf" },
  ];

  const pumpProducts = [
    // Grundfos - Centrifugal Pumps
    { company: "Grundfos", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Centrifugal Pump", product: "Grundfos CR Series", rating: 5, image: "https://product-selection.grundfos.com/img/CR_cutmodel_99177762.jpg", dataSheet: "https://www.grundfos.com/products/cr-cre-cri-crie-crn-crne.pdf" },
    { company: "Grundfos", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Multistage Pump", product: "Grundfos CRN Series", rating: 5, image: "https://product-selection.grundfos.com/img/CRN_cutmodel_99177763.jpg", dataSheet: "https://www.grundfos.com/products/crn-series.pdf" },
    { company: "Grundfos", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Submersible Pump", product: "Grundfos SP Series", rating: 5, image: "https://product-selection.grundfos.com/img/SP_cutmodel_99177764.jpg", dataSheet: "https://www.grundfos.com/products/sp-series.pdf" },
    { company: "Grundfos", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Booster Pump", product: "Grundfos CME Series", rating: 4, image: "https://product-selection.grundfos.com/img/CME_cutmodel_99177765.jpg", dataSheet: "https://www.grundfos.com/products/cme-series.pdf" },

    // KSB - Industrial Pumps
    { company: "KSB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "End Suction Pump", product: "KSB Etanorm", rating: 5, image: "https://www.ksb.com/blob/ksb-com/112900/data/etanorm-pump.jpg", dataSheet: "https://www.ksb.com/datasheets/etanorm.pdf" },
    { company: "KSB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Multistage Pump", product: "KSB Multitec", rating: 5, image: "https://www.ksb.com/blob/ksb-com/112901/data/multitec-pump.jpg", dataSheet: "https://www.ksb.com/datasheets/multitec.pdf" },
    { company: "KSB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Split Case Pump", product: "KSB Omega", rating: 4, image: "https://www.ksb.com/blob/ksb-com/112902/data/omega-pump.jpg", dataSheet: "https://www.ksb.com/datasheets/omega.pdf" },
    { company: "KSB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Chemical Pump", product: "KSB Etachrom", rating: 5, image: "https://www.ksb.com/blob/ksb-com/112903/data/etachrom-pump.jpg", dataSheet: "https://www.ksb.com/datasheets/etachrom.pdf" },

    // Flowserve - Process Pumps
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "ANSI Pump", product: "Flowserve Durco Mark 3", rating: 5, image: "https://www.flowserve.com/sites/default/files/2018-08/durco-mark-3-pump.jpg", dataSheet: "https://www.flowserve.com/durco-mark-3-pump-datasheet.pdf" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "API Pump", product: "Flowserve Durco BK", rating: 5, image: "https://www.flowserve.com/sites/default/files/2018-08/durco-bk-pump.jpg", dataSheet: "https://www.flowserve.com/durco-bk-pump-datasheet.pdf" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Vertical Pump", product: "Flowserve IDP", rating: 4, image: "https://www.flowserve.com/sites/default/files/2018-08/idp-pump.jpg", dataSheet: "https://www.flowserve.com/idp-pump-datasheet.pdf" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Slurry Pump", product: "Flowserve Wilson Snyder", rating: 5, image: "https://www.flowserve.com/sites/default/files/2018-08/wilson-snyder-pump.jpg", dataSheet: "https://www.flowserve.com/wilson-snyder-pump-datasheet.pdf" },

    // Sulzer - Heavy Duty Pumps
    { company: "Sulzer", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Process Pump", product: "Sulzer CPT Series", rating: 5, image: "https://www.sulzer.com/-/media/Images/Products/Pumps/cpt-series.jpg", dataSheet: "https://www.sulzer.com/datasheets/cpt-series.pdf" },
    { company: "Sulzer", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Multistage Pump", product: "Sulzer MSD Series", rating: 5, image: "https://www.sulzer.com/-/media/Images/Products/Pumps/msd-series.jpg", dataSheet: "https://www.sulzer.com/datasheets/msd-series.pdf" },
    { company: "Sulzer", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "API Pump", product: "Sulzer HPT Series", rating: 4, image: "https://www.sulzer.com/-/media/Images/Products/Pumps/hpt-series.jpg", dataSheet: "https://www.sulzer.com/datasheets/hpt-series.pdf" },
    { company: "Sulzer", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Slurry Pump", product: "Sulzer AHP Series", rating: 5, image: "https://www.sulzer.com/-/media/Images/Products/Pumps/ahp-series.jpg", dataSheet: "https://www.sulzer.com/datasheets/ahp-series.pdf" },

    // Xylem (Bell & Gossett) - HVAC Pumps
    { company: "Xylem", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Circulator Pump", product: "Bell & Gossett Series 100", rating: 5, image: "https://www.xylem.com/siteassets/brand/bell-gossett/products/series-100.jpg", dataSheet: "https://www.xylem.com/datasheets/series-100.pdf" },
    { company: "Xylem", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "In-Line Pump", product: "Bell & Gossett e1510", rating: 4, image: "https://www.xylem.com/siteassets/brand/bell-gossett/products/e1510.jpg", dataSheet: "https://www.xylem.com/datasheets/e1510.pdf" },
    { company: "Xylem", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Split Case Pump", product: "Bell & Gossett VSX", rating: 5, image: "https://www.xylem.com/siteassets/brand/bell-gossett/products/vsx.jpg", dataSheet: "https://www.xylem.com/datasheets/vsx.pdf" },

    // Wilo - Building Services Pumps
    { company: "Wilo", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Circulator Pump", product: "Wilo-Stratos PICO", rating: 5, image: "https://wilo.com/dam/jcr/stratos-pico.jpg", dataSheet: "https://wilo.com/datasheets/stratos-pico.pdf" },
    { company: "Wilo", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Inline Pump", product: "Wilo-VeroLine IPL", rating: 4, image: "https://wilo.com/dam/jcr/veroline-ipl.jpg", dataSheet: "https://wilo.com/datasheets/veroline-ipl.pdf" },
    { company: "Wilo", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Booster Pump", product: "Wilo-Economy MHIL", rating: 5, image: "https://wilo.com/dam/jcr/economy-mhil.jpg", dataSheet: "https://wilo.com/datasheets/economy-mhil.pdf" },

    // ITT Goulds - Industrial Pumps
    { company: "ITT Goulds", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "ANSI Pump", product: "Goulds 3196", rating: 5, image: "https://www.itt.com/goulds/products/3196-pump.jpg", dataSheet: "https://www.itt.com/goulds/datasheets/3196.pdf" },
    { company: "ITT Goulds", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "API Pump", product: "Goulds 3700", rating: 5, image: "https://www.itt.com/goulds/products/3700-pump.jpg", dataSheet: "https://www.itt.com/goulds/datasheets/3700.pdf" },
    { company: "ITT Goulds", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Slurry Pump", product: "Goulds XHD", rating: 4, image: "https://www.itt.com/goulds/products/xhd-pump.jpg", dataSheet: "https://www.itt.com/goulds/datasheets/xhd.pdf" },

    // Ebara - Water Treatment Pumps
    { company: "Ebara", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Submersible Pump", product: "Ebara DW Series", rating: 5, image: "https://www.ebara.com/products/dw-series.jpg", dataSheet: "https://www.ebara.com/datasheets/dw-series.pdf" },
    { company: "Ebara", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Vertical Pump", product: "Ebara EVS Series", rating: 4, image: "https://www.ebara.com/products/evs-series.jpg", dataSheet: "https://www.ebara.com/datasheets/evs-series.pdf" },

    // Pentair - Pool & Water Pumps
    { company: "Pentair", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Centrifugal Pump", product: "Pentair Berkeley B Series", rating: 5, image: "https://www.pentair.com/content/dam/pentair/products/berkeley-b-series.jpg", dataSheet: "https://www.pentair.com/datasheets/berkeley-b-series.pdf" },
    { company: "Pentair", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Turbine Pump", product: "Pentair Aurora 540", rating: 4, image: "https://www.pentair.com/content/dam/pentair/products/aurora-540.jpg", dataSheet: "https://www.pentair.com/datasheets/aurora-540.pdf" },

    // Tsurumi - Submersible Pumps
    { company: "Tsurumi", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Submersible Pump", product: "Tsurumi KTZ Series", rating: 5, image: "https://www.tsurumipump.com/products/ktz-series.jpg", dataSheet: "https://www.tsurumipump.com/datasheets/ktz-series.pdf" },
    { company: "Tsurumi", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Dewatering Pump", product: "Tsurumi LB Series", rating: 4, image: "https://www.tsurumipump.com/products/lb-series.jpg", dataSheet: "https://www.tsurumipump.com/datasheets/lb-series.pdf" },

    // Ruhrpumpen - Oil & Gas Pumps
    { company: "Ruhrpumpen", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "API Pump", product: "Ruhrpumpen RGO Series", rating: 5, image: "https://www.ruhrpumpen.com/products/rgo-series.jpg", dataSheet: "https://www.ruhrpumpen.com/datasheets/rgo-series.pdf" },
    { company: "Ruhrpumpen", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Pipeline Pump", product: "Ruhrpumpen RVP Series", rating: 4, image: "https://www.ruhrpumpen.com/products/rvp-series.jpg", dataSheet: "https://www.ruhrpumpen.com/datasheets/rvp-series.pdf" },

    // Weir - Mining Pumps
    { company: "Weir", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Slurry Pump", product: "Weir Warman AH", rating: 5, image: "https://www.global.weir/products/warman-ah.jpg", dataSheet: "https://www.global.weir/datasheets/warman-ah.pdf" },
    { company: "Weir", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Vertical Pump", product: "Weir Hazleton SP", rating: 4, image: "https://www.global.weir/products/hazleton-sp.jpg", dataSheet: "https://www.global.weir/datasheets/hazleton-sp.pdf" },
  ];

  const products = selectedCategory === "Valves" ? valveProducts : selectedCategory === "Pumps" ? pumpProducts : [];

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
      <button className="fixed bottom-28 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg z-40">
        <Camera className="w-6 h-6" />
      </button>

      <BottomNav />
    </div>
  );
};

export default Materials;
