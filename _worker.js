/**
 * Cloudflare Worker / Pages Universal Edge Router
 * Behandelt statische Assets und Mollie Payment API Routen
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS Headers für API-Endpunkte
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }

    const MOLLIE_API_KEY = env.MOLLIE_API_KEY || 'test_Ty6CUMJETNNEssG6gpqnbqPzae7Jnt';

    // -------------------------------------------------------------
    // 1. API: Zahlung erstellen (/api/create-payment)
    // -------------------------------------------------------------
    if (url.pathname === '/api/create-payment' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { customer, items } = body;

        if (!customer || !items || !Array.isArray(items) || items.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Ungültige Bestelldaten. Warenkorb oder Kundendaten fehlen.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty)), 0);
        const shipping = 5.60;
        const total = subtotal + shipping;
        const formattedAmount = total.toFixed(2);

        // Bestellnummer generieren
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const orderId = `BBH-2026-${randomSuffix}`;

        const origin = url.origin;
        const redirectUrl = `${origin}/bestellung-erfolgreich.html?orderId=${orderId}`;
        const cancelUrl = `${origin}/shop.html?payment=cancelled`;

        const itemCount = items.reduce((sum, item) => sum + Number(item.qty), 0);
        const description = `Bickbeernhof Bestellung ${orderId} (${itemCount} Artikel)`;

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

        // Webhook nur auf echten Domains
        if (origin.startsWith('https://') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
          molliePayload.webhookUrl = `${origin}/api/mollie-webhook`;
        }

        const mollieRes = await fetch('https://api.mollie.com/v2/payments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MOLLIE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(molliePayload),
        });

        const mollieData = await mollieRes.json();

        if (!mollieRes.ok || !mollieData._links?.checkout?.href) {
          return new Response(
            JSON.stringify({
              error: mollieData.detail || mollieData.title || 'Zahlung konnte nicht bei Mollie initialisiert werden.',
              details: mollieData,
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            orderId: orderId,
            paymentId: mollieData.id,
            checkoutUrl: mollieData._links.checkout.href,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message || 'Serverfehler beim Erstellen der Zahlung' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // -------------------------------------------------------------
    // 2. API: Status prüfen (/api/check-payment)
    // -------------------------------------------------------------
    if (url.pathname === '/api/check-payment' && request.method === 'GET') {
      try {
        const paymentId = url.searchParams.get('paymentId');
        if (!paymentId) {
          return new Response(
            JSON.stringify({ error: 'Keine paymentId angegeben.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const response = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${MOLLIE_API_KEY}`,
          },
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // -------------------------------------------------------------
    // 3. API: Webhook (/api/mollie-webhook)
    // -------------------------------------------------------------
    if (url.pathname === '/api/mollie-webhook' && request.method === 'POST') {
      try {
        const formData = await request.formData();
        const paymentId = formData.get('id');
        if (paymentId) {
          const res = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
            headers: { 'Authorization': `Bearer ${MOLLIE_API_KEY}` },
          });
          const payment = await res.json();
          console.log(`[Mollie Webhook] Status: ${payment.status} for Order ${payment.metadata?.orderId}`);
        }
        return new Response('OK', { status: 200 });
      } catch (err) {
        return new Response('Error', { status: 500 });
      }
    }

    // -------------------------------------------------------------
    // 4. Statische Dateien ausliefern
    // -------------------------------------------------------------
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return fetch(request);
  },
};
