export async function onRequest(context) {
    const { request, params } = context;
    const { id } = params;
    const method = request.method;

    if (method === 'PUT') {
        const body = await request.json();
        return new Response(JSON.stringify({ id, ...body, message: 'Node updated (Stateless Demo)' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (method === 'DELETE') {
        return new Response(null, { status: 204 });
    }

    return new Response('Method not allowed', { status: 405 });
}
