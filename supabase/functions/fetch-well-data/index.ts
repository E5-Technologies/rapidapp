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
        outFields: 'api,well_name,operator,county,sh_lat,sh_lon',
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
        
        if (!attrs.api) continue;
        
        allWells.push({
          apiNumber: attrs.api?.toString() || '',
          name: attrs.well_name || 'Unnamed Well',
          location: attrs.county ? `${attrs.county} County, OK` : 'Oklahoma',
          operator: attrs.operator || 'Unknown Operator',
          lat: attrs.sh_lat || geom?.y,
          lng: attrs.sh_lon || geom?.x,
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
async function fetchNewMexicoOCDWells(): Promise<WellData[]> {
  try {
    console.log('Fetching wells from New Mexico OCD...');
    
    // Query New Mexico MapServer for wells (Active wells - layer 5)
    const baseUrl = 'https://mapservice.nmstatelands.org/arcgis/rest/services/Public/NMOCD_Wells_V3/MapServer/5/query';
    const batchSize = 2000;
    const allWells: WellData[] = [];
    
    for (let offset = 0; offset < 20000; offset += batchSize) {
      const params = new URLSearchParams({
        where: '1=1',
        outFields: 'API,wellname,ogrid_name,county',
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
        
        if (!attrs.API || !geom) continue;
        
        allWells.push({
          apiNumber: attrs.API,
          name: attrs.wellname || 'Unnamed Well',
          location: attrs.county ? `${attrs.county} County, NM` : 'New Mexico',
          operator: attrs.ogrid_name || 'Unknown Operator',
          lat: geom.y,
          lng: geom.x,
          source: 'New Mexico OCD',
        });
      }
      
      console.log(`Fetched ${allWells.length} wells from New Mexico OCD so far...`);
      
      // If we got fewer results than batch size, we're done
      if (data.features.length < batchSize) {
        break;
      }
    }
    
    console.log(`Fetched ${allWells.length} total wells from New Mexico OCD`);
    return allWells;
  } catch (error) {
    console.error('Error fetching New Mexico OCD wells:', error);
    return [];
  }
}


// Fetch wells from BLM Fluid Minerals API (Federal Lands)
async function fetchBLMWells(): Promise<WellData[]> {
  try {
    console.log('Fetching wells from BLM Fluid Minerals...');
    
    // Query BLM ArcGIS REST API for oil and gas leases
    const baseUrl = 'https://gis.blm.gov/nlsdb/rest/services/Fluid_Minerals/Oil_Gas_Leases_Case_Disp/MapServer/0/query';
    const batchSize = 1000;
    const allWells: WellData[] = [];
    
    // Focus on New Mexico leases using ADMIN_STATE
    for (let offset = 0; offset < 5000; offset += batchSize) {
      const params = new URLSearchParams({
        where: "ADMIN_STATE='NM'",
        outFields: 'CSE_NR,CSE_NAME,GEO_STATE',
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
        
        if (!attrs.CSE_NR || !geom) continue;
        
        // Calculate centroid for polygon geometries
        let lat: number | undefined;
        let lng: number | undefined;
        
        if (geom.rings && geom.rings.length > 0) {
          // Simple centroid calculation for polygon
          const ring = geom.rings[0];
          let sumLat = 0, sumLng = 0;
          for (const point of ring) {
            sumLng += point[0];
            sumLat += point[1];
          }
          lng = sumLng / ring.length;
          lat = sumLat / ring.length;
        } else if (geom.x && geom.y) {
          lng = geom.x;
          lat = geom.y;
        }
        
        if (lat && lng) {
          allWells.push({
            apiNumber: attrs.CSE_NR,
            name: attrs.CSE_NAME || 'BLM Lease',
            location: attrs.GEO_STATE ? `${attrs.GEO_STATE}` : 'New Mexico',
            operator: 'BLM Federal Lease',
            lat,
            lng,
            source: 'BLM Federal',
          });
        }
      }
      
      console.log(`Fetched ${allWells.length} BLM leases from New Mexico so far...`);
      
      // If we got fewer results than batch size, we're done
      if (data.features.length < batchSize) {
        break;
      }
    }
    
    console.log(`Fetched ${allWells.length} total BLM leases from New Mexico`);
    return allWells;
  } catch (error) {
    console.error('Error fetching BLM wells:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching well data from multiple sources...');
    
    // Fetch from all sources in parallel (excluding GO-TECH as it requires form submission)
    const [drillingEdgeWells, oklahomaWells, nmOCDWells, blmWells] = await Promise.all([
      fetchDrillingEdgeWells(),
      fetchOklahomaWells(),
      fetchNewMexicoOCDWells(),
      fetchBLMWells(),
    ]);
    
    // Combine all wells
    const wells = [...drillingEdgeWells, ...oklahomaWells, ...nmOCDWells, ...blmWells];
    
    console.log(`Successfully fetched ${wells.length} total wells (DrillingEdge: ${drillingEdgeWells.length}, Oklahoma: ${oklahomaWells.length}, NM OCD: ${nmOCDWells.length}, BLM: ${blmWells.length})`);
    
    return new Response(
      JSON.stringify({
        success: true,
        wells,
        count: wells.length,
        sources: {
          drillingEdge: drillingEdgeWells.length,
          oklahoma: oklahomaWells.length,
          newMexicoOCD: nmOCDWells.length,
          blm: blmWells.length,
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
