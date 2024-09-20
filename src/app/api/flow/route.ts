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

    const contextMessage = `${characterPrompt}

User: ${message}

Based on the input provided, generate a detailed flowchart content in a structured JSON format. Follow these instructions carefully:

1. Your response MUST be valid JSON. Do not include any text outside of the JSON structure.
2. The JSON structure MUST include "nodes" and "connections" arrays.
3. Generate at least 6-8 nodes to create a more complex and detailed flowchart.
4. Each node MUST have an "id", "position" (with "x" and "y" coordinates), and "data" (with "label" and "image" properties).
5. Each connection MUST have "from", "to" (an array of node IDs), and "type" properties.
6. Use logical spacing for node positions, starting from {x: 0, y: 0} and expanding outwards. Consider using a grid-like layout for clarity.
7. Ensure all image URLs are valid and start with "https://cdn-icons-png.flaticon.com".
8. Include different types of nodes such as start, process, decision, and end nodes.
9. Create multiple paths and decision points in the flowchart to reflect a more complex process.

Example JSON structure with more nodes and connections:

{
  "nodes": [
    {
      "id": "1",
      "position": { "x": 0, "y": 200 },
      "data": {
        "label": "Start",
        "image": "https://cdn-icons-png.flaticon.com/512/1828/1828490.png"
      }
    },
    {
      "id": "2",
      "position": { "x": 200, "y": 200 },
      "data": {
        "label": "Input Data",
        "image": "https://cdn-icons-png.flaticon.com/512/1828/1828743.png"
      }
    },
    {
      "id": "3",
      "position": { "x": 400, "y": 200 },
      "data": {
        "label": "Validate Data",
        "image": "https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
      }
    },
    {
      "id": "4",
      "position": { "x": 600, "y": 200 },
      "data": {
        "label": "Data Valid?",
        "image": "https://cdn-icons-png.flaticon.com/512/1828/1828940.png"
      }
    },
    {
      "id": "5",
      "position": { "x": 800, "y": 100 },
      "data": {
        "label": "Process Data",
        "image": "https://cdn-icons-png.flaticon.com/512/1828/1828743.png"
      }
    },
    {
      "id": "6",
      "position": { "x": 800, "y": 300 },
      "data": {
        "label": "Error Handling",
        "image": "https://cdn-icons-png.flaticon.com/512/1828/1828843.png"
      }
    },
    {
      "id": "7",
      "position": { "x": 1000, "y": 200 },
      "data": {
        "label": "Generate Report",
        "image": "https://cdn-icons-png.flaticon.com/512/1828/1828427.png"
      }
    },
    {
      "id": "8",
      "position": { "x": 1200, "y": 200 },
      "data": {
        "label": "End",
        "image": "https://cdn-icons-png.flaticon.com/512/1828/1828778.png"
      }
    }
  ],
  "connections": [
    { "from": "1", "to": ["2"], "type": "smooth" },
    { "from": "2", "to": ["3"], "type": "smooth" },
    { "from": "3", "to": ["4"], "type": "smooth" },
    { "from": "4", "to": ["5", "6"], "type": "smooth" },
    { "from": "5", "to": ["7"], "type": "smooth" },
    { "from": "6", "to": ["2"], "type": "step" },
    { "from": "7", "to": ["8"], "type": "smooth" }
  ]
}

Ensure your response adheres to this structure, includes at least 6-8 nodes, and is valid JSON. Do not include any explanations or text outside of the JSON object.`;

    console.log(contextMessage);

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: contextMessage }],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.4, // Further reduced temperature for more consistent output
      max_tokens: 2048, // Increased max tokens to allow for more complex responses
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
      console.error('Failed to parse AI response as JSON:', responseText);
      return NextResponse.json({ error: `Failed to parse AI response as JSON: ${parseError}` }, { status: 500 });
    }

    // Ensure the response structure is correct and has at least 6 nodes
    if (!parsedResponse.nodes || !parsedResponse.connections || parsedResponse.nodes.length < 6) {
      console.error('Invalid response structure or insufficient nodes:', parsedResponse);
      return NextResponse.json({ error: 'Invalid response structure or insufficient nodes' }, { status: 500 });
    }

    // Return the parsed response
    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Error creating flowchart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}