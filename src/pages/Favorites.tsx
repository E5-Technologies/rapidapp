import { Settings, Heart } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import logo from "@/assets/rapid-logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


interface FavoriteMaterial {
  id: string;
  title: string;
  product_name: string;
  category: string;
  manufacturer_id: string;
  image_url?: string;
  rating: number;
}

const Favorites = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [favorites, setFavorites] = useState<FavoriteMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      fetchFavorites();
    }
  }, [session]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          material_id,
          materials (
            id,
            title,
            product_name,
            category,
            manufacturer_id,
            image_url,
            rating
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const materialsData = data
        ?.map((fav: any) => fav.materials)
        .filter(Boolean) as FavoriteMaterial[];
      
      setFavorites(materialsData || []);
    } catch (error: any) {
      toast.error("Error loading favorites");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (materialId: string) => {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("material_id", materialId);

      if (error) throw error;
      
      setFavorites(favorites.filter(f => f.id !== materialId));
      toast.success("Removed from favorites");
    } catch (error: any) {
      toast.error("Error removing favorite");
    }
  };

  if (!session) {
    return null;
  }

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
        
        <div className="flex items-center justify-between px-4 py-1">
          <div className="w-5" />
          <img src={logo} alt="Rapid Logo" className="h-10 w-auto" />
          <Link to="/settings">
            <Settings className="w-5 h-5 text-foreground hover:text-primary transition-colors" />
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold px-4 py-2">Favorites</h1>
      </div>

      {/* Favorites List */}
      <div className="px-4 mt-4 space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading favorites...</p>
        ) : favorites.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No favorites yet</h3>
              <p className="text-sm text-muted-foreground">
                Start adding materials to your favorites
              </p>
            </CardContent>
          </Card>
        ) : (
          favorites.map((material) => (
            <Card key={material.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {material.image_url && (
                    <img
                      src={material.image_url}
                      alt={material.product_name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{material.product_name}</h3>
                    <p className="text-sm text-muted-foreground">{material.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{material.category}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-sm">⭐</span>
                      <span className="text-sm">{Number(material.rating).toFixed(1)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFavorite(material.id)}
                    className="text-destructive"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Favorites;
