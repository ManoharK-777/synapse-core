// Cloudflare Pages Function for /api/nodes
let mockNodes = [
    { id: '1', name: 'Neural-Alpha', status: 'Active', latency: '12ms', type: 'Processing' },
    { id: '2', name: 'Core-Sigma', status: 'Active', latency: '45ms', type: 'Storage' },
    { id: '3', name: 'Nexus-Beta', status: 'Idle', latency: '120ms', type: 'Routing' }
];

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const method = request.method;

    // Handle GET /api/nodes
    if (method === 'GET') {
        return new Response(JSON.stringify(mockNodes), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Handle POST /api/nodes
    if (method === 'POST') {
        const body = await request.json();
        const newNode = {
            id: Date.now().toString(),
            name: body.name || 'New-Node',
            status: 'Active',
            latency: `${Math.floor(Math.random() * 100)}ms`,
            type: body.type || 'Generic'
        };
        // Note: In production, you would save this to Cloudflare KV or D1
        mockNodes.push(newNode); 
        return new Response(JSON.stringify(newNode), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response('Method not allowed', { status: 405 });
}
