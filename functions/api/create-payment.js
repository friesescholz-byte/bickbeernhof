/**
 * Cloudflare Pages Function: /api/create-payment
 * Erstellt eine Zahlung über die offizielle Mollie Payments API v2
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json();
    const { customer, items, paymentMethod } = body;

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Ungültige Bestelldaten. Warenkorb oder Kundendaten fehlen.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // API Key aus Cloudflare Secrets/Env oder Fallback auf den bereitgestellten Test-Key
    const MOLLIE_API_KEY = env.MOLLIE_API_KEY || 'test_Ty6CUMJETNNEssG6gpqnbqPzae7Jnt';

    // Summe berechnen
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty)), 0);
    const shipping = 5.60;
    const total = subtotal + shipping;
    const formattedAmount = total.toFixed(2);

    // Eindeutige Bestellnummer generieren (z. B. BBH-2026-8392)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `BBH-2026-${randomSuffix}`;

    // Origin für Redirects ermitteln
    const url = new URL(request.url);
    const origin = url.origin;

    const redirectUrl = `${origin}/bestellung-erfolgreich.html?orderId=${orderId}`;
    const cancelUrl = `${origin}/shop.html?payment=cancelled`;

    // Beschreibung für Abrechnung & E-Mail
    const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
    const description = `Bickbeernhof Bestellung ${orderId} (${itemCount} Artikel)`;

    // Mollie Payload
    const molliePayload = {
      amount: {
        currency: 'EUR',
        value: formattedAmount,
      },
      description: description,
      redirectUrl: `${redirectUrl}&paymentId={id}`,
      cancelUrl: cancelUrl,
      metadata: {
        orderId: orderId,
        customer: {
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          email: customer.email || '',
          street: customer.street || '',
          zip: customer.zip || '',
          city: customer.city || '',
        },
        items: items.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          qty: item.qty,
        })),
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        total: formattedAmount,
        createdAt: new Date().toISOString(),
      },
    };

    // Optional: Wenn eine valide Mollie-Methode gewählt wurde, mitgeben
    const validMollieMethods = ['paypal', 'creditcard', 'banktransfer', 'klarnapaylater', 'applepay', 'sofort', 'giropay', 'ideal'];
    let mappedMethod = paymentMethod;
    if (paymentMethod === 'klarna') mappedMethod = 'klarnapaylater';
    if (paymentMethod === 'sofort') mappedMethod = 'sofort';

    if (mappedMethod && validMollieMethods.includes(mappedMethod)) {
      molliePayload.method = mappedMethod;
    }

    // Webhook URL nur setzen, wenn wir auf einer echten HTTPS Domain laufen (nicht localhost)
    if (origin.startsWith('https://') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      molliePayload.webhookUrl = `${origin}/api/mollie-webhook`;
    }

    // Anruf an Mollie API v2
    const mollieResponse = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MOLLIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(molliePayload),
    });

    const mollieData = await mollieResponse.json();

    if (!mollieResponse.ok) {
      // Wenn die gewählte Methode im Profil nicht aktiv ist, ohne 'method' Parameter erneut versuchen (Mollie zeigt dann seinen Methoden-Auswahl-Screen)
      if (mollieData.status === 422 && molliePayload.method) {
        delete molliePayload.method;
        const retryResponse = await fetch('https://api.mollie.com/v2/payments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MOLLIE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(molliePayload),
        });
        const retryData = await retryResponse.json();
        if (retryResponse.ok && retryData._links?.checkout?.href) {
          return new Response(
            JSON.stringify({
              success: true,
              orderId: orderId,
              paymentId: retryData.id,
              checkoutUrl: retryData._links.checkout.href,
            }),
            { status: 200, headers: corsHeaders }
          );
        }
      }

      console.error('Mollie API Fehler:', mollieData);
      return new Response(
        JSON.stringify({
          error: mollieData.detail || mollieData.title || 'Zahlung konnte nicht initialisiert werden.',
          details: mollieData,
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: orderId,
        paymentId: mollieData.id,
        checkoutUrl: mollieData._links.checkout.href,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error('Server Fehler beim Erstellen der Zahlung:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Interner Server-Fehler' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
