import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { gameState, playerColor } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build a description of the current position
    const boardDescription = gameState.pieces.map((p: any) => 
      `${p.color} ${p.type} at ${String.fromCharCode(97 + p.x)}${8 - p.y}`
    ).join(', ');

    const systemPrompt = `You are a chess expert assistant helping a ${playerColor} player. 
Analyze the current position and suggest 2-3 good moves with brief explanations.
Keep explanations concise and helpful.

Current board state: ${boardDescription}
Current turn: ${gameState.currentTurn}
Move history: ${gameState.moveHistory.slice(-5).join(', ')}

Provide your response in this format:
1. [Move notation] - [Brief explanation]
2. [Move notation] - [Brief explanation]
3. [Move notation] - [Brief explanation]

Focus on tactics, piece development, king safety, or winning material.`;

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
          { role: 'user', content: 'Please analyze this position and suggest the best moves.' }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const hints = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ hints }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chess-hint-assistant:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
