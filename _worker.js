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
        // -------------------------------------------------------------
    // 3. API: Admin Bestellungen abrufen (/api/admin/orders)
    // -------------------------------------------------------------
    if (url.pathname === '/api/admin/orders' && request.method === 'GET') {
      try {
        const mollieRes = await fetch('https://api.mollie.com/v2/payments?limit=250', {
          headers: {
            'Authorization': `Bearer ${MOLLIE_API_KEY}`,
          },
        });

        const data = await mollieRes.json();

        if (!mollieRes.ok) {
          return new Response(
            JSON.stringify({ error: data.detail || 'Konnte Bestellungen nicht abrufen.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const rawPayments = data._embedded?.payments || [];
        const orders = rawPayments.map(p => {
          return {
            id: p.id,
            orderId: p.metadata?.orderId || (p.description?.match(/BBH-\d+-\d+/)?.[0]) || p.id,
            description: p.description,
            status: p.status, // 'paid', 'canceled', 'expired', 'pending', 'open'
            amount: p.amount?.value,
            currency: p.amount?.currency || 'EUR',
            method: p.method || 'Mollie Checkout',
            customer: p.metadata?.customer || null,
            items: p.metadata?.items || [],
            subtotal: p.metadata?.subtotal || '0.00',
            shipping: p.metadata?.shipping || '5.60',
            total: p.amount?.value || '0.00',
            createdAt: p.createdAt,
            paidAt: p.paidAt,
          };
        });

        return new Response(
          JSON.stringify({ success: true, count: orders.length, orders }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

        // -------------------------------------------------------------
    // 4. API: Admin Bestellung stornieren & erstatten (/api/admin/refund-order)
    // -------------------------------------------------------------
    if (url.pathname === '/api/admin/refund-order' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { paymentId, amount } = body;

        if (!paymentId) {
          return new Response(
            JSON.stringify({ error: 'Keine paymentId übergeben.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const refundPayload = amount ? { amount: { currency: 'EUR', value: Number(amount).toFixed(2) } } : {};

        const res = await fetch(`https://api.mollie.com/v2/payments/${paymentId}/refunds`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MOLLIE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(refundPayload),
        });

        const data = await res.json();

        if (!res.ok) {
          return new Response(
            JSON.stringify({ error: data.detail || 'Rückerstattung konnte nicht durchgeführt werden.', details: data }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, refund: data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 5. API: Webhook (/api/mollie-webhook)
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
    // 5. API: Bestell-E-Mails versenden (/api/send-order-emails)
    // -------------------------------------------------------------
    if (url.pathname === '/api/send-order-emails' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { orderId, customer, items, subtotal, shipping, total } = body;

        if (!customer || !customer.email || !orderId) {
          return new Response(JSON.stringify({ error: 'Unvollständige Bestelldaten für den E-Mail-Versand' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const RESEND_KEY = env.RESEND_API_KEY || 're_test_dummy';
        const STORE_EMAIL = env.STORE_NOTIFICATION_EMAIL || 'eaddicoc@gmail.com';

        // Items HTML for emails
        const itemsHtml = (items || []).map(it => `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;"><strong>${it.qty}x</strong> ${it.title}</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #1e293b; font-weight: bold;">${(Number(it.price) * Number(it.qty)).toFixed(2).replace('.', ',')} €</td>
          </tr>
        `).join('');

        // 1. HTML Email to Customer
        const customerEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
              .header { background: #071B33; padding: 30px; text-align: center; color: #ffffff; }
              .content { padding: 30px; line-height: 1.6; }
              .info-box { background: #f1f5f9; border-radius: 10px; padding: 16px; margin: 20px 0; border-left: 4px solid #D9A24A; }
              .table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
              .total-row { font-size: 16px; font-weight: bold; color: #071B33; }
              .footer { background: #f8fafc; padding: 20px 30px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Bickbeernhof Brokeloh</h1>
                <p style="margin: 6px 0 0 0; color: #D9A24A; font-size: 14px;">Bestellbestätigung ${orderId}</p>
              </div>
              <div class="content">
                <p>Hallo <strong>${customer.firstName} ${customer.lastName}</strong>,</p>
                <p>vielen herzlichen Dank für Ihren Einkauf im Bickbeernhof Onlineshop! Ihre Zahlung wurde erfolgreich bestätigt.</p>
                
                <div class="info-box">
                  <strong>📦 Schnellstmöglicher Versand:</strong><br>
                  Ihre Bestellung wird jetzt frisch zusammengestellt und schnellstmöglich sorgfältig verpackt an Sie versendet.<br><br>
                  <strong>📄 Hinweis zur Rechnung:</strong><br>
                  Ihre ordentliche, gedruckte Rechnung liegt Ihrer Lieferung direkt im Paket bei.
                </div>

                <h3 style="color: #071B33; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 25px;">Ihre bestellten Köstlichkeiten:</h3>
                <table class="table">
                  <tbody>
                    ${itemsHtml}
                    <tr>
                      <td style="padding: 8px 0; color: #64748b;">Versandkostenpauschale:</td>
                      <td style="padding: 8px 0; text-align: right; color: #64748b;">${Number(shipping || 5.60).toFixed(2).replace('.', ',')} €</td>
                    </tr>
                    <tr class="total-row">
                      <td style="padding: 12px 0; border-top: 2px solid #071B33;">Gesamtbetrag (inkl. MwSt.):</td>
                      <td style="padding: 12px 0; border-top: 2px solid #071B33; text-align: right; color: #2c5e3b;">${Number(total).toFixed(2).replace('.', ',')} €</td>
                    </tr>
                  </tbody>
                </table>

                <h3 style="color: #071B33; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 25px;">Lieferadresse:</h3>
                <p style="color: #334155; margin-bottom: 25px;">
                  ${customer.firstName} ${customer.lastName}<br>
                  ${customer.street}<br>
                  ${customer.zip} ${customer.city}
                </p>

                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; font-size: 13px; color: #475569;">
                  <strong>Haben Sie Fragen oder möchten Sie Ihre Bestellung ändern?</strong><br>
                  Sie erreichen uns jederzeit per E-Mail unter <a href="mailto:post@bickbeernhof.de" style="color: #D9A24A;">post@bickbeernhof.de</a> oder telefonisch unter <strong>0 50 27 / 15 66</strong>.
                </div>
              </div>
              <div class="footer">
                <p>Bickbeernhof Café GmbH • Brokeloher Dorfstraße 2 • 31628 Landesbergen</p>
                <p>AG Walsrode HRB 210307 • Steuer-Nr.: 34/241/20229 • USt-IdNr.: DE 270109408</p>
              </div>
            </div>
          </body>
          </html>
        `;

        // 2. HTML Email to Store Owner
        const storeEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; background: #f8fafc; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 30px; }
              .btn { display: inline-block; background: #D9A24A; color: #080A0F; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2 style="color: #2c5e3b; margin-top: 0;">🛍️ Neue Shop-Bestellung eingegangen!</h2>
              <p>Es ist soeben eine neue bezahlte Bestellung im Bickbeernhof Onlineshop eingegangen:</p>
              
              <div style="background: #f1f5f9; padding: 16px; border-radius: 10px; margin: 15px 0;">
                <strong>Bestell-Nr.:</strong> ${orderId}<br>
                <strong>Gesamtbetrag:</strong> <span style="font-size: 18px; font-weight: bold; color: #2c5e3b;">${Number(total).toFixed(2).replace('.', ',')} €</span><br>
                <strong>Kunde:</strong> ${customer.firstName} ${customer.lastName} (${customer.email})<br>
                <strong>Adresse:</strong> ${customer.street}, ${customer.zip} ${customer.city}
              </div>

              <h4 style="margin-bottom: 8px;">Artikel:</h4>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tbody>${itemsHtml}</tbody>
              </table>

              <div style="text-align: center; margin-top: 25px;">
                <a href="${url.origin}/admin.html" class="btn">Zum Admin Dashboard →</a>
              </div>
            </div>
          </body>
          </html>
        `;

        // Send via Resend API if API key is provided
        if (RESEND_KEY && RESEND_KEY.startsWith('re_') && RESEND_KEY !== 're_test_dummy') {
          // Send customer email
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'Bickbeernhof Onlineshop <bestellung@bickbeernhof.de>',
              to: [customer.email],
              subject: `Ihre Bestellung bei Bickbeernhof Brokeloh (${orderId})`,
              html: customerEmailHtml
            })
          });

          // Send store notification email
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'Bickbeernhof System <bestellung@bickbeernhof.de>',
              to: [STORE_EMAIL],
              subject: `🛍️ Neue Bestellung ${orderId} (${Number(total).toFixed(2).replace('.', ',')} €)`,
              html: storeEmailHtml
            })
          });
        }

        console.log(`[Order Emails] Prepared order emails for ${orderId} to customer ${customer.email} and store ${STORE_EMAIL}`);

        return new Response(JSON.stringify({ success: true, message: 'Bestell-E-Mails verarbeitet.' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (err) {
        console.error('Fehler beim E-Mail Versand:', err);
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // -------------------------------------------------------------
    // 6. Statische Dateien ausliefern
    // -------------------------------------------------------------
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return fetch(request);
  },
};
