import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gameState, difficulty = "medium" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Requesting AI move for game state:', gameState);

    const systemPrompt = `You are a chess AI assistant. Analyze the current chess position and suggest the best move for black.
    
    Game State:
    - Pieces: ${JSON.stringify(gameState.pieces)}
    - Current Turn: ${gameState.currentTurn}
    - Move History: ${JSON.stringify(gameState.moveHistory)}
    
    Difficulty: ${difficulty}
    
    Respond with a JSON object containing:
    {
      "from": [x, y],
      "to": [x, y],
      "reasoning": "brief explanation of the move"
    }
    
    Consider:
    1. Piece values (pawn=1, knight=3, bishop=3, rook=5, queen=9)
    2. Board control
    3. King safety
    4. Tactical opportunities
    5. For ${difficulty} difficulty, ${difficulty === "easy" ? "make occasional mistakes" : difficulty === "medium" ? "play solidly but not perfectly" : "play near-optimal moves"}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'What is the best move?' }
        ],
        temperature: difficulty === "easy" ? 1.2 : difficulty === "medium" ? 0.8 : 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', response.status, errorText);
      
      // Fallback to random valid move
      return new Response(
        JSON.stringify({ 
          useRandom: true,
          error: 'AI service unavailable, using random move'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);

    // Parse AI response
    let moveData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        moveData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ 
          useRandom: true,
          error: 'Failed to parse AI response'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(moveData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chess-ai-move function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        useRandom: true
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
