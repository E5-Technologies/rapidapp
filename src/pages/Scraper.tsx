import { ManufacturerDataScraper } from "@/components/ManufacturerDataScraper";
import BottomNav from "@/components/BottomNav";

const Scraper = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Data Scraper</h1>
        <ManufacturerDataScraper />
      </div>
      <BottomNav />
    </div>
  );
};

export default Scraper;
