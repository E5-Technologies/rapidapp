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

    // Search specifically on thomasnet.com and emerson.com for comprehensive product coverage
    const searchQuery = `${query} site:thomasnet.com OR site:emerson.com/en-us (automation electronics OR process equipment OR pumps valves accessories) product specifications`;
    const serperResponse = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: searchQuery,
        num: 20,
      }),
    });

    if (!serperResponse.ok) {
      throw new Error(`Serper API error: ${serperResponse.status}`);
    }

    const searchResults = await serperResponse.json();
    console.log('Search results received:', searchResults);

    // Scrape the top product pages directly
    const scrapedProducts = [];
    const urlsToScrape = searchResults.organic?.slice(0, 5) || [];
    
    for (const result of urlsToScrape) {
      try {
        console.log('Scraping URL:', result.link);
        const pageResponse = await fetch(result.link, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (pageResponse.ok) {
          const html = await pageResponse.text();
          
          // Use AI to extract product information from the scraped HTML
          const extractPrompt = `Extract product information from this HTML page for "${query}":

HTML Content (truncated to 8000 chars):
${html.substring(0, 8000)}

Source URL: ${result.link}

Extract and return ONLY valid JSON (no markdown, no extra text):
{
  "manufacturer": "manufacturer name from page",
  "productName": "full product name",
  "modelNumber": "model/part number",
  "imageUrl": "product image URL if found",
  "datasheetUrl": "datasheet/spec PDF URL if found",
  "specifications": ["spec 1", "spec 2"],
  "description": "product description",
  "category": "product category (Valves/Pumps/Piping/Instrumentation/etc)",
  "sourceUrl": "${result.link}"
}

Return null fields for missing info. Return ONLY the JSON object.`;

          const extractResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [{ role: 'user', content: extractPrompt }],
            }),
          });

          if (extractResponse.ok) {
            const extractData = await extractResponse.json();
            const extracted = extractData.choices[0].message.content;
            try {
              const cleanedExtract = extracted.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
              const productInfo = JSON.parse(cleanedExtract);
              if (productInfo.productName) {
                scrapedProducts.push(productInfo);
                console.log('Successfully extracted product:', productInfo.productName);
              }
            } catch (parseErr) {
              console.error('Failed to parse extracted product:', parseErr);
            }
          }
        }
      } catch (scrapeError) {
        console.error('Error scraping URL:', result.link, scrapeError);
      }
    }

    // Use AI to compile the best results and match to the search query
    const finalPrompt = `Based on these scraped products and the search query "${query}", identify the best matches:

Scraped Products:
${JSON.stringify(scrapedProducts, null, 2)}

Original Search Results:
${JSON.stringify(searchResults.organic?.slice(0, 3), null, 2)}

Return ONLY valid JSON (no markdown):
{
  "manufacturer": "best matching manufacturer",
  "productName": "best matching product name",
  "modelNumber": "${query}",
  "imageUrl": "product image URL",
  "datasheetUrl": "datasheet URL",
  "specifications": ["key specs"],
  "description": "product description",
  "category": "Valves/Pumps/Piping/etc",
  "salesContact": {
    "region": "${userLocation || 'Global'}",
    "phone": "contact if found",
    "email": "email if found",
    "website": "manufacturer website"
  },
  "alternativeProducts": [list of other matching products from scraped data]
}

Use null for missing fields. Return ONLY the JSON object.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: finalPrompt }
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
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Return a basic structure if parsing fails
      parsedInfo = {
        manufacturer: 'Unknown',
        productName: query,
        modelNumber: query,
        imageUrl: null,
        datasheetUrl: null,
        specifications: [],
        description: 'Material information extracted from web search.',
        salesContact: {
          region: userLocation || 'Global',
          phone: null,
          email: null,
          website: searchResults.organic?.[0]?.link || null
        }
      };
    }

    // Add raw search results for reference
    parsedInfo.searchResults = searchResults.organic?.slice(0, 5).map((result: any) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet
    }));

    return new Response(
      JSON.stringify(parsedInfo),
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