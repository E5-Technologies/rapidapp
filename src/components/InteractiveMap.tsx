import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InteractiveMapProps {
  userLocation: { lat: number; lng: number } | null;
  selectedLocation?: { lat: number; lng: number; name: string } | null;
}

const InteractiveMap = ({ userLocation, selectedLocation }: InteractiveMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const locationMarker = useRef<mapboxgl.Marker | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [needsToken, setNeedsToken] = useState(false);
  const [isLoadingToken, setIsLoadingToken] = useState(true);

  // Fetch token from backend on mount
  useEffect(() => {
    const fetchToken = async () => {
      try {
        // First check environment variable
        const envToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
        if (envToken && envToken !== '${MAPBOX_PUBLIC_TOKEN}' && !envToken.startsWith('${')) {
          setMapboxToken(envToken);
          setIsLoadingToken(false);
          return;
        }

        // Fetch from backend
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-mapbox-token`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            setMapboxToken(data.token);
            setIsLoadingToken(false);
            return;
          }
        }

        // Fallback to localStorage if backend fails
        const savedToken = localStorage.getItem('mapbox_token');
        if (savedToken) {
          setMapboxToken(savedToken);
        } else {
          setNeedsToken(true);
        }
      } catch (error) {
        console.error('Error fetching mapbox token:', error);
        // Fallback to localStorage on error
        const savedToken = localStorage.getItem('mapbox_token');
        if (savedToken) {
          setMapboxToken(savedToken);
        } else {
          setNeedsToken(true);
        }
      } finally {
        setIsLoadingToken(false);
      }
    };

    fetchToken();
  }, []);

  const handleTokenSubmit = () => {
    if (tokenInput.trim()) {
      localStorage.setItem('mapbox_token', tokenInput.trim());
      setMapboxToken(tokenInput.trim());
      setNeedsToken(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !userLocation || !mapboxToken) return;

    // Initialize map with satellite style
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [userLocation.lng, userLocation.lat],
      zoom: 12,
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add user location marker
    const userEl = document.createElement('div');
    userEl.className = 'user-location-marker';
    userEl.style.width = '20px';
    userEl.style.height = '20px';
    userEl.style.borderRadius = '50%';
    userEl.style.backgroundColor = '#3b82f6';
    userEl.style.border = '3px solid white';
    userEl.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';

    userMarker.current = new mapboxgl.Marker({ element: userEl })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);

    // Cleanup
    return () => {
      userMarker.current?.remove();
      locationMarker.current?.remove();
      map.current?.remove();
    };
  }, [userLocation, mapboxToken]);

  // Update selected location marker
  useEffect(() => {
    if (!map.current) return;

    // Remove existing location marker
    if (locationMarker.current) {
      locationMarker.current.remove();
      locationMarker.current = null;
    }

    if (selectedLocation) {
      // Add selected location marker
      const el = document.createElement('div');
      el.className = 'selected-location-marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50% 50% 50% 0';
      el.style.backgroundColor = '#ef4444';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
      el.style.transform = 'rotate(-45deg)';

      locationMarker.current = new mapboxgl.Marker({ element: el })
        .setLngLat([selectedLocation.lng, selectedLocation.lat])
        .addTo(map.current);

      // Fly to selected location
      map.current.flyTo({
        center: [selectedLocation.lng, selectedLocation.lat],
        zoom: 14,
        pitch: 45,
        duration: 2000,
      });
    } else if (userLocation) {
      // Fly back to user location
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 12,
        pitch: 45,
        duration: 2000,
      });
    }
  }, [selectedLocation, userLocation]);

  if (isLoadingToken) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  if (needsToken) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Mapbox Token Required</CardTitle>
            <CardDescription>
              Please enter your Mapbox public token to view the map
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder="pk.eyJ1..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTokenSubmit()}
            />
            <Button onClick={handleTokenSubmit} className="w-full">
              Save Token
            </Button>
            <p className="text-xs text-muted-foreground">
              Get your token from{' '}
              <a 
                href="https://account.mapbox.com/access-tokens/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline"
              >
                mapbox.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
};

export default InteractiveMap;
