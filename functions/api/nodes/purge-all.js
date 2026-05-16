export async function onRequest(context) {
    if (context.request.method === 'DELETE') {
        return new Response(JSON.stringify({ message: 'All nodes purged (Stateless Demo)' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    return new Response('Method not allowed', { status: 405 });
}
