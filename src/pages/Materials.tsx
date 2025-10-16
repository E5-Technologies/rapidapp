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
    { company: "Emerson", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Fisher EZ Series", rating: 5, image: "https://images.unsplash.com/photo-1590698933947-a202b069a861?w=300&h=200&fit=crop" },
    { company: "Emerson", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "Fisher ED Series", rating: 5, image: "https://images.unsplash.com/photo-1607827448387-a67db1383b59?w=300&h=200&fit=crop" },
    { company: "Emerson", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Fisher Vee-Ball V150", rating: 5, image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=300&h=200&fit=crop" },
    { company: "Emerson", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Fisher 8560 Series", rating: 4, image: "https://images.unsplash.com/photo-1590698933947-a202b069a861?w=300&h=200&fit=crop" },
    
    // Cameron (Schlumberger) - Carbon Steel Materials
    { company: "Cameron", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "WKM 370 Series", rating: 5, image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=200&fit=crop" },
    { company: "Cameron", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Cameron T-31 Trunnion", rating: 5, image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=200&fit=crop" },
    { company: "Cameron", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "WKM Piston Check", rating: 4, image: "https://images.unsplash.com/photo-1594737626072-90dc274bc2bd?w=300&h=200&fit=crop" },
    { company: "Cameron", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "WKM 350 Series", rating: 5, image: "https://images.unsplash.com/photo-1594737626072-90dc274bc2bd?w=300&h=200&fit=crop" },

    // Flowserve - Brass Materials
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "Durco Mark 3", rating: 5, image: "https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?w=300&h=200&fit=crop" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "Worcester 39 Series", rating: 4, image: "https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?w=300&h=200&fit=crop" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Worcester R-Series", rating: 5, image: "https://images.unsplash.com/photo-1603893165193-3e2f9e8e7eab?w=300&h=200&fit=crop" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Atomac HP", rating: 4, image: "https://images.unsplash.com/photo-1603893165193-3e2f9e8e7eab?w=300&h=200&fit=crop" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Valtek Mark One", rating: 5, image: "https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?w=300&h=200&fit=crop" },

    // Baker Hughes - Cast Iron Materials
    { company: "Baker Hughes", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "Masoneilan 8800", rating: 5, image: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=300&h=200&fit=crop" },
    { company: "Baker Hughes", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Masoneilan Camflex II", rating: 5, image: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=300&h=200&fit=crop" },
    { company: "Baker Hughes", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Safety Valve", product: "Consolidated 1900 Series", rating: 5, image: "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=300&h=200&fit=crop" },
    { company: "Baker Hughes", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Bently 3-Way", rating: 4, image: "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=300&h=200&fit=crop" },

    // Velan - Duplex Stainless Materials
    { company: "Velan", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "Velan ABV Series", rating: 5, image: "https://images.unsplash.com/photo-1590698933947-a202b069a861?w=300&h=200&fit=crop" },
    { company: "Velan", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "Velan HP Globe", rating: 4, image: "https://images.unsplash.com/photo-1607827448387-a67db1383b59?w=300&h=200&fit=crop" },
    { company: "Velan", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "Velan Swing Check", rating: 4, image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=300&h=200&fit=crop" },
    { company: "Velan", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Velan VTP Series", rating: 5, image: "https://images.unsplash.com/photo-1590698933947-a202b069a861?w=300&h=200&fit=crop" },

    // Crane - Bronze Materials
    { company: "Crane", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "Crane 400 Series", rating: 4, image: "https://images.unsplash.com/photo-1603893165193-3e2f9e8e7eab?w=300&h=200&fit=crop" },
    { company: "Crane", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "Crane 300 Series", rating: 4, image: "https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?w=300&h=200&fit=crop" },
    { company: "Crane", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Crane Pacific", rating: 5, image: "https://images.unsplash.com/photo-1603893165193-3e2f9e8e7eab?w=300&h=200&fit=crop" },
    { company: "Crane", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "Crane Dual Plate", rating: 4, image: "https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?w=300&h=200&fit=crop" },

    // Parker Hannifin - Aluminum Materials
    { company: "Parker Hannifin", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Parker BV Series", rating: 5, image: "https://images.unsplash.com/photo-1564436872-f6d5a0bc7cb0?w=300&h=200&fit=crop" },
    { company: "Parker Hannifin", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Needle Valve", product: "Parker 4N Series", rating: 5, image: "https://images.unsplash.com/photo-1564436872-f6d5a0bc7cb0?w=300&h=200&fit=crop" },
    { company: "Parker Hannifin", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "Parker CV Series", rating: 4, image: "https://images.unsplash.com/photo-1605648916319-cf082f7524a1?w=300&h=200&fit=crop" },
    { company: "Parker Hannifin", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Solenoid Valve", product: "Parker Skinner", rating: 5, image: "https://images.unsplash.com/photo-1605648916319-cf082f7524a1?w=300&h=200&fit=crop" },

    // IMI Critical Engineering - Alloy Steel Materials
    { company: "IMI Critical", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "IMI CCI Drag", rating: 5, image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=200&fit=crop" },
    { company: "IMI Critical", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Safety Valve", product: "IMI Truflo", rating: 5, image: "https://images.unsplash.com/photo-1594737626072-90dc274bc2bd?w=300&h=200&fit=crop" },
    { company: "IMI Critical", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "IMI Severe Service", rating: 4, image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=200&fit=crop" },

    // Neles (Valmet) - Stainless Steel Materials
    { company: "Neles", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Neles Neldisc", rating: 5, image: "https://images.unsplash.com/photo-1607827448387-a67db1383b59?w=300&h=200&fit=crop" },
    { company: "Neles", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Neles Globe", rating: 5, image: "https://images.unsplash.com/photo-1590698933947-a202b069a861?w=300&h=200&fit=crop" },
    { company: "Neles", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Neles Easyflow", rating: 4, image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=300&h=200&fit=crop" },

    // Metso - Titanium Materials
    { company: "Metso", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Metso Neles Q-Series", rating: 5, image: "https://images.unsplash.com/photo-1564436872-f6d5a0bc7cb0?w=300&h=200&fit=crop" },
    { company: "Metso", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Metso ND9000", rating: 4, image: "https://images.unsplash.com/photo-1605648916319-cf082f7524a1?w=300&h=200&fit=crop" },
    { company: "Metso", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Metso V-Series", rating: 5, image: "https://images.unsplash.com/photo-1564436872-f6d5a0bc7cb0?w=300&h=200&fit=crop" },

    // KSB - Ductile Iron Materials
    { company: "KSB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "KSB BOA-W", rating: 5, image: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=300&h=200&fit=crop" },
    { company: "KSB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "KSB NORI Series", rating: 4, image: "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=300&h=200&fit=crop" },
    { company: "KSB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "KSB BOAX-W", rating: 4, image: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=300&h=200&fit=crop" },

    // Swagelok - 316 Stainless Steel Materials
    { company: "Swagelok", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Swagelok SS Series", rating: 5, image: "https://images.unsplash.com/photo-1590698933947-a202b069a861?w=300&h=200&fit=crop" },
    { company: "Swagelok", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Needle Valve", product: "Swagelok 31 Series", rating: 5, image: "https://images.unsplash.com/photo-1607827448387-a67db1383b59?w=300&h=200&fit=crop" },
    { company: "Swagelok", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "Swagelok CH Series", rating: 5, image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=300&h=200&fit=crop" },

    // Tyco (Pentair) - Cast Steel Materials
    { company: "Tyco", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Tyco HP-W Series", rating: 4, image: "https://images.unsplash.com/photo-1594737626072-90dc274bc2bd?w=300&h=200&fit=crop" },
    { company: "Tyco", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Tyco Keystone", rating: 5, image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=200&fit=crop" },

    // CIRCOR - Forged Steel Materials
    { company: "CIRCOR", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "KF API 6A", rating: 5, image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=200&fit=crop" },
    { company: "CIRCOR", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Spence D-2000", rating: 4, image: "https://images.unsplash.com/photo-1594737626072-90dc274bc2bd?w=300&h=200&fit=crop" },

    // Asco (Emerson) - Brass & Stainless Materials
    { company: "Asco", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Solenoid Valve", product: "Asco 8320 Series", rating: 5, image: "https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?w=300&h=200&fit=crop" },
    { company: "Asco", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Process Valve", product: "Asco Numatics", rating: 4, image: "https://images.unsplash.com/photo-1603893165193-3e2f9e8e7eab?w=300&h=200&fit=crop" },
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
