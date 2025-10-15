import { Camera } from "lucide-react";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import CategoryScroll from "@/components/CategoryScroll";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";

const Materials = () => {
  const [selectedCategory, setSelectedCategory] = useState("Valves");

  const valveProducts = [
    // Emerson (Fisher)
    { company: "Emerson", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Fisher EZ Series", rating: 5, image: "https://images.unsplash.com/photo-1634128221889-82ed6efebfc3?w=300&h=200&fit=crop" },
    { company: "Emerson", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "Fisher ED Series", rating: 5, image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=300&h=200&fit=crop" },
    { company: "Emerson", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Fisher Vee-Ball V150", rating: 5, image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop" },
    { company: "Emerson", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Fisher 8560 Series", rating: 4, image: "https://images.unsplash.com/photo-1635322966219-b75ed0c0d52c?w=300&h=200&fit=crop" },
    
    // Cameron (Schlumberger)
    { company: "Cameron", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "WKM 370 Series", rating: 5, image: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=300&h=200&fit=crop" },
    { company: "Cameron", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Cameron T-31 Trunnion", rating: 5, image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop" },
    { company: "Cameron", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "WKM Piston Check", rating: 4, image: "https://images.unsplash.com/photo-1635322966219-b75ed0c0d52c?w=300&h=200&fit=crop" },
    { company: "Cameron", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "WKM 350 Series", rating: 5, image: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=300&h=200&fit=crop" },

    // Flowserve
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "Durco Mark 3", rating: 5, image: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=300&h=200&fit=crop" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "Worcester 39 Series", rating: 4, image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=300&h=200&fit=crop" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Worcester R-Series", rating: 5, image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Atomac HP", rating: 4, image: "https://images.unsplash.com/photo-1635322966219-b75ed0c0d52c?w=300&h=200&fit=crop" },
    { company: "Flowserve", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Valtek Mark One", rating: 5, image: "https://images.unsplash.com/photo-1634128221889-82ed6efebfc3?w=300&h=200&fit=crop" },

    // Baker Hughes
    { company: "Baker Hughes", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "Masoneilan 8800", rating: 5, image: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=300&h=200&fit=crop" },
    { company: "Baker Hughes", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Masoneilan Camflex II", rating: 5, image: "https://images.unsplash.com/photo-1634128221889-82ed6efebfc3?w=300&h=200&fit=crop" },
    { company: "Baker Hughes", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Safety Valve", product: "Consolidated 1900 Series", rating: 5, image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300&h=200&fit=crop" },
    { company: "Baker Hughes", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Bently 3-Way", rating: 4, image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop" },

    // Velan
    { company: "Velan", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "Velan ABV Series", rating: 5, image: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=300&h=200&fit=crop" },
    { company: "Velan", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "Velan HP Globe", rating: 4, image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=300&h=200&fit=crop" },
    { company: "Velan", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "Velan Swing Check", rating: 4, image: "https://images.unsplash.com/photo-1635322966219-b75ed0c0d52c?w=300&h=200&fit=crop" },
    { company: "Velan", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Velan VTP Series", rating: 5, image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop" },

    // Crane
    { company: "Crane", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "Crane 400 Series", rating: 4, image: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=300&h=200&fit=crop" },
    { company: "Crane", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "Crane 300 Series", rating: 4, image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=300&h=200&fit=crop" },
    { company: "Crane", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Crane Pacific", rating: 5, image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop" },
    { company: "Crane", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "Crane Dual Plate", rating: 4, image: "https://images.unsplash.com/photo-1635322966219-b75ed0c0d52c?w=300&h=200&fit=crop" },

    // Parker Hannifin
    { company: "Parker Hannifin", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Parker BV Series", rating: 5, image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop" },
    { company: "Parker Hannifin", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Needle Valve", product: "Parker 4N Series", rating: 5, image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=200&fit=crop" },
    { company: "Parker Hannifin", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "Parker CV Series", rating: 4, image: "https://images.unsplash.com/photo-1635322966219-b75ed0c0d52c?w=300&h=200&fit=crop" },
    { company: "Parker Hannifin", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Solenoid Valve", product: "Parker Skinner", rating: 5, image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300&h=200&fit=crop" },

    // IMI Critical Engineering
    { company: "IMI Critical", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "IMI CCI Drag", rating: 5, image: "https://images.unsplash.com/photo-1634128221889-82ed6efebfc3?w=300&h=200&fit=crop" },
    { company: "IMI Critical", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Safety Valve", product: "IMI Truflo", rating: 5, image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300&h=200&fit=crop" },
    { company: "IMI Critical", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "IMI Severe Service", rating: 4, image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop" },

    // Neles (Valmet)
    { company: "Neles", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Neles Neldisc", rating: 5, image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop" },
    { company: "Neles", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Neles Globe", rating: 5, image: "https://images.unsplash.com/photo-1634128221889-82ed6efebfc3?w=300&h=200&fit=crop" },
    { company: "Neles", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Neles Easyflow", rating: 4, image: "https://images.unsplash.com/photo-1635322966219-b75ed0c0d52c?w=300&h=200&fit=crop" },

    // Metso
    { company: "Metso", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Metso Neles Q-Series", rating: 5, image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop" },
    { company: "Metso", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Metso ND9000", rating: 4, image: "https://images.unsplash.com/photo-1635322966219-b75ed0c0d52c?w=300&h=200&fit=crop" },
    { company: "Metso", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Control Valve", product: "Metso V-Series", rating: 5, image: "https://images.unsplash.com/photo-1634128221889-82ed6efebfc3?w=300&h=200&fit=crop" },

    // KSB
    { company: "KSB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "KSB BOA-W", rating: 5, image: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=300&h=200&fit=crop" },
    { company: "KSB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Globe Valve", product: "KSB NORI Series", rating: 4, image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=300&h=200&fit=crop" },
    { company: "KSB", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "KSB BOAX-W", rating: 4, image: "https://images.unsplash.com/photo-1635322966219-b75ed0c0d52c?w=300&h=200&fit=crop" },

    // Swagelok
    { company: "Swagelok", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Swagelok SS Series", rating: 5, image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop" },
    { company: "Swagelok", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Needle Valve", product: "Swagelok 31 Series", rating: 5, image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=200&fit=crop" },
    { company: "Swagelok", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Check Valve", product: "Swagelok CH Series", rating: 5, image: "https://images.unsplash.com/photo-1635322966219-b75ed0c0d52c?w=300&h=200&fit=crop" },

    // Tyco (Pentair)
    { company: "Tyco", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Butterfly Valve", product: "Tyco HP-W Series", rating: 4, image: "https://images.unsplash.com/photo-1635322966219-b75ed0c0d52c?w=300&h=200&fit=crop" },
    { company: "Tyco", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Tyco Keystone", rating: 5, image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop" },

    // CIRCOR
    { company: "CIRCOR", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Gate Valve", product: "KF API 6A", rating: 5, image: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=300&h=200&fit=crop" },
    { company: "CIRCOR", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Ball Valve", product: "Spence D-2000", rating: 4, image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop" },

    // Asco (Emerson)
    { company: "Asco", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Solenoid Valve", product: "Asco 8320 Series", rating: 5, image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300&h=200&fit=crop" },
    { company: "Asco", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", title: "Process Valve", product: "Asco Numatics", rating: 4, image: "https://images.unsplash.com/photo-1634128221889-82ed6efebfc3?w=300&h=200&fit=crop" },
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
