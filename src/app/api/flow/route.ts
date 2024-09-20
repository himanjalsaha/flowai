import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';


// Initialize Groq SDK with your API key
const groq = new Groq({
  apiKey: "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",
});

export async function POST(req: Request) {
  try {
    const { message, characterPrompt } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    const contextMessage = `${characterPrompt}\n\nUser: ${message}\n\nBased on the input provided, generate flowchart content in a structured JSON format. Ensure the following details:

    1. **Nodes**: Each node should have an ID, position ("x" and "y" coordinates), and label that describes the node's content or purpose.
    2. **Connections**: Each node can connect to one or more other nodes. Specify these connections by listing source and target node IDs.
    3. **Connection Types**: The connection type can be "smooth", "straight", or "step" for indicating how the edges are drawn between nodes.
    
    ### Format Example:
    {
      "nodes": [
        { "id": "1", "position": { "x": 0, "y": 0 }, "data": { "label": "Start" } },
        { "id": "2", "position": { "x": 200, "y": 0 }, "data": { "label": "Decision" } },
        { "id": "3", "position": { "x": 400, "y": 100 }, "data": { "label": "Outcome A" } },
        { "id": "4", "position": { "x": 400, "y": -100 }, "data": { "label": "Outcome B" } }
      ],
      "connections": [
        { "from": "1", "to": ["2"], "type": "smooth" },
        { "from": "2", "to": ["3", "4"], "type": "smooth" }
      ]
    }
    
    ### Notes:
    - Ensure the positions of the nodes are logically spaced out (e.g., starting from position {x: 0, y: 0} and expanding in x/y directions for clarity).
    - Nodes can be decision points, actions, or results, based on the context of the input message.
    - Use appropriate labels to reflect the content.
    - Generate valid JSON only, with no extra text.`;
    

    console.log(contextMessage);

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: contextMessage }],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const responseText = chatCompletion.choices?.[0]?.message?.content || 'No response';

  

    // Attempt to parse the response into JSON
    let parsedResponse = null;
    try {
      parsedResponse = JSON.parse(responseText);
      console.log(parsedResponse);
      
    } catch (parseError) {
      return NextResponse.json({ error: `Failed to parse AI response as JSON.${parseError}` }, { status: 500 });
    }

    // Ensure the response structure is correct
    if (!parsedResponse.nodes || !parsedResponse.connections) {
      return NextResponse.json({ error: 'Invalid response structure' }, { status: 500 });
    }

    // Return the parsed response
    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Error creating flowchart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
