import { Camera } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import CategoryScroll from "@/components/CategoryScroll";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";

const Materials = () => {
  const products = [
    {
      company: "GRACO",
      logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
      title: "Title",
      product: "Flowserve",
      rating: 4,
      image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=200&fit=crop",
    },
    {
      company: "Flowserve",
      logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
      title: "Title",
      product: "Flowserve",
      rating: 4,
      image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=200&fit=crop",
    },
  ];

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
        <CategoryScroll />
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
