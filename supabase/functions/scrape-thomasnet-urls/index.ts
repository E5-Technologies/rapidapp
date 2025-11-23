import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ThomasNetScrapeRequest {
  categories: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting ThomasNet URL scraping...');

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Parse request body
    const { categories }: ThomasNetScrapeRequest = await req.json();

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      throw new Error('Categories array is required');
    }

    console.log('Categories to scrape:', categories);

    const serperApiKey = Deno.env.get('SERPER_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!serperApiKey) {
      throw new Error('SERPER_API_KEY not configured');
    }

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const allManufacturerUrls: { category: string; name: string; url: string }[] = [];

    // Process each category
    for (const category of categories) {
      console.log(`Processing category: ${category}`);

      // Search ThomasNet for manufacturers in this category
      const searchQuery = `site:thomasnet.com "${category}" manufacturers suppliers companies`;
      
      const serperResponse = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': serperApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: searchQuery,
          num: 50, // Get up to 50 results per category
        }),
      });

      if (!serperResponse.ok) {
        console.error(`Serper API error for ${category}:`, await serperResponse.text());
        continue;
      }

      const serperData = await serperResponse.json();
      console.log(`Found ${serperData.organic?.length || 0} results for ${category}`);

      if (!serperData.organic || serperData.organic.length === 0) {
        console.log(`No results found for category: ${category}`);
        continue;
      }

      // Use Lovable AI to extract manufacturer information
      const aiPrompt = `Extract manufacturer company names and their official website URLs from these search results about ${category}. 
      Return ONLY a JSON array in this exact format with no other text:
      [{"name": "Company Name", "url": "https://company.com"}]
      
      Search Results:
      ${JSON.stringify(serperData.organic.slice(0, 30))}`;

      const aiResponse = await fetch('https://api.lovable.app/v1/ai/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-5-mini',
          messages: [
            {
              role: 'user',
              content: aiPrompt,
            },
          ],
        }),
      });

      if (!aiResponse.ok) {
        console.error(`Lovable AI error for ${category}:`, await aiResponse.text());
        continue;
      }

      const aiData = await aiResponse.json();
      const aiContent = aiData.choices?.[0]?.message?.content || '';
      
      console.log(`AI response for ${category}:`, aiContent);

      // Parse the AI response
      try {
        // Extract JSON from the response
        const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const manufacturers = JSON.parse(jsonMatch[0]);
          
          for (const mfg of manufacturers) {
            if (mfg.url && mfg.name) {
              allManufacturerUrls.push({
                category,
                name: mfg.name,
                url: mfg.url,
              });
            }
          }
          
          console.log(`Extracted ${manufacturers.length} manufacturers for ${category}`);
        }
      } catch (parseError) {
        console.error(`Error parsing AI response for ${category}:`, parseError);
      }

      // Add delay between categories to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`Total manufacturers found: ${allManufacturerUrls.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        totalCategories: categories.length,
        totalManufacturers: allManufacturerUrls.length,
        manufacturers: allManufacturerUrls,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in scrape-thomasnet-urls:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
