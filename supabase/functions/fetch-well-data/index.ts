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

// Known wells database - expanded with DrillingEdge data
const knownWells: WellData[] = [
  {
    apiNumber: '30-015-30643',
    name: 'SAND DUNES 36 STATE COM 001',
    location: 'Eddy County, NM',
    operator: 'Unknown',
    lat: 32.4237,
    lng: -104.2294,
  },
  {
    apiNumber: '30-025-53702',
    name: 'AIRSTREAM 24 STATE COM 301H',
    location: 'Lea County, NM',
    operator: 'Permian Resources Operating, LLC',
    lat: 32.7023,
    lng: -103.3441,
  },
  {
    apiNumber: '30-025-53703',
    name: 'AIRSTREAM 24 STATE COM 302H',
    location: 'Lea County, NM',
    operator: 'Permian Resources Operating, LLC',
    lat: 32.7123,
    lng: -103.3541,
  },
  {
    apiNumber: '30-025-52961',
    name: 'AKUBRA FEDERAL COM 601H',
    location: 'Lea County, NM',
    operator: 'COG OPERATING LLC',
    lat: 32.6923,
    lng: -103.3641,
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Returning known wells from database...');
    
    // Start with known wells
    const wells: WellData[] = [...knownWells];
    
    // Try to fetch and parse additional wells from DrillingEdge
    try {
      console.log('Attempting to fetch additional wells from DrillingEdge...');
      const response = await fetch('https://www.drillingedge.com/wells');
      const html = await response.text();
      
      // Try multiple parsing strategies
      // Strategy 1: Look for API numbers and extract surrounding data
      const apiPattern = /(\d{2}-\d{3}-\d{5})/g;
      const apiMatches = html.match(apiPattern) || [];
      
      console.log(`Found ${apiMatches.length} API numbers in HTML`);
      
      // For each API number, try to extract well name
      for (const apiNumber of apiMatches.slice(0, 50)) { // Limit to 50 to avoid timeout
        // Skip if we already have this well
        if (wells.some(w => w.apiNumber === apiNumber)) continue;
        
        // Find the well name near this API number
        const apiIndex = html.indexOf(apiNumber);
        const contextStart = Math.max(0, apiIndex - 500);
        const contextEnd = Math.min(html.length, apiIndex + 500);
        const context = html.substring(contextStart, contextEnd);
        
        // Try to extract well name from link or title
        const nameMatch = context.match(/title="([^"]+)"/i) || 
                         context.match(/>([A-Z][^<]{10,100})<\/a>/);
        const locationMatch = context.match(/([A-Za-z\s]+County,\s*[A-Z]{2})/);
        
        if (nameMatch && locationMatch) {
          const wellName = nameMatch[1].trim();
          const location = locationMatch[1].trim();
          const coords = countyCoordinates[location] || { lat: 32.0, lng: -103.0 };
          
          wells.push({
            apiNumber,
            name: wellName,
            location,
            operator: 'Unknown',
            lat: coords.lat + (Math.random() - 0.5) * 0.3,
            lng: coords.lng + (Math.random() - 0.5) * 0.3,
          });
        }
      }
    } catch (scrapeError) {
      console.error('Error scraping additional wells:', scrapeError);
      // Continue with known wells
    }
    
    console.log(`Returning ${wells.length} total wells`);
    
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
