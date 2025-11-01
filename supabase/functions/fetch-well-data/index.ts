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
  source?: string;
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

// Fetch wells from DrillingEdge
async function fetchDrillingEdgeWells(): Promise<WellData[]> {
  try {
    console.log('Fetching wells from DrillingEdge...');
    const allWells: WellData[] = [];
    
    // Fetch multiple pages (11 pages visible in pagination)
    for (let page = 1; page <= 11; page++) {
      const url = page === 1 
        ? 'https://www.drillingedge.com/wells'
        : `https://www.drillingedge.com/wells?page=${page}`;
      
      const response = await fetch(url);
      const html = await response.text();
      
      const rowRegex = /<tr[^>]*>[\s\S]*?<td[^>]*>([0-9-]+)<\/td>[\s\S]*?<a[^>]*>([^<]+)<\/a>[\s\S]*?<td[^>]*>([^<]+)<\/td>[\s\S]*?<td[^>]*>([^<]+)<\/td>/gi;
      
      let match;
      while ((match = rowRegex.exec(html)) !== null) {
        const apiNumber = match[1].trim();
        const name = match[2].trim();
        const location = match[3].trim();
        const operator = match[4].trim();
        
        if (apiNumber === 'API #' || name === 'Well Name') continue;
        
        const countyCoord = countyCoordinates[location];
        let lat: number | undefined;
        let lng: number | undefined;
        
        if (countyCoord) {
          const randomOffset = () => (Math.random() - 0.5) * 0.2;
          lat = countyCoord.lat + randomOffset();
          lng = countyCoord.lng + randomOffset();
        }
        
        allWells.push({
          apiNumber,
          name,
          location,
          operator,
          lat,
          lng,
          source: 'DrillingEdge',
        });
      }
    }
    
    console.log(`Fetched ${allWells.length} wells from DrillingEdge`);
    return allWells;
  } catch (error) {
    console.error('Error fetching DrillingEdge wells:', error);
    return [];
  }
}

// Fetch wells from Oklahoma Corporation Commission ArcGIS API
async function fetchOklahomaWells(): Promise<WellData[]> {
  try {
    console.log('Fetching wells from Oklahoma Corporation Commission...');
    
    // Query Oklahoma ArcGIS REST API for wells
    // Fetch in batches due to API limits
    const baseUrl = 'https://gis.occ.ok.gov/server/rest/services/Hosted/RBDMS_WELLS/FeatureServer/220/query';
    const batchSize = 2000;
    const allWells: WellData[] = [];
    
    for (let offset = 0; offset < 10000; offset += batchSize) {
      const params = new URLSearchParams({
        where: '1=1',
        outFields: 'API_NUMBER,WELL_NAME,OPERATOR,COUNTY,latitude,longitude',
        f: 'json',
        resultOffset: offset.toString(),
        resultRecordCount: batchSize.toString(),
      });
      
      const response = await fetch(`${baseUrl}?${params}`);
      const data = await response.json();
      
      if (!data.features || data.features.length === 0) {
        break; // No more records
      }
      
      for (const feature of data.features) {
        const attrs = feature.attributes;
        const geom = feature.geometry;
        
        if (!attrs.API_NUMBER) continue;
        
        allWells.push({
          apiNumber: attrs.API_NUMBER,
          name: attrs.WELL_NAME || 'Unnamed Well',
          location: attrs.COUNTY ? `${attrs.COUNTY} County, OK` : 'Oklahoma',
          operator: attrs.OPERATOR || 'Unknown Operator',
          lat: geom?.y || attrs.latitude,
          lng: geom?.x || attrs.longitude,
          source: 'Oklahoma OCC',
        });
      }
      
      console.log(`Fetched ${allWells.length} wells from Oklahoma so far...`);
      
      // If we got fewer results than batch size, we're done
      if (data.features.length < batchSize) {
        break;
      }
    }
    
    console.log(`Fetched ${allWells.length} total wells from Oklahoma`);
    return allWells;
  } catch (error) {
    console.error('Error fetching Oklahoma wells:', error);
    return [];
  }
}

// Fetch wells from New Mexico Oil Conservation Division
async function fetchNewMexicoWells(): Promise<WellData[]> {
  try {
    console.log('Fetching wells from New Mexico OCD...');
    
    // Query New Mexico MapServer for wells (Active wells - layer 5)
    const baseUrl = 'https://mapservice.nmstatelands.org/arcgis/rest/services/Public/NMOCD_Wells_V3/MapServer/5/query';
    const batchSize = 2000;
    const allWells: WellData[] = [];
    
    for (let offset = 0; offset < 20000; offset += batchSize) {
      const params = new URLSearchParams({
        where: '1=1',
        outFields: 'API_NUMBER,WELL_NAME,OPERATOR,COUNTY',
        f: 'json',
        returnGeometry: 'true',
        resultOffset: offset.toString(),
        resultRecordCount: batchSize.toString(),
      });
      
      const response = await fetch(`${baseUrl}?${params}`);
      const data = await response.json();
      
      if (!data.features || data.features.length === 0) {
        break; // No more records
      }
      
      for (const feature of data.features) {
        const attrs = feature.attributes;
        const geom = feature.geometry;
        
        if (!attrs.API_NUMBER || !geom) continue;
        
        allWells.push({
          apiNumber: attrs.API_NUMBER,
          name: attrs.WELL_NAME || 'Unnamed Well',
          location: attrs.COUNTY ? `${attrs.COUNTY} County, NM` : 'New Mexico',
          operator: attrs.OPERATOR || 'Unknown Operator',
          lat: geom.y,
          lng: geom.x,
          source: 'New Mexico OCD',
        });
      }
      
      console.log(`Fetched ${allWells.length} wells from New Mexico so far...`);
      
      // If we got fewer results than batch size, we're done
      if (data.features.length < batchSize) {
        break;
      }
    }
    
    console.log(`Fetched ${allWells.length} total wells from New Mexico`);
    return allWells;
  } catch (error) {
    console.error('Error fetching New Mexico wells:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching well data from multiple sources...');
    
    // Fetch from all sources in parallel
    const [drillingEdgeWells, oklahomaWells, newMexicoWells] = await Promise.all([
      fetchDrillingEdgeWells(),
      fetchOklahomaWells(),
      fetchNewMexicoWells(),
    ]);
    
    // Combine all wells
    const wells = [...drillingEdgeWells, ...oklahomaWells, ...newMexicoWells];
    
    console.log(`Successfully fetched ${wells.length} total wells (DrillingEdge: ${drillingEdgeWells.length}, Oklahoma: ${oklahomaWells.length}, New Mexico: ${newMexicoWells.length})`);
    
    return new Response(
      JSON.stringify({
        success: true,
        wells,
        count: wells.length,
        sources: {
          drillingEdge: drillingEdgeWells.length,
          oklahoma: oklahomaWells.length,
          newMexico: newMexicoWells.length,
        },
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
