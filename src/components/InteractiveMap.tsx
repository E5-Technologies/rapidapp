import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface InteractiveMapProps {
  userLocation: { lat: number; lng: number } | null;
  selectedLocation?: { lat: number; lng: number; name: string } | null;
}

const InteractiveMap = ({ userLocation, selectedLocation }: InteractiveMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const locationMarker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !userLocation) return;

    // Initialize map with satellite style
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
    
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
  }, [userLocation]);

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

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
};

export default InteractiveMap;
