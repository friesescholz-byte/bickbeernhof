/**
 * Cloudflare Pages Function: /api/mollie-webhook
 * Empfängt Status-Updates von Mollie bei Zahlungsänderungen
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const paymentId = formData.get('id');

    if (!paymentId) {
      return new Response('Missing payment ID', { status: 400 });
    }

    const MOLLIE_API_KEY = env.MOLLIE_API_KEY || 'test_Ty6CUMJETNNEssG6gpqnbqPzae7Jnt';

    // Status bei Mollie verifizieren
    const response = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MOLLIE_API_KEY}`,
      },
    });

    const payment = await response.json();

    if (response.ok) {
      console.log(`[Mollie Webhook] Payment ${payment.id} status: ${payment.status}, Order: ${payment.metadata?.orderId}`);
      // Hier kann später ein automatischer E-Mail-Versand (z. B. via Resend oder Cloudflare Email) angestoßen werden
    }

    // Mollie erwartet 200 OK
    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('[Mollie Webhook Error]:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
