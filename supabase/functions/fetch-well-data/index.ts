import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WellData {
  apiNumber: string;
  name: string;
  location: string;
  operator: string;
  lat?: number;
  lng?: number;
}

// County coordinates cache for faster geocoding
const countyCoordinates: Record<string, { lat: number; lng: number }> = {
  'Lea County, NM': { lat: 32.7023, lng: -103.3441 },
  'Eddy County, NM': { lat: 32.4237, lng: -104.2294 },
  'Duchesne County, UT': { lat: 40.2833, lng: -110.3833 },
  'Weld County, CO': { lat: 40.4397, lng: -104.4197 },
  'Williams County, ND': { lat: 48.3358, lng: -103.3824 },
  'McKenzie County, ND': { lat: 47.6294, lng: -103.4044 },
  'Dunn County, ND': { lat: 47.3594, lng: -102.6291 },
  'Mountrail County, ND': { lat: 48.2411, lng: -102.3485 },
  'Adams County, CO': { lat: 39.8744, lng: -104.3297 },
  'Converse County, WY': { lat: 42.8633, lng: -105.5858 },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching well data from DrillingEdge...');
    
    // Fetch the website
    const response = await fetch('https://www.drillingedge.com/wells');
    const html = await response.text();
    
    console.log('Parsing HTML data...');
    
    // Extract well data from the table
    const wells: WellData[] = [];
    
    // Simple regex to extract table rows
    const tableRowRegex = /\|\s*(\d+-\d+-\d+)\s*\|\s*\[([^\]]+)\]/g;
    let match;
    
    while ((match = tableRowRegex.exec(html)) !== null) {
      const apiNumber = match[1];
      const wellName = match[2];
      
      // Find the location and operator in the same row
      const rowStart = match.index;
      const rowEnd = html.indexOf('\n', rowStart);
      const row = html.substring(rowStart, rowEnd);
      
      // Extract location (county, state)
      const locationMatch = row.match(/\|\s*([A-Za-z\s]+County,\s*[A-Z]{2})\s*\|/);
      const operatorMatch = row.match(/\|\s*([^|]+)\s*\|\s*\|\s*\|$/);
      
      if (locationMatch && operatorMatch) {
        const location = locationMatch[1].trim();
        const operator = operatorMatch[1].trim();
        
        // Get coordinates from cache or estimate
        const coords = countyCoordinates[location] || { lat: 0, lng: 0 };
        
        // Add small random offset to spread wells within county
        const latOffset = (Math.random() - 0.5) * 0.5;
        const lngOffset = (Math.random() - 0.5) * 0.5;
        
        wells.push({
          apiNumber,
          name: wellName,
          location,
          operator,
          lat: coords.lat + latOffset,
          lng: coords.lng + lngOffset,
        });
      }
    }
    
    console.log(`Successfully parsed ${wells.length} wells`);
    
    return new Response(
      JSON.stringify({
        success: true,
        wells,
        count: wells.length,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching well data:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
