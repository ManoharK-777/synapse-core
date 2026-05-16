export async function onRequest(context) {
    const stats = {
        uptime: Math.floor(Math.random() * 10000),
        memoryUsage: { rss: 150000000 },
        nodeCount: 3,
        networkLoad: `${Math.floor(Math.random() * 100)}%`
    };

    return new Response(JSON.stringify(stats), {
        headers: { 'Content-Type': 'application/json' }
    });
}
