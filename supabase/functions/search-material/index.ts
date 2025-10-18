import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { query, userLocation }: SearchRequest = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!SERPER_API_KEY) {
      throw new Error('SERPER_API_KEY not configured');
    }

    console.log('Searching for material:', query);

    // Search the web for the material using Serper
    const searchQuery = `${query} oil gas industry material data sheet specifications`;
    const serperResponse = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: searchQuery,
        num: 10,
      }),
    });

    if (!serperResponse.ok) {
      throw new Error(`Serper API error: ${serperResponse.status}`);
    }

    const searchResults = await serperResponse.json();
    console.log('Search results received:', searchResults);

    // Use AI to extract relevant information
    const aiPrompt = `Analyze these search results for the oil and gas material with serial/model number "${query}". 

Search Results:
${JSON.stringify(searchResults, null, 2)}

Extract and return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "manufacturer": "manufacturer name",
  "productName": "full product name",
  "modelNumber": "${query}",
  "imageUrl": "direct image URL if found",
  "datasheetUrl": "datasheet PDF URL if found",
  "specifications": ["key spec 1", "key spec 2"],
  "description": "brief product description",
  "salesContact": {
    "region": "${userLocation || 'Global'}",
    "phone": "contact number if found",
    "email": "contact email if found",
    "website": "manufacturer website"
  }
}

If information is not found, use null for that field. Return ONLY the JSON object.`;

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