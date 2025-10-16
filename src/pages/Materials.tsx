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
    { company: "Emerson", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Fisher EZ Series", rating: 5, image: "https://www.emerson.com/documents/automation/product-catalog-fisher-ez-valve-en-122052.pdf.image.jpg" },
    { company: "Emerson", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "Fisher ED Series", rating: 5, image: "https://www.emerson.com/documents/automation/product-catalog-fisher-ed-valve-en-123842.pdf.image.jpg" },
    { company: "Emerson", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Fisher Vee-Ball V150", rating: 5, image: "https://www.emerson.com/documents/automation/product-catalog-fisher-v150-v200-v300-vee-ball-valve-en-123656.pdf.image.jpg" },
    { company: "Emerson", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Fisher 8560 Series", rating: 4, image: "https://www.emerson.com/documents/automation/product-catalog-fisher-8560-control-valve-en-123843.pdf.image.jpg" },
    
    // Cameron (Schlumberger) - Carbon Steel Materials
    { company: "Cameron", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "WKM 370 Series", rating: 5, image: "https://cdn.thomasnet.com/ccp/30138640/156766.jpg" },
    { company: "Cameron", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Cameron T-31 Trunnion", rating: 5, image: "https://cdn.thomasnet.com/ccp/30138640/156767.jpg" },
    { company: "Cameron", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "WKM Piston Check", rating: 4, image: "https://cdn.thomasnet.com/ccp/30138640/156768.jpg" },
    { company: "Cameron", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "WKM 350 Series", rating: 5, image: "https://cdn.thomasnet.com/ccp/30138640/156769.jpg" },

    // Flowserve - Brass Materials
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "Durco Mark 3", rating: 5, image: "https://www.flowserve.com/sites/default/files/2018-08/durco-mark-3.jpg" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "Worcester 39 Series", rating: 4, image: "https://www.flowserve.com/sites/default/files/2018-08/worcester-39-series.jpg" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Worcester R-Series", rating: 5, image: "https://www.flowserve.com/sites/default/files/2018-08/worcester-r-series.jpg" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Atomac HP", rating: 4, image: "https://www.flowserve.com/sites/default/files/2018-08/atomac-hp.jpg" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Valtek Mark One", rating: 5, image: "https://www.flowserve.com/sites/default/files/2018-08/valtek-mark-one.jpg" },

    // Baker Hughes - Cast Iron Materials
    { company: "Baker Hughes", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "Masoneilan 8800", rating: 5, image: "https://www.bakerhughes.com/sites/bakerhughes/files/masoneilan-8800.jpg" },
    { company: "Baker Hughes", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Masoneilan Camflex II", rating: 5, image: "https://www.bakerhughes.com/sites/bakerhughes/files/masoneilan-camflex-ii.jpg" },
    { company: "Baker Hughes", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Safety Valve", product: "Consolidated 1900 Series", rating: 5, image: "https://www.bakerhughes.com/sites/bakerhughes/files/consolidated-1900.jpg" },
    { company: "Baker Hughes", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Bently 3-Way", rating: 4, image: "https://www.bakerhughes.com/sites/bakerhughes/files/bently-3way.jpg" },

    // Velan - Duplex Stainless Materials
    { company: "Velan", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "Velan ABV Series", rating: 5, image: "https://www.velan.com/sites/default/files/styles/product_image/public/velan-abv-series.jpg" },
    { company: "Velan", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "Velan HP Globe", rating: 4, image: "https://www.velan.com/sites/default/files/styles/product_image/public/velan-hp-globe.jpg" },
    { company: "Velan", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "Velan Swing Check", rating: 4, image: "https://www.velan.com/sites/default/files/styles/product_image/public/velan-swing-check.jpg" },
    { company: "Velan", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Velan VTP Series", rating: 5, image: "https://www.velan.com/sites/default/files/styles/product_image/public/velan-vtp.jpg" },

    // Crane - Bronze Materials
    { company: "Crane", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "Crane 400 Series", rating: 4, image: "https://cranevalves.com/wp-content/uploads/2021/05/crane-400-series.jpg" },
    { company: "Crane", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "Crane 300 Series", rating: 4, image: "https://cranevalves.com/wp-content/uploads/2021/05/crane-300-series.jpg" },
    { company: "Crane", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Crane Pacific", rating: 5, image: "https://cranevalves.com/wp-content/uploads/2021/05/crane-pacific.jpg" },
    { company: "Crane", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "Crane Dual Plate", rating: 4, image: "https://cranevalves.com/wp-content/uploads/2021/05/crane-dual-plate.jpg" },

    // Parker Hannifin - Aluminum Materials
    { company: "Parker Hannifin", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Parker BV Series", rating: 5, image: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_4-BV.jpg" },
    { company: "Parker Hannifin", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Needle Valve", product: "Parker 4N Series", rating: 5, image: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_4N.jpg" },
    { company: "Parker Hannifin", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "Parker CV Series", rating: 4, image: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_CV.jpg" },
    { company: "Parker Hannifin", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Solenoid Valve", product: "Parker Skinner", rating: 5, image: "https://www.parker.com/Literature/Instrumentation%20Products%20Division/Catalogs/Catalog_Skinner.jpg" },

    // IMI Critical Engineering - Alloy Steel Materials
    { company: "IMI Critical", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "IMI CCI Drag", rating: 5, image: "https://www.imi-critical.com/sites/default/files/cci-drag-valve.jpg" },
    { company: "IMI Critical", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Safety Valve", product: "IMI Truflo", rating: 5, image: "https://www.imi-critical.com/sites/default/files/truflo-valve.jpg" },
    { company: "IMI Critical", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "IMI Severe Service", rating: 4, image: "https://www.imi-critical.com/sites/default/files/severe-service-valve.jpg" },

    // Neles (Valmet) - Stainless Steel Materials
    { company: "Neles", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Neles Neldisc", rating: 5, image: "https://www.neles.com/globalassets/images/products/neldisc-valve.jpg" },
    { company: "Neles", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Neles Globe", rating: 5, image: "https://www.neles.com/globalassets/images/products/neles-globe-valve.jpg" },
    { company: "Neles", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Neles Easyflow", rating: 4, image: "https://www.neles.com/globalassets/images/products/easyflow-valve.jpg" },

    // Metso - Titanium Materials
    { company: "Metso", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Metso Neles Q-Series", rating: 5, image: "https://www.metso.com/globalassets/images/products/q-series-valve.jpg" },
    { company: "Metso", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Metso ND9000", rating: 4, image: "https://www.metso.com/globalassets/images/products/nd9000-valve.jpg" },
    { company: "Metso", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Metso V-Series", rating: 5, image: "https://www.metso.com/globalassets/images/products/v-series-valve.jpg" },

    // KSB - Ductile Iron Materials
    { company: "KSB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "KSB BOA-W", rating: 5, image: "https://www.ksb.com/blob/ksb-com/112896/data/BOA-W-gate-valve.jpg" },
    { company: "KSB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "KSB NORI Series", rating: 4, image: "https://www.ksb.com/blob/ksb-com/112897/data/NORI-globe-valve.jpg" },
    { company: "KSB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "KSB BOAX-W", rating: 4, image: "https://www.ksb.com/blob/ksb-com/112898/data/BOAX-W-check-valve.jpg" },

    // Swagelok - 316 Stainless Steel Materials
    { company: "Swagelok", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Swagelok SS Series", rating: 5, image: "https://www.swagelok.com/images/products/ball-valves/ss-series-ball-valve.jpg" },
    { company: "Swagelok", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Needle Valve", product: "Swagelok 31 Series", rating: 5, image: "https://www.swagelok.com/images/products/needle-valves/31-series-needle-valve.jpg" },
    { company: "Swagelok", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "Swagelok CH Series", rating: 5, image: "https://www.swagelok.com/images/products/check-valves/ch-series-check-valve.jpg" },

    // Tyco (Pentair) - Cast Steel Materials
    { company: "Tyco", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Tyco HP-W Series", rating: 4, image: "https://www.pentair.com/content/dam/extranet/nam/pentair-valves-controls/products/tyco-hp-w.jpg" },
    { company: "Tyco", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Tyco Keystone", rating: 5, image: "https://www.pentair.com/content/dam/extranet/nam/pentair-valves-controls/products/tyco-keystone.jpg" },

    // CIRCOR - Forged Steel Materials
    { company: "CIRCOR", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "KF API 6A", rating: 5, image: "https://www.circor.com/sites/default/files/kf-api-6a-valve.jpg" },
    { company: "CIRCOR", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Spence D-2000", rating: 4, image: "https://www.circor.com/sites/default/files/spence-d2000-valve.jpg" },

    // Asco (Emerson) - Brass & Stainless Materials
    { company: "Asco", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Solenoid Valve", product: "Asco 8320 Series", rating: 5, image: "https://www.emerson.com/documents/automation/product-catalog-asco-8320-series-en-123844.pdf.image.jpg" },
    { company: "Asco", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Process Valve", product: "Asco Numatics", rating: 4, image: "https://www.emerson.com/documents/automation/product-catalog-asco-numatics-en-123845.pdf.image.jpg" },
  ];

  const products = selectedCategory === "Valves" ? valveProducts : [];

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
