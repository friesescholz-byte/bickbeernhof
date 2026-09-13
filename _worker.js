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

    const MOLLIE_API_KEY = env.MOLLIE_API_KEY || 'test_pTz234cDWR7VtKf2GfWHRWeqWw3yjp';

    // -------------------------------------------------------------
    // 1. API: Zahlung erstellen (/api/create-payment)
    // -------------------------------------------------------------
        // Route /produkt to /produkt.html
    if (url.pathname === '/produkt') {
      return env.ASSETS.fetch(new Request(new URL('/produkt.html' + url.search, request.url), request));
    }

    
    // -------------------------------------------------------------
    // API: GET & POST /api/events (Cloudflare KV persistence & Auto-Expiry)
    // -------------------------------------------------------------
    if (url.pathname === '/api/events') {
      const defaultEvents = [
        {
          id: "ev-2026-08-22",
          title: "Gemeinsames Singen auf unserem Hof",
          date: "2026-08-22",
          time: "ab 19:00 Uhr",
          desc: "In gemütlicher Atmosphäre am Lagerfeuer stimmen wir altbekannte Weisen, Schlager und stimmungsvolle Lieder an. Ein Erlebnis voller Wärme und Geselligkeit."
        },
        {
          id: "ev-2026-09-04",
          title: "Kultur in der Natur",
          subtitle: "In Zusammenarbeit mit dem Piglet Zirkus",
          date: "2026-09-04",
          time: "ab 17:00 Uhr",
          desc: "Kultur in der Natur in Zusammenarbeit mit dem Piglet Zirkus – erleben Sie faszinierende Darbietungen, Akrobatik und stimmungsvolle Momente zwischen den Heidelbeersträuchern."
        },
        {
          id: "ev-2026-09-06",
          title: "Hildegard-Knef-Abend",
          date: "2026-09-06",
          time: "ab 19:00 Uhr",
          desc: "Ein ganz besonderer Chanson- und Theaterabend zu Ehren der großen Hildegard Knef. Ein unvergesslicher musikalischer Abend im idyllischen Ambiente unseres Hofes."
        },
        {
          id: "ev-2026-09-20",
          title: "Kindertag & letzter Saisontag",
          date: "2026-09-20",
          time: "ab 10:00 Uhr",
          desc: "Unser großer Familientag und feierlicher Saisonabschluss! Kinderschminken, spannende Spiele, Toben auf dem Spielplatz und der krönende Abschluss unserer Blaubeersaison."
        }
      ];

      if (request.method === 'GET') {
        try {
          let events = null;
          if (env.EVENTS_KV) {
            events = await env.EVENTS_KV.get('bickbeern_events', { type: 'json' });
          }
          if (!events || !Array.isArray(events) || events.length === 0) {
            events = defaultEvents;
            if (env.EVENTS_KV) {
              await env.EVENTS_KV.put('bickbeern_events', JSON.stringify(events));
            }
          }

          // Calculate current date string in Berlin timezone (YYYY-MM-DD)
          const nowBerlin = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Berlin' });
          const todayStr = nowBerlin.split(' ')[0];

          const activeOnly = url.searchParams.get('active_only') === 'true';

          let processed = events.map(ev => {
            const isPast = ev.date && (ev.date < todayStr);
            const isToday = ev.date && (ev.date === todayStr);
            return { ...ev, isPast, isToday };
          });

          // Sort chronologically ascending
          processed.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

          if (activeOnly) {
            // Automatically filter out expired past events for the public website!
            processed = processed.filter(ev => !ev.isPast);
          }

          return new Response(JSON.stringify({ success: true, events: processed, today: todayStr }), {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
          });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const { events } = body;
          if (!Array.isArray(events)) {
            return new Response(JSON.stringify({ error: 'Array erwartet.' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          if (env.EVENTS_KV) {
            await env.EVENTS_KV.put('bickbeern_events', JSON.stringify(events));
          }

          return new Response(JSON.stringify({ success: true, count: events.length }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }

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

                // Strict Separate 6er-Karton Verification (Flaschen 0,7l/0,75l vs Gläser)
        let totalBottles = 0;
        let totalJars = 0;
        items.forEach(item => {
          const qty = Number(item.qty || 1);
          if (item.id === 'p4' || item.id === 'p15' || item.isBottle) {
            totalBottles += qty;
          } else if (item.isJar || item.isGlass) {
            totalJars += qty;
          }
        });
        if (totalBottles > 0 && totalBottles % 6 !== 0) {
          const needed = 6 - (totalBottles % 6);
          return new Response(
            JSON.stringify({ error: `Flaschenkarton (0,7l/0,75l) unvollständig. Es fehlen noch ${needed} Flasche(n) für die 6er-Kartonage.` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (totalJars > 0 && totalJars % 6 !== 0) {
          const needed = 6 - (totalJars % 6);
          return new Response(
            JSON.stringify({ error: `Gläserkarton unvollständig. Es fehlen noch ${needed} Glas/Gläser für die 6er-Kartonage.` }),
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
          redirectUrl: redirectUrl,
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
        const mollieRes = await fetch('https://api.mollie.com/v2/payments?limit=50', {
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
                  Ihre Bestellung wird jetzt frisch auf unserem Hof zusammengestellt und schnellstmöglich sorgfältig bruchsicher verpackt an Sie versendet.<br><br>
                  <strong>📄 Hinweis zu Kaufvertrag &amp; Rechnung:</strong><br>
                  Vielen Dank für Ihre Bestellung! Mit dieser Eingangsbestätigung und der erfolgreichen Autorisierung Ihrer Online-Zahlung ist Ihr Auftrag verbindlich angenommen. Ihre ordentliche Rechnung mit ausgewiesener Mehrwertsteuer erhalten Sie in Kürze separat per E-Mail oder Ihrer Lieferung beiliegend.
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
                <p>AG Walsrode HRB 210307 • Steuer-Nr.: 34/241/20229 • USt-IdNr.: DE426381968</p>
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

        let resendCustomerResult = null;
        let resendStoreResult = null;
        let resendError = null;

        const FROM_EMAIL = env.RESEND_FROM_EMAIL || 'Bickbeernhof Onlineshop <noreply@scholz-friese-webdesign.de>';

        if (RESEND_KEY && RESEND_KEY.startsWith('re_') && RESEND_KEY !== 're_test_dummy') {
          try {
            // 1. Send customer confirmation email
            const res1 = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: FROM_EMAIL,
                to: [customer.email],
                reply_to: 'post@bickbeernhof.de',
                subject: `Ihre Bestellung bei Bickbeernhof Brokeloh (${orderId})`,
                html: customerEmailHtml
              })
            });
            resendCustomerResult = await res1.json();

            // 2. Send store notification email
            const res2 = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: FROM_EMAIL,
                to: [STORE_EMAIL],
                reply_to: customer.email,
                subject: `🛍️ Neue Bestellung ${orderId} (${Number(total).toFixed(2).replace('.', ',')} €)`,
                html: storeEmailHtml
              })
            });
            resendStoreResult = await res2.json();

            console.log(`[Resend Sent] Customer:`, resendCustomerResult, `Store:`, resendStoreResult);
          } catch (e) {
            resendError = e.message;
            console.error('[Resend Error]', e);
          }
        } else {
          console.warn('[Resend Skipped] Kein gültiger RESEND_API_KEY in Cloudflare Worker konfiguriert.');
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Bestell-E-Mails verarbeitet.',
          resendActive: Boolean(RESEND_KEY && RESEND_KEY.startsWith('re_') && RESEND_KEY !== 're_test_dummy'),
          customerEmailStatus: resendCustomerResult,
          storeEmailStatus: resendStoreResult,
          resendError
        }), {
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
    // 5b. API: Rechnung per E-Mail versenden (/api/send-invoice-email)
    // -------------------------------------------------------------
    if (url.pathname === '/api/send-invoice-email' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { order } = body;

        if (!order || !order.customer || !order.customer.email) {
          return new Response(JSON.stringify({ error: 'Keine gültige Empfänger-E-Mail-Adresse für den Rechnungsversand angegeben.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const c = order.customer;
        const orderId = order.orderId || 'Bestellung';
        const numPart = parseInt(orderId.replace(/\D/g, '') || '4618', 10);
        const invoiceNum = order.invoiceNumber || String(2000 + (numPart % 1000));
        
        const d = order.createdAt ? new Date(order.createdAt) : new Date();
        const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        const invoiceDate = `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;

        const items = order.items || [];
        let subtotal = 0;
        let brutto7 = 0;
        let brutto19 = 0;

        const itemsHtml = items.map((it, idx) => {
          const qty = Number(it.qty) || 1;
          const price = Number(it.price) || 0;
          const lineTotal = price * qty;
          subtotal += lineTotal;

          const is19 = (it.id === 'p15' || it.id === 'p4' || it.id === 'p16' || (it.title && (it.title.toLowerCase().includes('wein') || it.title.toLowerCase().includes('likör') || it.title.toLowerCase().includes('saft') || it.title.toLowerCase().includes('sirup'))));
          if (is19) brutto19 += lineTotal;
          else brutto7 += lineTotal;

          const bg = (idx % 2 === 1) ? 'background-color: #F8FAFC;' : 'background-color: #FFFFFF;';
          return `
            <tr style="${bg}">
              <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #0F172A; font-size: 13px;">${it.title}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; text-align: center; color: #0F172A; font-size: 13px;">${qty}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; text-align: right; color: #0F172A; font-size: 13px;">${price.toFixed(2).replace('.', ',')} €</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; text-align: right; color: #0F172A; font-size: 13px; font-weight: bold;">${lineTotal.toFixed(2).replace('.', ',')} €</td>
            </tr>
          `;
        }).join('');

        const shipping = (order.shipping !== undefined) ? Number(order.shipping) : 5.60;
        const total = (order.total !== undefined) ? Number(order.total) : (subtotal + shipping);
        brutto19 += shipping;

        const netto7 = brutto7 / 1.07;
        const mwst7 = brutto7 - netto7;
        const netto19 = brutto19 / 1.19;
        const mwst19 = brutto19 - netto19;
        const nettoTotal = netto7 + netto19;

        const emailHtml = `
          <!DOCTYPE html>
          <html lang="de">
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; background-color: #F1F5F9; margin: 0; padding: 24px; line-height: 1.5; }
              .container { max-width: 620px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
              .header { background: #071B33; padding: 28px 32px; text-align: center; color: #FFFFFF; }
              .content { padding: 32px; }
              .meta-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; margin: 20px 0; font-size: 13px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background: #E5E7EB; color: #0F172A; padding: 10px 12px; font-size: 12px; text-align: left; }
              .footer { background: #F8FAFC; padding: 24px 32px; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/website-datein/bickbeernhof/logo.png" alt="Bickbeernhof" style="height: 48px; margin-bottom: 8px;">
                <div style="color: #D9A24A; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Rechnung zu Ihrer Bestellung</div>
              </div>
              <div class="content">
                <p style="font-size: 15px; margin-top: 0;">Hallo <strong>${c.firstName || ''} ${c.lastName || ''}</strong>,</p>
                <p style="font-size: 14px; color: #475569;">anbei erhalten Sie die offizielle Rechnung zu Ihrer Bestellung im Bickbeernhof Onlineshop als Übersicht für Ihre Unterlagen.</p>
                
                <div class="meta-box">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span><strong>Rechnungsnummer:</strong> ${invoiceNum}</span>
                    <span><strong>Datum:</strong> ${invoiceDate}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span><strong>Bestellnummer:</strong> ${orderId}</span>
                    <span><strong>Zahlungsstatus:</strong> Vollständig bezahlt</span>
                  </div>
                </div>

                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr>
                      <th style="border-radius: 6px 0 0 0;">Bezeichnung</th>
                      <th style="text-align: center;">Menge</th>
                      <th style="text-align: right;">Einzelpreis</th>
                      <th style="text-align: right; border-radius: 0 6px 0 0;">Gesamt</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>

                <div style="width: 260px; margin-left: auto; font-size: 13px; margin-top: 15px;">
                  <div style="display: flex; justify-content: space-between; padding: 3px 0; color: #475569;">
                    <span>Zwischensumme:</span>
                    <span>${subtotal.toFixed(2).replace('.', ',')} €</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 3px 0; color: #475569;">
                    <span>Versand:</span>
                    <span>${shipping.toFixed(2).replace('.', ',')} €</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; margin-top: 6px; border-top: 1.5px solid #0F172A; border-bottom: 2.5px double #0F172A; font-weight: 800; font-size: 15px; color: #0F172A;">
                    <span>Gesamtbetrag:</span>
                    <span>${total.toFixed(2).replace('.', ',')} €</span>
                  </div>
                  <div style="margin-top: 10px; font-size: 11px; color: #64748B; line-height: 1.5;">
                    <div style="display: flex; justify-content: space-between;">
                      <span>Netto:</span>
                      <span>${nettoTotal.toFixed(2).replace('.', ',')} €</span>
                    </div>
                    ${mwst7 > 0 ? `
                      <div style="display: flex; justify-content: space-between;">
                        <span>MwSt. 7 %:</span>
                        <span>${mwst7.toFixed(2).replace('.', ',')} €</span>
                      </div>
                    ` : ''}
                    ${mwst19 > 0 ? `
                      <div style="display: flex; justify-content: space-between;">
                        <span>MwSt. 19 %:</span>
                        <span>${mwst19.toFixed(2).replace('.', ',')} €</span>
                      </div>
                    ` : ''}
                  </div>
                </div>

                <div style="margin-top: 30px; background: #FAF6F0; border-left: 4px solid #D9A24A; border-radius: 8px; padding: 14px 18px; font-size: 13px; color: #475569;">
                  <strong>Vielen Dank für Ihre Unterstützung unseres regionalen Hofbetriebs!</strong><br>
                  Bei Rückfragen zu Ihrer Lieferung oder Rechnung stehen wir Ihnen jederzeit unter <a href="mailto:post@bickbeernhof.de" style="color: #071B33; font-weight: bold;">post@bickbeernhof.de</a> oder telefonisch unter 0 50 27 / 15 66 zur Verfügung.
                </div>
              </div>

              <div class="footer">
                <strong>Bickbeernhof Cafe GmbH</strong> • Brokeloher Hauptstraße 37 • 31628 Landesbergen<br>
                Geschäftsführung: Sylke Herse • Amtsgericht Walsrode HRB 210307<br>
                Steuernummer: 34/241/20229 • <strong>USt-IdNr.: DE426381968</strong><br>
                Bankverbindung: IBAN DE25 2559 1413 3146 0658 00 • BIC GENODEF1BCK
              </div>
            </div>
          </body>
          </html>
        `;

        const { pdfBase64, filename } = body;
        const RESEND_KEY = env.RESEND_API_KEY || 're_test_dummy';
        const FROM_EMAIL = env.RESEND_FROM_EMAIL || 'Bickbeernhof Onlineshop <noreply@scholz-friese-webdesign.de>';

        const attachments = [];
        if (pdfBase64) {
          attachments.push({
            filename: filename || `Rechnung_${invoiceNum}.pdf`,
            content: pdfBase64
          });
        }

        let resendResult = null;
        if (RESEND_KEY && RESEND_KEY.startsWith('re_') && RESEND_KEY !== 're_test_dummy') {
          const emailPayload = {
            from: FROM_EMAIL,
            to: [c.email],
            reply_to: 'post@bickbeernhof.de',
            subject: `Ihre Rechnung ${invoiceNum} zu Bestellung ${orderId} – Bickbeernhof Brokeloh`,
            html: emailHtml
          };
          if (attachments.length > 0) {
            emailPayload.attachments = attachments;
          }

          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailPayload)
          });
          resendResult = await res.json();
        } else {
          console.log('[Invoice Email Simulated] Empfänger:', c.email, 'Rechnung:', invoiceNum);
        }

        return new Response(JSON.stringify({
          success: true,
          sentAt: new Date().toISOString(),
          recipient: c.email,
          invoiceNumber: invoiceNum,
          resendResult
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (err) {
        console.error('Fehler beim Rechnungs-E-Mail-Versand:', err);
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
      const assetRes = await env.ASSETS.fetch(request);
      if (url.pathname.includes('admin') || url.pathname.endsWith('.html')) {
        const newHeaders = new Headers(assetRes.headers);
        newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        return new Response(assetRes.body, {
          status: assetRes.status,
          statusText: assetRes.statusText,
          headers: newHeaders
        });
      }
      return assetRes;
    }

    return fetch(request);
  },
};
