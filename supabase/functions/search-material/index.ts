import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  userLocation?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query, userLocation }: SearchRequest = await req.json();
    
    // Input validation
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (query.trim().length > 200) {
      return new Response(
        JSON.stringify({ error: 'Query must be 200 characters or less' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (userLocation && (typeof userLocation !== 'string' || userLocation.length > 100)) {
      return new Response(
        JSON.stringify({ error: 'Invalid user location' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!SERPER_API_KEY) {
      throw new Error('SERPER_API_KEY not configured');
    }

    console.log('Searching for material:', query);

    // Define ThomasNet categories to search
    const thomasnetCategories = [
      'automation-electronics',
      'process-equipment',
      'pumps-valves-accessories'
    ];

    // Search ThomasNet across all categories
    const thomasnetSearches = thomasnetCategories.map(category => {
      const categoryQuery = `site:thomasnet.com/products/${category} ${query}`;
      return fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: categoryQuery,
          num: 10,
        }),
      });
    });

    // Also do a general ThomasNet search
    const generalThomasnetSearch = fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: `site:thomasnet.com ${query}`,
        num: 20,
      }),
    });

    const allSearches = [...thomasnetSearches, generalThomasnetSearch];
    const responses = await Promise.all(allSearches);

    // Check if all responses are ok
    for (const response of responses) {
      if (!response.ok) {
        throw new Error(`Serper API error: ${response.status}`);
      }
    }

    const searchResultsArray = await Promise.all(responses.map(r => r.json()));
    
    // Combine all search results
    const allOrganicResults = searchResultsArray.flatMap(results => results.organic || []);
    
    // Deduplicate by URL
    const uniqueResults = Array.from(
      new Map(allOrganicResults.map(item => [item.link, item])).values()
    );

    console.log(`Found ${uniqueResults.length} unique ThomasNet results`);

    // Use AI to extract material information from ThomasNet results
    const aiPrompt = `Analyze these ThomasNet search results for materials matching "${query}". 

Search Results from ThomasNet:
${JSON.stringify(uniqueResults.slice(0, 30), null, 2)}

Extract and return at least 20 materials. Return ONLY valid JSON array (no markdown, no extra text) with this structure:
[
  {
    "manufacturer": "manufacturer name from result",
    "productName": "product name from title/snippet",
    "modelNumber": "model number if found, otherwise use product identifier",
    "category": "which category: Automation & Electronics, Process Equipment, or Pumps Valves & Accessories",
    "imageUrl": null,
    "datasheetUrl": "link to product page or datasheet",
    "specifications": ["extract key specs from snippet"],
    "description": "extract product description from snippet",
    "salesContact": {
      "region": "${userLocation || 'Global'}",
      "phone": null,
      "email": null,
      "website": "manufacturer website from link"
    }
  }
]

IMPORTANT: 
- Return AT LEAST 20 material entries if possible from the results provided
- Extract manufacturer name from the URL or title
- Use the ThomasNet product page as the datasheetUrl
- Categorize based on the URL path (automation-electronics, process-equipment, or pumps-valves-accessories)
- If fewer than 20 results exist, return all available results
- Return ONLY the JSON array.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: aiPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const extractedInfo = aiData.choices[0].message.content;
    
    console.log('AI extracted info:', extractedInfo);

    // Parse the AI response
    let parsedInfo;
    try {
      // Remove markdown code blocks if present
      const cleanedInfo = extractedInfo.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedInfo = JSON.parse(cleanedInfo);
      
      // Ensure we have an array
      if (!Array.isArray(parsedInfo)) {
        parsedInfo = [parsedInfo];
      }
      
      console.log(`Parsed ${parsedInfo.length} materials from AI response`);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw AI response:', extractedInfo);
      
      // Return basic structures from raw search results if parsing fails
      parsedInfo = uniqueResults.slice(0, 20).map((result: any) => ({
        manufacturer: result.link.includes('thomasnet.com') ? 
          result.link.split('/')[4]?.replace(/-/g, ' ') || 'Unknown' : 'Unknown',
        productName: result.title,
        modelNumber: null,
        category: result.link.includes('automation-electronics') ? 'Automation & Electronics' :
                  result.link.includes('process-equipment') ? 'Process Equipment' :
                  result.link.includes('pumps-valves-accessories') ? 'Pumps Valves & Accessories' : 'General',
        imageUrl: null,
        datasheetUrl: result.link,
        specifications: [],
        description: result.snippet || 'Material information from ThomasNet',
        salesContact: {
          region: userLocation || 'Global',
          phone: null,
          email: null,
          website: result.link
        }
      }));
    }

    // Add metadata
    const responseData = {
      materials: parsedInfo,
      totalResults: parsedInfo.length,
      source: 'thomasnet.com',
      categories: ['Automation & Electronics', 'Process Equipment', 'Pumps Valves & Accessories']
    };

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-material function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});