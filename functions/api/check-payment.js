/**
 * Cloudflare Pages Function: /api/check-payment
 * Prüft den Status einer Zahlung direkt bei Mollie
 */

export async function onRequestGet(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const url = new URL(request.url);
    const paymentId = url.searchParams.get('paymentId');

    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'Keine paymentId übergeben.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const MOLLIE_API_KEY = env.MOLLIE_API_KEY || 'test_Ty6CUMJETNNEssG6gpqnbqPzae7Jnt';

    const response = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MOLLIE_API_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.detail || 'Zahlungsprüfung fehlgeschlagen.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        id: data.id,
        status: data.status, // 'paid', 'canceled', 'expired', 'pending', 'open'
        amount: data.amount,
        description: data.description,
        method: data.method,
        createdAt: data.createdAt,
        paidAt: data.paidAt,
        metadata: data.metadata || {},
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Server-Fehler' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
