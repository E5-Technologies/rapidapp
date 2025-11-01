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

async function fetchPageWells(page: number): Promise<WellData[]> {
  try {
    console.log(`Fetching page ${page} from DrillingEdge...`);
    const url = page === 1 
      ? 'https://www.drillingedge.com/wells'
      : `https://www.drillingedge.com/wells?page=${page}`;
    
    const response = await fetch(url);
    const html = await response.text();
    
    const wells: WellData[] = [];
    
    // Parse HTML table rows - look for <tr> containing well data
    // Pattern: <td>API</td><td><a>Name</a></td><td>Location</td><td>Operator</td>
    const rowRegex = /<tr[^>]*>[\s\S]*?<td[^>]*>([0-9-]+)<\/td>[\s\S]*?<a[^>]*>([^<]+)<\/a>[\s\S]*?<td[^>]*>([^<]+)<\/td>[\s\S]*?<td[^>]*>([^<]+)<\/td>/gi;
    
    let match;
    while ((match = rowRegex.exec(html)) !== null) {
      const apiNumber = match[1].trim();
      const name = match[2].trim();
      const location = match[3].trim();
      const operator = match[4].trim();
      
      // Skip header rows
      if (apiNumber === 'API #' || name === 'Well Name') {
        continue;
      }
      
      // Get coordinates from county cache
      const countyCoord = countyCoordinates[location];
      let lat: number | undefined;
      let lng: number | undefined;
      
      if (countyCoord) {
        // Add small random offset to spread wells across the county
        const randomOffset = () => (Math.random() - 0.5) * 0.2;
        lat = countyCoord.lat + randomOffset();
        lng = countyCoord.lng + randomOffset();
      }
      
      wells.push({
        apiNumber,
        name,
        location,
        operator,
        lat,
        lng,
      });
    }
    
    console.log(`Parsed ${wells.length} wells from page ${page}`);
    return wells;
  } catch (error) {
    console.error(`Error fetching page ${page}:`, error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching well data from DrillingEdge...');
    
    // Fetch multiple pages (11 pages visible in pagination)
    const pagePromises: Promise<WellData[]>[] = [];
    for (let page = 1; page <= 11; page++) {
      pagePromises.push(fetchPageWells(page));
    }
    
    // Wait for all pages to be fetched
    const pageResults = await Promise.all(pagePromises);
    
    // Flatten all wells into a single array
    const wells = pageResults.flat();
    
    console.log(`Successfully fetched ${wells.length} total wells from DrillingEdge`);
    
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
