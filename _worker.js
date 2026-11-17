import { defaultProducts } from './products-data.js';

const CLOUDFLARE_ACCOUNT_ID = '73d6308cb7c5d11e8200bebfcd6e412e';
const CLOUDFLARE_API_TOKEN_FALLBACK = '';
const R2_BUCKET_NAME = 'website-datein';
const R2_PUBLIC_PREFIX = 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev';

async function uploadToR2(env, key, buffer, contentType) {
  if (env.R2_BUCKET && typeof env.R2_BUCKET.put === 'function') {
    await env.R2_BUCKET.put(key, buffer, {
      httpMetadata: { contentType: contentType || 'image/webp' }
    });
    return `${R2_PUBLIC_PREFIX}/${key}`;
  }
  const token = env.CLOUDFLARE_API_TOKEN || CLOUDFLARE_API_TOKEN_FALLBACK;
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${R2_BUCKET_NAME}/objects/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': contentType || 'image/webp'
    },
    body: buffer
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`R2 Upload fehlgeschlagen: ${res.status} ${errText}`);
  }
  return `${R2_PUBLIC_PREFIX}/${key}`;
}

async function deleteFromR2(env, key) {
  if (env.R2_BUCKET && typeof env.R2_BUCKET.delete === 'function') {
    await env.R2_BUCKET.delete(key);
    return true;
  }
  const token = env.CLOUDFLARE_API_TOKEN || CLOUDFLARE_API_TOKEN_FALLBACK;
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${R2_BUCKET_NAME}/objects/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.ok;
}

async function getCatalogProducts(env) {
  try {
    if (env && env.EVENTS_KV) {
      const prods = await env.EVENTS_KV.get('bickbeern_products', { type: 'json' });
      if (Array.isArray(prods) && prods.length > 0) return prods;
    }
  } catch (e) {}
  return defaultProducts;
}

function getPackagingKind(prod) {
  if (!prod) return 'none';
  if (prod.packagingType === 'free_shipping' || prod.freeShipping) return 'free_shipping';
  if (prod.packagingType === 'none') return 'none';
  if (prod.packagingType === 'bottle' || prod.isBottle || prod.id === 'p4' || prod.id === 'p15' || prod.id === 'p19' || prod.id === 'p20') {
    return 'bottle';
  }
  if (prod.packagingType === 'jar' || prod.isJar || prod.isGlass) {
    return 'jar';
  }
  return 'none';
}

function getItemVatRate(item, catalog) {
  if (!item) return 7;
  if (item.vatRate === 19 || item.vatRate === '19') return 19;
  if (item.vatRate === 7 || item.vatRate === '7') return 7;
  if (item.id === 'circujar-pfand') return 7;

  const prod = Array.isArray(catalog) ? catalog.find(p => p.id === item.id) : null;
  if (prod) {
    if ((prod.vat && String(prod.vat).includes('19')) || prod.isWine) return 19;
    return 7;
  }

  const t = (item.title || '').toLowerCase();
  if (
    item.id === 'p4' || item.id === 'p5' || item.id === 'p15' || item.id === 'p16' || item.id === 'p19' || item.id === 'p20' ||
    t.includes('wein') || t.includes('likör') || t.includes('saft') || t.includes('sirup') ||
    t.includes('bier') || t.includes('gin') || t.includes('1,5l')
  ) {
    return 19;
  }
  return 7;
}

const BICKBEERNHOF_LOGO_URL = 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/website-datein/bickbeernhof/logo.png';

function renderBickbeernhofEmailShell({ preheader = '', eyebrow = '', title = '', bodyHtml = '', footerExtraHtml = '' }) {
  return `<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title || 'Bickbeernhof Brokeloh'}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F5F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  ${preheader ? `<div style="display: none; font-size: 1px; color: #F3F5F7; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: #F3F5F7;">
    <tr>
      <td align="center" style="padding: 28px 16px;">
        <!--[if mso]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" align="center">
        <tr><td>
        <![endif]-->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden;">
          <!-- Dachleiste -->
          <tr>
            <td style="background-color: #071B33; height: 5px; font-size: 1px; line-height: 1px;">&nbsp;</td>
          </tr>
          <!-- Briefkopf -->
          <tr>
            <td style="padding: 26px 32px 20px 32px; border-bottom: 1px solid #E2E8F0; background-color: #FFFFFF;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <img src="${BICKBEERNHOF_LOGO_URL}" alt="Bickbeernhof Brokeloh" width="145" height="44" style="height: 44px; width: auto; display: block; border: 0; color: #071B33; font-size: 18px; font-weight: bold;">
                  </td>
                  <td align="right" valign="middle" style="text-align: right;">
                    ${eyebrow ? `<div style="font-size: 11px; font-weight: 700; letter-spacing: 0.9px; text-transform: uppercase; color: #B45309; margin-bottom: 3px;">${eyebrow}</div>` : ''}
                    <div style="font-size: 15px; font-weight: 700; color: #071B33;">${title}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Inhalt -->
          <tr>
            <td style="padding: 28px 32px; font-size: 14px; line-height: 1.6; color: #334155;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; font-size: 11.5px; line-height: 1.6; color: #64748B;">
              ${footerExtraHtml ? `<div style="margin-bottom: 10px;">${footerExtraHtml}</div>` : ''}
              <div style="font-weight: 700; color: #334155;">Bickbeernhof Cafe GmbH</div>
              <div>Brokeloher Hauptstraße 37 &bull; 31628 Landesbergen</div>
              <div>Tel.: 0 50 27 / 15 66 &bull; E-Mail: post@bickbeernhof.de</div>
              <div>Amtsgericht Walsrode HRB 210307 &bull; Steuer-Nr.: 34/241/20229 &bull; USt-IdNr.: DE426381968</div>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td></tr></table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendOrderEmailsInternal(env, origin, order) {
  const RESEND_KEY = env.RESEND_API_KEY || '';
  const STORE_EMAIL = env.STORE_NOTIFICATION_EMAIL || 'post@bickbeernhof.de';
  const FROM_EMAIL = env.RESEND_FROM_EMAIL || 'Bickbeernhof Onlineshop <noreply@scholz-friese-webdesign.de>';

  const customer = order.customer || {};
  const orderId = order.orderId || 'Bestellung';
  const items = order.items || [];
  const shipping = (order.shipping !== undefined) ? Number(order.shipping) : 5.60;
  const total = Number(order.total || 0);
  const subtotal = Math.max(0, total - shipping);

  if (!customer.email) {
    return { resendActive: false, error: 'Keine Kunden-E-Mail vorhanden.' };
  }

  const itemsRowsHtml = items.map(it => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #E2E8F0; color: #0F172A; font-size: 13.5px;">
        <strong style="color: #071B33;">${it.qty}x</strong> ${it.title}
      </td>
      <td align="right" style="padding: 10px 0; border-bottom: 1px solid #E2E8F0; text-align: right; color: #0F172A; font-size: 13.5px; font-weight: 600; white-space: nowrap;">
        ${(Number(it.price) * Number(it.qty)).toFixed(2).replace('.', ',')} €
      </td>
    </tr>
  `).join('');

  const customerBodyHtml = `
    <p style="margin: 0 0 12px 0; color: #0F172A;">Guten Tag <strong>${customer.firstName || ''} ${customer.lastName || ''}</strong>,</p>
    <p style="margin: 0 0 20px 0;">vielen Dank für Ihre Bestellung im Bickbeernhof Onlineshop. Ihre Zahlung wurde bestätigt und Ihr Auftrag ist bei uns eingegangen.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 3px solid #D9A24A; border-radius: 6px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px 18px; font-size: 13px; line-height: 1.55; color: #334155;">
          <div style="font-weight: 700; color: #071B33; margin-bottom: 4px;">Versand &amp; Rechnung</div>
          <div>Ihre Bestellung wird frisch auf unserem Hof zusammengestellt und bruchsicher verpackt versendet. Ihre Rechnung mit ausgewiesener Mehrwertsteuer erhalten Sie separat per E-Mail.</div>
        </td>
      </tr>
    </table>

    <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #071B33; border-bottom: 2px solid #071B33; padding-bottom: 6px; margin-bottom: 4px;">
      Bestellübersicht (${orderId})
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; margin-bottom: 22px;">
      <tbody>
        ${itemsRowsHtml}
        <tr>
          <td style="padding: 9px 0; border-bottom: 1px solid #E2E8F0; color: #64748B; font-size: 13px;">Zwischensumme</td>
          <td align="right" style="padding: 9px 0; border-bottom: 1px solid #E2E8F0; text-align: right; color: #64748B; font-size: 13px; white-space: nowrap;">${subtotal.toFixed(2).replace('.', ',')} €</td>
        </tr>
        <tr>
          <td style="padding: 9px 0; border-bottom: 1px solid #E2E8F0; color: #64748B; font-size: 13px;">Versandkosten</td>
          <td align="right" style="padding: 9px 0; border-bottom: 1px solid #E2E8F0; text-align: right; color: #64748B; font-size: 13px; white-space: nowrap;">${shipping.toFixed(2).replace('.', ',')} €</td>
        </tr>
        <tr>
          <td style="padding: 12px 0 0 0; font-size: 15px; font-weight: 700; color: #071B33;">Gesamtbetrag (inkl. MwSt.)</td>
          <td align="right" style="padding: 12px 0 0 0; text-align: right; font-size: 15px; font-weight: 700; color: #071B33; white-space: nowrap;">${total.toFixed(2).replace('.', ',')} €</td>
        </tr>
      </tbody>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 14px 18px; font-size: 13px; line-height: 1.55;">
          <div style="font-weight: 700; color: #071B33; margin-bottom: 4px;">Lieferadresse</div>
          <div style="color: #334155;">
            ${customer.firstName || ''} ${customer.lastName || ''}<br>
            ${customer.street || ''}<br>
            ${customer.zip || ''} ${customer.city || ''}
          </div>
        </td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 13px; color: #475569;">
      Bei Fragen zu Ihrer Bestellung erreichen Sie uns unter <a href="mailto:post@bickbeernhof.de" style="color: #071B33; font-weight: 600;">post@bickbeernhof.de</a> oder telefonisch unter <strong>0 50 27 / 15 66</strong>.
    </p>
  `;

  const customerEmailHtml = renderBickbeernhofEmailShell({
    preheader: `Vielen Dank für Ihre Bestellung ${orderId} über ${total.toFixed(2).replace('.', ',')} € bei Bickbeernhof Brokeloh.`,
    eyebrow: 'Onlineshop',
    title: `Bestellbestätigung ${orderId}`,
    bodyHtml: customerBodyHtml
  });

  const adminUrl = 'https://bickbeernhof.friese-scholz.workers.dev/admin';
  const storeBodyHtml = `
    <p style="margin: 0 0 18px 0; color: #0F172A;">Eine neue bezahlte Bestellung ist im Onlineshop eingegangen.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; margin-bottom: 22px; font-size: 13px;">
      <tr>
        <td style="padding: 16px 18px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding: 3px 0; color: #64748B; width: 140px;">Bestellnummer:</td>
              <td style="padding: 3px 0; color: #0F172A; font-weight: 700;">${orderId}${order.invoiceNumber ? ` (Rechnungs-Nr. ${order.invoiceNumber})` : ''}</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; color: #64748B;">Gesamtbetrag:</td>
              <td style="padding: 3px 0; color: #15803D; font-weight: 700; font-size: 15px;">${total.toFixed(2).replace('.', ',')} €</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; color: #64748B;">Zahlungsstatus:</td>
              <td style="padding: 3px 0; color: #0F172A;">Bezahlt (${order.method || 'Mollie'})</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; color: #64748B;">Kunde:</td>
              <td style="padding: 3px 0; color: #0F172A;">${customer.firstName || ''} ${customer.lastName || ''} (${customer.email})</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; color: #64748B; vertical-align: top;">Lieferadresse:</td>
              <td style="padding: 3px 0; color: #0F172A;">${customer.street || ''}, ${customer.zip || ''} ${customer.city || ''}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #071B33; border-bottom: 2px solid #071B33; padding-bottom: 6px; margin-bottom: 4px;">
      Bestellte Artikel
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tbody>
        ${itemsRowsHtml}
        <tr>
          <td style="padding: 9px 0; border-bottom: 1px solid #E2E8F0; color: #64748B; font-size: 13px;">Versandkosten</td>
          <td align="right" style="padding: 9px 0; border-bottom: 1px solid #E2E8F0; text-align: right; color: #64748B; font-size: 13px; white-space: nowrap;">${shipping.toFixed(2).replace('.', ',')} €</td>
        </tr>
        <tr>
          <td style="padding: 11px 0 0 0; font-weight: 700; color: #071B33;">Gesamt</td>
          <td align="right" style="padding: 11px 0 0 0; text-align: right; font-weight: 700; color: #071B33; white-space: nowrap;">${total.toFixed(2).replace('.', ',')} €</td>
        </tr>
      </tbody>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
      <tr>
        <td align="center" bgcolor="#071B33" style="border-radius: 6px; background-color: #071B33;">
          <a href="${adminUrl}" style="display: inline-block; padding: 12px 24px; font-size: 13.5px; font-weight: 700; color: #FFFFFF; text-decoration: none;">Im Admin Dashboard öffnen</a>
        </td>
      </tr>
    </table>
  `;

  const storeEmailHtml = renderBickbeernhofEmailShell({
    preheader: `Neue bezahlte Bestellung ${orderId} über ${total.toFixed(2).replace('.', ',')} € von ${customer.firstName || ''} ${customer.lastName || ''}.`,
    eyebrow: 'Bestelleingang',
    title: `Neue Bestellung ${orderId}`,
    bodyHtml: storeBodyHtml
  });

  let resendCustomerResult = null;
  let resendStoreResult = null;
  let resendError = null;
  const resendActive = Boolean(RESEND_KEY && RESEND_KEY.startsWith('re_') && RESEND_KEY !== 're_test_dummy');

  if (resendActive) {
    try {
      const res1 = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [customer.email],
          reply_to: STORE_EMAIL,
          subject: `Bestellbestätigung ${orderId} – Bickbeernhof Brokeloh`,
          html: customerEmailHtml
        })
      });
      resendCustomerResult = await res1.json();

      const res2 = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [STORE_EMAIL],
          reply_to: customer.email,
          subject: `Neue Bestellung ${orderId} (${total.toFixed(2).replace('.', ',')} €)`,
          html: storeEmailHtml
        })
      });
      resendStoreResult = await res2.json();
    } catch (e) {
      resendError = e.message;
      console.error('[Resend Error]', e);
    }
  } else {
    console.warn('[Resend Skipped] Kein gültiger RESEND_API_KEY in Cloudflare Worker konfiguriert.');
  }

  return {
    resendActive,
    customerEmailStatus: resendCustomerResult,
    storeEmailStatus: resendStoreResult,
    resendError
  };
}

async function finalizePaidOrder(env, origin, paymentId, sessionId = null) {
  const MOLLIE_API_KEY = env.MOLLIE_API_KEY;
  if (!MOLLIE_API_KEY || !paymentId) {
    return { success: false, paid: false, error: 'MOLLIE_API_KEY oder paymentId fehlt.' };
  }

  // 1. Live-Prüfung bei Mollie
  const mollieRes = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
    headers: { 'Authorization': `Bearer ${MOLLIE_API_KEY}` }
  });
  const payment = await mollieRes.json();
  if (!mollieRes.ok || !payment || !payment.id) {
    return { success: false, paid: false, error: payment?.detail || 'Zahlung bei Mollie nicht gefunden.' };
  }

  if (payment.status !== 'paid') {
    return {
      success: true,
      paid: false,
      status: payment.status,
      paymentId: payment.id
    };
  }

  // 2. Prüfen ob bereits in KV finalisiert
  let orders = [];
  if (env.EVENTS_KV) {
    try {
      const raw = await env.EVENTS_KV.get('bickbeern_orders', { type: 'json' });
      if (Array.isArray(raw)) orders = raw;
    } catch (e) {}
  }

  let existing = orders.find(o => o.id === paymentId);
  if (existing) {
    if (!existing.confirmationEmailSent) {
      const mailRes = await sendOrderEmailsInternal(env, origin, existing);
      if (mailRes.resendActive && !mailRes.resendError) {
        existing.confirmationEmailSent = true;
        if (env.EVENTS_KV) await env.EVENTS_KV.put('bickbeern_orders', JSON.stringify(orders));
      }
    }
    return { success: true, paid: true, status: 'paid', order: existing, alreadyRecorded: true };
  }

  // 3. Kurzer Lock gegen Race-Condition zwischen Webhook & Redirect
  const lockKey = `bickbeern_order_lock:${paymentId}`;
  if (env.EVENTS_KV) {
    const isLocked = await env.EVENTS_KV.get(lockKey);
    if (isLocked) {
      await new Promise(r => setTimeout(r, 900));
      const refreshed = await env.EVENTS_KV.get('bickbeern_orders', { type: 'json' });
      if (Array.isArray(refreshed)) {
        const afterLock = refreshed.find(o => o.id === paymentId);
        if (afterLock) return { success: true, paid: true, status: 'paid', order: afterLock, alreadyRecorded: true };
      }
    }
    await env.EVENTS_KV.put(lockKey, '1', { expirationTtl: 60 });
  }

  // 4. Pending-Daten laden (KV oder Mollie Metadata)
  let pendingData = null;
  if (env.EVENTS_KV) {
    try {
      pendingData = await env.EVENTS_KV.get(`bickbeern_pending:${paymentId}`, { type: 'json' });
      if (!pendingData && sessionId) {
        const sessObj = await env.EVENTS_KV.get(`bickbeern_pending_sess:${sessionId}`, { type: 'json' });
        if (sessObj && sessObj.checkoutData) pendingData = sessObj.checkoutData;
      }
    } catch (e) {}
  }
  const meta = pendingData || payment.metadata || {};
  const catalog = await getCatalogProducts(env);

  // 5. Fortlaufende Bestell- & Rechnungsnummer ab 2000 vergeben
  let nextSeq = 2000;
  if (env.EVENTS_KV) {
    try {
      const rawLast = await env.EVENTS_KV.get('bickbeern_last_order_id');
      const parsedLast = parseInt(rawLast || '1999', 10);
      nextSeq = isNaN(parsedLast) ? 2000 : Math.max(2000, parsedLast + 1);
      await env.EVENTS_KV.put('bickbeern_last_order_id', String(nextSeq));
    } catch (e) {}
  }

  const orderYear = new Date().getFullYear();
  const orderId = `BBH-${orderYear}-${nextSeq}`;
  const invoiceNumber = String(nextSeq);

  const normalizedItems = (Array.isArray(meta.items) ? meta.items : []).map(it => ({
    id: it.id,
    title: it.title,
    price: Number(it.price || 0),
    qty: Number(it.qty || 1),
    vatRate: getItemVatRate(it, catalog)
  }));

  const newOrder = {
    id: payment.id,
    sessionId: sessionId || meta.sessionId || null,
    orderId,
    invoiceNumber,
    description: payment.description || `Bickbeernhof Bestellung ${orderId}`,
    status: 'paid',
    fulfillmentStatus: 'neu',
    amount: payment.amount?.value || meta.total || '0.00',
    currency: payment.amount?.currency || 'EUR',
    method: payment.method || 'Mollie Checkout',
    customer: meta.customer || null,
    items: normalizedItems,
    subtotal: meta.subtotal || '0.00',
    shipping: meta.shipping || '5.60',
    total: payment.amount?.value || meta.total || '0.00',
    createdAt: payment.createdAt || meta.createdAt || new Date().toISOString(),
    paidAt: payment.paidAt || new Date().toISOString(),
    confirmationEmailSent: false,
    invoiceSentInfo: null
  };

  orders.unshift(newOrder);
  if (env.EVENTS_KV) {
    await env.EVENTS_KV.put('bickbeern_orders', JSON.stringify(orders));
    await env.EVENTS_KV.delete(`bickbeern_pending:${paymentId}`);
    if (newOrder.sessionId) await env.EVENTS_KV.delete(`bickbeern_pending_sess:${newOrder.sessionId}`);
  }

  // 6. Bestellbestätigung & Hof-Benachrichtigung einmalig senden
  const mailResult = await sendOrderEmailsInternal(env, origin, newOrder);
  if (mailResult.resendActive && !mailResult.resendError) {
    newOrder.confirmationEmailSent = true;
    if (env.EVENTS_KV) {
      await env.EVENTS_KV.put('bickbeern_orders', JSON.stringify(orders));
    }
  }

  return { success: true, paid: true, status: 'paid', order: newOrder, mailResult };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS Headers für API-Endpunkte
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }

    const MOLLIE_API_KEY = env.MOLLIE_API_KEY;

    // Route /produkt to /produkt.html
    if (url.pathname === '/produkt') {
      return env.ASSETS.fetch(new Request(new URL('/produkt.html' + url.search, request.url), request));
    }

    // -------------------------------------------------------------
    // API: GET /api/products (Shop Produkte aus Cloudflare KV laden)
    // -------------------------------------------------------------
    if (url.pathname === '/api/products' && request.method === 'GET') {
      try {
        let prods = null;
        if (env.EVENTS_KV) {
          prods = await env.EVENTS_KV.get('bickbeern_products', { type: 'json' });
        }
        if (!prods || !Array.isArray(prods) || prods.length === 0) {
          prods = defaultProducts;
          if (env.EVENTS_KV) {
            await env.EVENTS_KV.put('bickbeern_products', JSON.stringify(defaultProducts));
          }
        }
        return new Response(JSON.stringify({ success: true, products: prods }), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message, products: defaultProducts }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // -------------------------------------------------------------
    // API: POST /api/admin/products (Shop Produkte in Cloudflare KV speichern)
    // -------------------------------------------------------------
    if (url.pathname === '/api/admin/products' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { products } = body;
        if (!Array.isArray(products)) {
          return new Response(JSON.stringify({ error: 'Array erwartet.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        if (env.EVENTS_KV) {
          await env.EVENTS_KV.put('bickbeern_products', JSON.stringify(products));
        }
        return new Response(JSON.stringify({ success: true, count: products.length, savedAt: new Date().toISOString() }), {
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

    // -------------------------------------------------------------
    // API: POST /api/admin/upload-product-image (Produktbild in Cloudflare R2 hochladen)
    // -------------------------------------------------------------
    if (url.pathname === '/api/admin/upload-product-image' && request.method === 'POST') {
      try {
        const contentType = request.headers.get('content-type') || '';
        let buffer = null;
        let filename = 'image.webp';
        let mime = 'image/webp';

        if (contentType.includes('multipart/form-data')) {
          const formData = await request.formData();
          const file = formData.get('file');
          if (!file) {
            return new Response(JSON.stringify({ error: 'Keine Datei empfangen.' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          buffer = await file.arrayBuffer();
          filename = file.name || filename;
          mime = file.type || mime;
        } else {
          const body = await request.json();
          if (!body.dataBase64) {
            return new Response(JSON.stringify({ error: 'Keine Bilddaten empfangen.' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          filename = body.filename || filename;
          mime = body.contentType || mime;
          const base64Data = body.dataBase64.replace(/^data:image\/\w+;base64,/, '');
          const binaryStr = atob(base64Data);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          buffer = bytes.buffer;
        }

        const safeName = filename.toLowerCase().replace(/[^a-z0-9.]/g, '-').replace(/-+/g, '-');
        const key = `bickbeernhof/Produkte/prod-${Date.now()}-${safeName}`;

        const fileUrl = await uploadToR2(env, key, buffer, mime);

        return new Response(JSON.stringify({ success: true, url: fileUrl, key }), {
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

    // -------------------------------------------------------------
    // API: POST /api/admin/delete-product-image (Produktbild aus Cloudflare R2 löschen)
    // -------------------------------------------------------------
    if (url.pathname === '/api/admin/delete-product-image' && request.method === 'POST') {
      try {
        const body = await request.json();
        let key = body.key;
        if (!key && body.url) {
          try {
            const u = new URL(body.url);
            key = decodeURIComponent(u.pathname.replace(/^\//, ''));
          } catch(e) {}
        }
        if (key && key.startsWith('bickbeernhof/')) {
          await deleteFromR2(env, key);
        }
        return new Response(JSON.stringify({ success: true }), {
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

    // -------------------------------------------------------------
    // API: GET /api/logo.png (Same-Origin Logo für PDF-Generierung ohne CORS-Blockade)
    // -------------------------------------------------------------
    if (url.pathname === '/api/logo.png' && request.method === 'GET') {
      try {
        if (env.R2_BUCKET) {
          const obj = await env.R2_BUCKET.get('bickbeernhof/logo.png');
          if (obj) {
            return new Response(obj.body, {
              status: 200,
              headers: {
                ...corsHeaders,
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=86400'
              }
            });
          }
        }
        const upstream = await fetch('https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/website-datein/bickbeernhof/logo.png');
        if (upstream.ok) {
          return new Response(upstream.body, {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'image/png',
              'Cache-Control': 'public, max-age=86400'
            }
          });
        }
      } catch (logoProxyErr) {}
      return new Response('Logo not found', { status: 404, headers: corsHeaders });
    }

    // -------------------------------------------------------------
    // API: POST /api/admin/request-2fa
    // -------------------------------------------------------------
    if (url.pathname === '/api/admin/request-2fa' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { password, turnstileToken } = body;

        // Cloudflare Turnstile Bot-Schutz Verifizierung vor Passwortabgleich
        const turnstileSecret = env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';
        const isProdEnv = url.hostname.includes('bickbeernhof.de');

        if (isProdEnv) {
          if (!turnstileToken || turnstileToken === 'mock-preview-token') {
            return new Response(JSON.stringify({ error: 'Sicherheitsüberprüfung erforderlich (Turnstile).' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          try {
            const tFormData = new FormData();
            tFormData.append('secret', turnstileSecret);
            tFormData.append('response', turnstileToken);
            const clientIp = request.headers.get('CF-Connecting-IP');
            if (clientIp) tFormData.append('remoteip', clientIp);

            const tRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
              method: 'POST',
              body: tFormData
            });
            const tOutcome = await tRes.json();
            if (!tOutcome.success) {
              return new Response(JSON.stringify({ error: 'Sicherheitsüberprüfung fehlgeschlagen (Turnstile). Bitte erneut versuchen.' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            }
          } catch (tErr) {
            console.warn('[Turnstile Verify Warning]:', tErr);
          }
        } else if (turnstileToken && turnstileToken !== 'mock-preview-token') {
          // Staging/Preview mit benutzerdefiniertem Token
          try {
            const tFormData = new FormData();
            tFormData.append('secret', turnstileSecret);
            tFormData.append('response', turnstileToken);
            const clientIp = request.headers.get('CF-Connecting-IP');
            if (clientIp) tFormData.append('remoteip', clientIp);

            const tRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
              method: 'POST',
              body: tFormData
            });
            const tOutcome = await tRes.json();
            if (!tOutcome.success && tOutcome['error-codes'] && !tOutcome['error-codes'].includes('invalid-input-secret')) {
              console.warn('[Turnstile Staging Verification]:', tOutcome);
            }
          } catch (tErr) {
            console.warn('[Turnstile Staging Verify Warning]:', tErr);
          }
        }

        const MASTER_PASS = env.ADMIN_PASSWORD || env.Passwort;
        if (!MASTER_PASS) {
          return new Response(JSON.stringify({ error: 'Server-Konfiguration: ADMIN_PASSWORD Secret fehlt im Cloudflare Environment.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (!password || password.trim() !== MASTER_PASS) {
          return new Response(JSON.stringify({ error: 'Passwort nicht korrekt.' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const code = String(Math.floor(100000 + Math.random() * 900000));
        const challengeId = 'ch_' + crypto.randomUUID();

        if (env.EVENTS_KV) {
          await env.EVENTS_KV.put('2fa_challenge_' + challengeId, JSON.stringify({
            code,
            createdAt: Date.now()
          }), { expirationTtl: 900 });
        }

        const RESEND_KEY = env.RESEND_API_KEY;
        const FROM_EMAIL = env.RESEND_FROM_EMAIL || 'Bickbeernhof Sicherheit <noreply@scholz-friese-webdesign.de>';
        const RECIPIENT = env.ADMIN_2FA_EMAIL || 'buchhaltung@bickbeernhof.de';

        const twoFaBodyHtml = `
          <p style="margin: 0 0 12px 0; color: #0F172A;">Es wurde eine Anmeldung im <strong>Bickbeernhof Admin Dashboard</strong> von einem neuen Gerät initiiert.</p>
          <p style="margin: 0 0 20px 0;">Bitte verwenden Sie folgenden Sicherheitscode, um die Anmeldung abzuschließen:</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 8px; margin-bottom: 22px;">
            <tr>
              <td align="center" style="padding: 22px 16px; text-align: center;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.4px; color: #64748B; margin-bottom: 8px;">6-stelliger Bestätigungscode</div>
                <div style="font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #071B33;">${code}</div>
              </td>
            </tr>
          </table>

          <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569;">
            Dieser Code ist <strong>15 Minuten</strong> gültig. Nach erfolgreicher Bestätigung wird dieses Gerät autorisiert.
          </p>
          <p style="margin: 0; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 14px;">
            Haben Sie diesen Code nicht angefordert? Bitte ändern Sie umgehend das Admin-Passwort.
          </p>
        `;

        const emailHtml = renderBickbeernhofEmailShell({
          preheader: `Ihr 6-stelliger Sicherheitscode für das Bickbeernhof Admin Dashboard lautet ${code}.`,
          eyebrow: 'Sicherheit',
          title: '2FA Bestätigungscode',
          bodyHtml: twoFaBodyHtml
        });

        let resendResult = null;
        if (RESEND_KEY && RESEND_KEY.startsWith('re_') && RESEND_KEY !== 're_test_dummy') {
          try {
            const res = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: FROM_EMAIL,
                to: [RECIPIENT],
                subject: `Bickbeernhof Admin – Sicherheitscode: ${code}`,
                html: emailHtml
              })
            });
            resendResult = await res.json();
            console.log('[2FA Email Sent via Resend]:', resendResult);
          } catch (e) {
            console.error('[2FA Resend Error]:', e);
          }
        } else {
          console.log(`[2FA Simulation] Code: ${code} an ${RECIPIENT}`);
        }

        return new Response(JSON.stringify({
          success: true,
          challengeId,
          emailMasked: RECIPIENT,
          resendResult
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // -------------------------------------------------------------
    // API: POST /api/admin/verify-2fa (2FA Code prüfen & Gerät autorisieren)
    // -------------------------------------------------------------
    if (url.pathname === '/api/admin/verify-2fa' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { challengeId, code } = body;

        if (!challengeId || !code) {
          return new Response(JSON.stringify({ error: 'challengeId und code sind erforderlich.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        let stored = null;
        if (env.EVENTS_KV) {
          stored = await env.EVENTS_KV.get('2fa_challenge_' + challengeId, { type: 'json' });
        }

        if (!stored) {
          return new Response(JSON.stringify({ error: 'Der Sicherheitscode ist abgelaufen oder ungültig. Bitte fordern Sie einen neuen Code an.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (String(stored.code).trim() !== String(code).trim()) {
          return new Response(JSON.stringify({ error: 'Falscher Sicherheitscode. Bitte prüfen Sie Ihre Eingabe.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (env.EVENTS_KV) {
          await env.EVENTS_KV.delete('2fa_challenge_' + challengeId);
          const deviceToken = 'bbh_' + crypto.randomUUID();
          await env.EVENTS_KV.put('bickbeern_device_' + deviceToken, JSON.stringify({
            authorizedAt: new Date().toISOString()
          }), { expirationTtl: 31536000 });

          return new Response(JSON.stringify({ success: true, token: deviceToken }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ success: true, token: 'bbh_local_ok' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
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

        if (!MOLLIE_API_KEY) {
          return new Response(
            JSON.stringify({ error: 'Server-Konfiguration: MOLLIE_API_KEY fehlt.' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const catalog = await getCatalogProducts(env);

        // Serverseitige Validierung von Preis, Bestand, Pfand & getrennter 6er-Kartonage
        let totalBottles = 0;
        let totalJars = 0;
        let subtotal = 0;
        let pfandTotal = 0;
        let pfandCount = 0;
        let hasShippableItem = false;
        const validatedItems = [];

        for (const item of items) {
          if (item.id === 'circujar-pfand') continue; // Pfand wird serverseitig sauber neu berechnet

          const qty = Math.max(1, parseInt(item.qty || 1, 10));
          const prod = catalog.find(p => p.id === item.id);

          if (!prod) {
            return new Response(
              JSON.stringify({ error: `Produkt "${item.title || item.id}" wurde im Katalog nicht gefunden.` }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          if (prod.inStock === false) {
            return new Response(
              JSON.stringify({ error: `Das Produkt "${prod.title}" ist aktuell leider ausverkauft.` }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          const unitPrice = Number(prod.price || 0);
          subtotal += unitPrice * qty;

          if (prod.hasDeposit) {
            const dep = Number(prod.deposit || 0.25);
            pfandTotal += dep * qty;
            pfandCount += qty;
          }

          const pkgKind = getPackagingKind(prod);
          if (pkgKind !== 'free_shipping') hasShippableItem = true;
          if (pkgKind === 'bottle') totalBottles += qty;
          else if (pkgKind === 'jar') totalJars += qty;

          validatedItems.push({
            id: prod.id,
            title: prod.title,
            price: unitPrice,
            qty,
            vatRate: getItemVatRate(prod, catalog)
          });
        }

        if (validatedItems.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Keine gültigen Artikel im Warenkorb.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (totalBottles > 0 && totalBottles % 6 !== 0) {
          const needed = 6 - (totalBottles % 6);
          return new Response(
            JSON.stringify({ error: `Flaschenkarton unvollständig. Es fehlen noch ${needed} Flasche(n) für die 6er-Kartonage.` }),
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

        if (pfandTotal > 0) {
          validatedItems.push({
            id: 'circujar-pfand',
            title: `Circujar Mehrwegpfand (${pfandCount}x 0,25 €)`,
            price: 0.25,
            qty: pfandCount,
            vatRate: 7
          });
        }

        const shipping = hasShippableItem ? 5.60 : 0.00;
        const total = subtotal + pfandTotal + shipping;
        const formattedAmount = total.toFixed(2);

        const sessionId = 'sess_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
        const origin = url.origin;
        const redirectUrl = `${origin}/bestellung-erfolgreich.html?session_id=${sessionId}`;
        const cancelUrl = `${origin}/shop.html?payment=cancelled`;

        const itemCount = validatedItems.filter(i => i.id !== 'circujar-pfand').reduce((sum, item) => sum + item.qty, 0);
        const description = `Bickbeernhof Bestellung (${itemCount} Artikel) · ${customer.firstName || ''} ${customer.lastName || ''}`.trim();

        const checkoutData = {
          sessionId,
          customer: {
            firstName: (customer.firstName || '').trim(),
            lastName: (customer.lastName || '').trim(),
            email: (customer.email || '').trim(),
            street: (customer.street || '').trim(),
            zip: (customer.zip || '').trim(),
            city: (customer.city || '').trim(),
          },
          items: validatedItems,
          subtotal: (subtotal + pfandTotal).toFixed(2),
          shipping: shipping.toFixed(2),
          total: formattedAmount,
          createdAt: new Date().toISOString(),
        };

        const molliePayload = {
          amount: {
            currency: 'EUR',
            value: formattedAmount,
          },
          description,
          redirectUrl,
          cancelUrl,
          metadata: checkoutData,
        };

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

        // Pending Checkout in Cloudflare KV sichern (wie Pure Whisky)
        if (env.EVENTS_KV) {
          await env.EVENTS_KV.put(`bickbeern_pending:${mollieData.id}`, JSON.stringify(checkoutData), { expirationTtl: 86400 });
          await env.EVENTS_KV.put(`bickbeern_pending_sess:${sessionId}`, JSON.stringify({ paymentId: mollieData.id, checkoutData }), { expirationTtl: 86400 });
        }

        return new Response(
          JSON.stringify({
            success: true,
            sessionId,
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
    // 2b. API: Bestellung nach Mollie-Rückkehr finalisieren (/api/orders/finalize)
    // -------------------------------------------------------------
    if (url.pathname === '/api/orders/finalize' && request.method === 'POST') {
      try {
        const body = await request.json();
        let { paymentId, sessionId } = body || {};

        // Falls bereits über sessionId finalisiert (z. B. Seite neu geladen)
        if (sessionId && env.EVENTS_KV) {
          const existingOrders = await env.EVENTS_KV.get('bickbeern_orders', { type: 'json' });
          if (Array.isArray(existingOrders)) {
            const foundBySess = existingOrders.find(o => o.sessionId === sessionId || (paymentId && o.id === paymentId));
            if (foundBySess) {
              return new Response(JSON.stringify({ success: true, paid: true, status: 'paid', order: foundBySess, alreadyRecorded: true }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            }
          }

          if (!paymentId) {
            const sessData = await env.EVENTS_KV.get(`bickbeern_pending_sess:${sessionId}`, { type: 'json' });
            if (sessData && sessData.paymentId) {
              paymentId = sessData.paymentId;
            }
          }
        }

        if (!paymentId || !String(paymentId).startsWith('tr_')) {
          return new Response(JSON.stringify({ success: false, paid: false, error: 'Keine gültige Zahlungs-ID gefunden.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const result = await finalizePaidOrder(env, url.origin, paymentId, sessionId || null);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, paid: false, error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // -------------------------------------------------------------
    // 3. API: Admin Bestellungen aus Cloudflare KV abrufen & verwalten (/api/admin/orders)
    // -------------------------------------------------------------
    if (url.pathname === '/api/admin/orders') {
      if (request.method === 'GET') {
        try {
          let orders = [];
          if (env.EVENTS_KV) {
            const raw = await env.EVENTS_KV.get('bickbeern_orders', { type: 'json' });
            if (Array.isArray(raw)) orders = raw;
          }

          const mollieMode = (MOLLIE_API_KEY && MOLLIE_API_KEY.startsWith('live_')) ? 'live' : (MOLLIE_API_KEY ? 'test' : 'unconfigured');

          return new Response(
            JSON.stringify({ success: true, count: orders.length, orders, mollieMode }),
            {
              status: 200,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
              }
            }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      if (request.method === 'DELETE') {
        try {
          const deleteId = url.searchParams.get('id');
          let orders = [];
          if (env.EVENTS_KV) {
            const raw = await env.EVENTS_KV.get('bickbeern_orders', { type: 'json' });
            if (Array.isArray(raw)) orders = raw;
          }
          if (deleteId) {
            orders = orders.filter(o => o.orderId !== deleteId && o.id !== deleteId);
            if (env.EVENTS_KV) {
              await env.EVENTS_KV.put('bickbeern_orders', JSON.stringify(orders));
            }
          }
          return new Response(JSON.stringify({ success: true, count: orders.length, orders }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }

    // -------------------------------------------------------------
    // 3b. API: Bearbeitungsstatus einer Bestellung in KV speichern
    // -------------------------------------------------------------
    if (url.pathname === '/api/admin/orders/update-status' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { orderId, fulfillmentStatus } = body || {};
        if (!orderId || !fulfillmentStatus) {
          return new Response(JSON.stringify({ error: 'orderId und fulfillmentStatus erforderlich.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        if (env.EVENTS_KV) {
          const raw = await env.EVENTS_KV.get('bickbeern_orders', { type: 'json' });
          const orders = Array.isArray(raw) ? raw : [];
          const idx = orders.findIndex(o => o.orderId === orderId || o.id === orderId);
          if (idx >= 0) {
            orders[idx].fulfillmentStatus = fulfillmentStatus;
            await env.EVENTS_KV.put('bickbeern_orders', JSON.stringify(orders));
          }
        }
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // -------------------------------------------------------------
    // 3c. API: Alle Bestellungen & Statistiken zurücksetzen (/api/admin/orders/reset)
    // -------------------------------------------------------------
    if (url.pathname === '/api/admin/orders/reset' && request.method === 'POST') {
      try {
        if (env.EVENTS_KV) {
          await env.EVENTS_KV.put('bickbeern_orders', JSON.stringify([]));
          await env.EVENTS_KV.put('bickbeern_last_order_id', '1999');
        }
        return new Response(JSON.stringify({ success: true, message: 'Bestellungen und Statistiken wurden vollständig zurückgesetzt.' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
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

        if (env.EVENTS_KV) {
          const raw = await env.EVENTS_KV.get('bickbeern_orders', { type: 'json' });
          if (Array.isArray(raw)) {
            const idx = raw.findIndex(o => o.id === paymentId);
            if (idx >= 0) {
              raw[idx].status = 'refunded';
              raw[idx].fulfillmentStatus = 'storniert';
              await env.EVENTS_KV.put('bickbeern_orders', JSON.stringify(raw));
            }
          }
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
        const bodyText = await request.text();
        const params = new URLSearchParams(bodyText);
        const paymentId = params.get('id');
        if (paymentId) {
          const fin = await finalizePaidOrder(env, url.origin, paymentId, null);
          console.log(`[Mollie Webhook] Finalized ${paymentId}: paid=${fin.paid}, orderId=${fin.order?.orderId}`);
        }
        return new Response('OK', { status: 200, headers: corsHeaders });
      } catch (err) {
        console.warn('[Mollie Webhook Error]:', err);
        return new Response('OK', { status: 200, headers: corsHeaders });
      }
    }

    // -------------------------------------------------------------
    // 5. API: Bestell-E-Mails versenden (/api/send-order-emails)
    // -------------------------------------------------------------
    if (url.pathname === '/api/send-order-emails' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { orderId, customer, items, subtotal, shipping, total, paymentId } = body;

        if (!customer || !customer.email || !orderId) {
          return new Response(JSON.stringify({ error: 'Unvollständige Bestelldaten für den E-Mail-Versand' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Anti-Duplikat-Prüfung über KV falls Bestellung schon bestätigt wurde
        if (env.EVENTS_KV) {
          const raw = await env.EVENTS_KV.get('bickbeern_orders', { type: 'json' });
          if (Array.isArray(raw)) {
            const existing = raw.find(o => o.orderId === orderId || (paymentId && o.id === paymentId));
            if (existing && existing.confirmationEmailSent) {
              return new Response(JSON.stringify({ success: true, duplicate: true, message: 'Bestell-E-Mails wurden bereits versendet.' }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            }
          }
        }

        const mailRes = await sendOrderEmailsInternal(env, url.origin, { orderId, customer, items, subtotal, shipping, total });
        return new Response(JSON.stringify({
          success: true,
          message: 'Bestell-E-Mails verarbeitet.',
          ...mailRes
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

        const catalog = await getCatalogProducts(env);
        const c = order.customer;
        const orderId = order.orderId || 'Bestellung';
        const numMatch = orderId.match(/(\d+)$/);
        const invoiceNum = order.invoiceNumber || (numMatch ? numMatch[1] : '2000');
        
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

          const vatRate = getItemVatRate(it, catalog);
          if (vatRate === 19) brutto19 += lineTotal;
          else brutto7 += lineTotal;

          const bg = (idx % 2 === 1) ? 'background-color: #F8FAFC;' : 'background-color: #FFFFFF;';
          return `
            <tr style="${bg}">
              <td style="padding: 9px 10px; border-bottom: 1px solid #E2E8F0; color: #0F172A; font-size: 13px;">${it.title}</td>
              <td align="center" style="padding: 9px 8px; border-bottom: 1px solid #E2E8F0; text-align: center; color: #0F172A; font-size: 13px;">${qty}</td>
              <td align="right" style="padding: 9px 8px; border-bottom: 1px solid #E2E8F0; text-align: right; color: #0F172A; font-size: 13px; white-space: nowrap;">${price.toFixed(2).replace('.', ',')} €</td>
              <td align="right" style="padding: 9px 10px; border-bottom: 1px solid #E2E8F0; text-align: right; color: #0F172A; font-size: 13px; font-weight: 700; white-space: nowrap;">${lineTotal.toFixed(2).replace('.', ',')} €</td>
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

        const invoiceBodyHtml = `
          <p style="margin: 0 0 12px 0; color: #0F172A;">Guten Tag <strong>${c.firstName || ''} ${c.lastName || ''}</strong>,</p>
          <p style="margin: 0 0 20px 0;">anbei erhalten Sie die Rechnung zu Ihrer Bestellung im Bickbeernhof Onlineshop sowie die PDF-Rechnung im Anhang für Ihre Unterlagen.</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; margin-bottom: 22px; font-size: 13px;">
            <tr>
              <td style="padding: 14px 16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding: 3px 0; color: #334155;"><strong>Rechnungsnummer:</strong> ${invoiceNum}</td>
                    <td align="right" style="padding: 3px 0; text-align: right; color: #334155; white-space: nowrap;"><strong>Datum:</strong> ${invoiceDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 3px 0; color: #334155;"><strong>Bestellnummer:</strong> ${orderId}</td>
                    <td align="right" style="padding: 3px 0; text-align: right; color: #15803D; font-weight: 700; white-space: nowrap;">Vollständig bezahlt</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
            <thead>
              <tr style="background-color: #E5E7EB;">
                <th align="left" style="padding: 9px 10px; text-align: left; font-size: 12px; font-weight: 700; color: #0F172A;">Bezeichnung</th>
                <th align="center" style="padding: 9px 8px; text-align: center; font-size: 12px; font-weight: 700; color: #0F172A; width: 55px;">Menge</th>
                <th align="right" style="padding: 9px 8px; text-align: right; font-size: 12px; font-weight: 700; color: #0F172A; width: 80px;">Einzel</th>
                <th align="right" style="padding: 9px 10px; text-align: right; font-size: 12px; font-weight: 700; color: #0F172A; width: 85px;">Gesamt</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
            <tr>
              <td width="45%">&nbsp;</td>
              <td width="55%" align="right">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: #475569;">
                  <tr>
                    <td style="padding: 3px 0;">Zwischensumme</td>
                    <td align="right" style="padding: 3px 0; text-align: right; white-space: nowrap;">${subtotal.toFixed(2).replace('.', ',')} €</td>
                  </tr>
                  <tr>
                    <td style="padding: 3px 0;">Versand</td>
                    <td align="right" style="padding: 3px 0; text-align: right; white-space: nowrap;">${shipping.toFixed(2).replace('.', ',')} €</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-top: 1.5px solid #071B33; border-bottom: 2px solid #071B33; font-weight: 700; font-size: 14.5px; color: #071B33;">Gesamtbetrag</td>
                    <td align="right" style="padding: 8px 0; border-top: 1.5px solid #071B33; border-bottom: 2px solid #071B33; text-align: right; font-weight: 700; font-size: 14.5px; color: #071B33; white-space: nowrap;">${total.toFixed(2).replace('.', ',')} €</td>
                  </tr>
                  <tr><td colspan="2" style="height: 8px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                  <tr style="font-size: 11.5px; color: #64748B;">
                    <td style="padding: 2px 0;">Netto</td>
                    <td align="right" style="padding: 2px 0; text-align: right; white-space: nowrap;">${nettoTotal.toFixed(2).replace('.', ',')} €</td>
                  </tr>
                  ${mwst7 > 0 ? `
                    <tr style="font-size: 11.5px; color: #64748B;">
                      <td style="padding: 2px 0;">MwSt. 7 %</td>
                      <td align="right" style="padding: 2px 0; text-align: right; white-space: nowrap;">${mwst7.toFixed(2).replace('.', ',')} €</td>
                    </tr>
                  ` : ''}
                  ${mwst19 > 0 ? `
                    <tr style="font-size: 11.5px; color: #64748B;">
                      <td style="padding: 2px 0;">MwSt. 19 %</td>
                      <td align="right" style="padding: 2px 0; text-align: right; white-space: nowrap;">${mwst19.toFixed(2).replace('.', ',')} €</td>
                    </tr>
                  ` : ''}
                </table>
              </td>
            </tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF6F0; border-left: 3px solid #D9A24A; border-radius: 6px;">
            <tr>
              <td style="padding: 14px 16px; font-size: 13px; color: #475569; line-height: 1.55;">
                <strong style="color: #071B33;">Vielen Dank für Ihren Einkauf!</strong><br>
                Bei Rückfragen zu Ihrer Lieferung oder Rechnung erreichen Sie uns unter <a href="mailto:post@bickbeernhof.de" style="color: #071B33; font-weight: 600;">post@bickbeernhof.de</a> oder telefonisch unter 0 50 27 / 15 66.
              </td>
            </tr>
          </table>
        `;

        const emailHtml = renderBickbeernhofEmailShell({
          preheader: `Ihre Rechnung Nr. ${invoiceNum} zu Bestellung ${orderId} über ${total.toFixed(2).replace('.', ',')} € von Bickbeernhof Brokeloh.`,
          eyebrow: 'Rechnung',
          title: `Rechnung Nr. ${invoiceNum}`,
          bodyHtml: invoiceBodyHtml,
          footerExtraHtml: 'Bankverbindung: IBAN DE25 2559 1413 3146 0658 00 &bull; BIC GENODEF1BCK'
        });

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
            reply_to: env.STORE_NOTIFICATION_EMAIL || 'post@bickbeernhof.de',
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
          if (!res.ok) {
            return new Response(JSON.stringify({ error: resendResult?.message || 'Resend-Fehler beim Versand der Rechnung.', resendResult }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        } else {
          console.log('[Invoice Email Simulated] Empfänger:', c.email, 'Rechnung:', invoiceNum);
        }

        const sentIso = new Date().toISOString();
        const sentDisplay = new Date().toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric' }) + ' um ' + new Date().toLocaleTimeString('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' });

        if (env.EVENTS_KV) {
          try {
            const raw = await env.EVENTS_KV.get('bickbeern_orders', { type: 'json' });
            if (Array.isArray(raw)) {
              const idx = raw.findIndex(o => o.orderId === orderId || (order.id && o.id === order.id));
              if (idx >= 0) {
                raw[idx].fulfillmentStatus = 'rechnung';
                raw[idx].invoiceSentInfo = {
                  date: sentDisplay,
                  sentAt: sentIso,
                  recipient: c.email,
                  invoiceNumber: invoiceNum
                };
                await env.EVENTS_KV.put('bickbeern_orders', JSON.stringify(raw));
              }
            }
          } catch (kvErr) {
            console.warn('Could not update invoiceSentInfo in KV:', kvErr);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          sentAt: sentIso,
          sentDisplay,
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
    // 5c. API: Kontakt- & Reservierungsanfragen (/api/contact)
    // -------------------------------------------------------------
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { turnstileToken, name, email, phone, guests, date, time, notes, message, subject } = body || {};

        if (!name || !email || (!message && !notes)) {
          return new Response(JSON.stringify({ success: false, message: 'Bitte füllen Sie alle Pflichtfelder aus.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const turnstileSecret = env.TURNSTILE_SECRET_KEY;
        if (turnstileSecret && turnstileToken) {
          try {
            const tForm = new FormData();
            tForm.append('secret', turnstileSecret);
            tForm.append('response', turnstileToken);
            const tRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: tForm });
            const tOut = await tRes.json();
            if (!tOut.success && url.hostname.includes('bickbeernhof.de')) {
              return new Response(JSON.stringify({ success: false, message: 'Spam-Schutz-Prüfung fehlgeschlagen. Bitte erneut versuchen.' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            }
          } catch (tErr) {}
        }

        // Anmerkungen sauber extrahieren (ohne doppelte Auflistung von Name/Telefon/Datum)
        let cleanNotes = (notes || '').trim();
        if (!cleanNotes && message) {
          const marker = 'Anmerkungen / Wünsche:';
          const mIdx = message.indexOf(marker);
          cleanNotes = (mIdx >= 0) ? message.slice(mIdx + marker.length).trim() : message.trim();
        }

        // Datum lesbar formatieren (YYYY-MM-DD -> DD.MM.YYYY)
        let dateFormatted = date || '';
        if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
          const [yyyy, mm, dd] = date.split('-');
          dateFormatted = `${dd}.${mm}.${yyyy}`;
        }

        const isReservation = Boolean(guests || date || time);
        const resId = 'RES-' + Date.now().toString(36).toUpperCase().slice(-6);
        const actionToken = crypto.randomUUID();

        const reservationRecord = {
          id: resId,
          token: actionToken,
          name: String(name).trim(),
          email: String(email).trim(),
          phone: String(phone || '').trim(),
          guests: String(guests || '').trim(),
          date: String(date || '').trim(),
          dateFormatted,
          time: String(time || '').trim(),
          notes: cleanNotes,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        if (env.EVENTS_KV && isReservation) {
          try {
            await env.EVENTS_KV.put('bickbeern_res_' + resId, JSON.stringify(reservationRecord), {
              expirationTtl: 60 * 60 * 24 * 120
            });
          } catch (kvErr) {
            console.warn('Could not persist reservation in KV:', kvErr);
          }
        }

        const baseRespondUrl = 'https://bickbeernhof.friese-scholz.workers.dev/api/reservation/respond';
        const acceptUrl = `${baseRespondUrl}?id=${encodeURIComponent(resId)}&token=${encodeURIComponent(actionToken)}&action=accept`;
        const declineUrl = `${baseRespondUrl}?id=${encodeURIComponent(resId)}&token=${encodeURIComponent(actionToken)}&action=decline`;

        const RESEND_KEY = env.RESEND_API_KEY || '';
        const FROM_EMAIL = env.RESEND_FROM_EMAIL || 'Bickbeernhof Brokeloh <noreply@scholz-friese-webdesign.de>';
        const CONTACT_TO = env.STORE_NOTIFICATION_EMAIL || 'post@bickbeernhof.de';

        const contactBodyHtml = `
          <p style="margin: 0 0 16px 0; color: #0F172A;">
            ${isReservation
              ? 'Über die Website ist eine neue <strong>Tischreservierungsanfrage</strong> eingegangen. Sie können die Anfrage unten direkt bestätigen oder ablehnen:'
              : 'Über das Kontaktformular auf der Website ist eine neue Nachricht eingegangen:'}
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; margin-bottom: 18px; font-size: 13.5px;">
            <tr>
              <td style="padding: 16px 18px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  ${isReservation ? `
                    <tr>
                      <td style="padding: 4px 0; color: #64748B; width: 145px;">Anfrage-Nr.:</td>
                      <td style="padding: 4px 0; color: #0F172A; font-weight: 700;">${resId}</td>
                    </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 4px 0; color: #64748B; width: 145px;">Name:</td>
                    <td style="padding: 4px 0; color: #0F172A; font-weight: 700;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748B;">E-Mail:</td>
                    <td style="padding: 4px 0;"><a href="mailto:${email}" style="color: #071B33; font-weight: 600;">${email}</a></td>
                  </tr>
                  ${phone ? `<tr><td style="padding: 4px 0; color: #64748B;">Telefon:</td><td style="padding: 4px 0; color: #0F172A; font-weight: 600;">${phone}</td></tr>` : ''}
                  ${guests ? `<tr><td style="padding: 4px 0; color: #64748B;">Personenanzahl:</td><td style="padding: 4px 0; color: #071B33; font-weight: 700;">${guests} Personen</td></tr>` : ''}
                  ${dateFormatted ? `<tr><td style="padding: 4px 0; color: #64748B;">Wunschtermin:</td><td style="padding: 4px 0; color: #071B33; font-weight: 700;">${dateFormatted}${time ? ' um ' + time + ' Uhr' : ''}</td></tr>` : ''}
                </table>
              </td>
            </tr>
          </table>

          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #071B33; margin-bottom: 6px;">
            ${isReservation ? 'Anmerkungen &amp; Wünsche' : 'Nachricht'}
          </div>
          <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 6px; padding: 14px 16px; white-space: pre-wrap; color: #1E293B; font-size: 13.5px; line-height: 1.6; margin-bottom: 24px;">${cleanNotes || 'Keine besonderen Anmerkungen angegeben.'}</div>

          ${isReservation ? `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 8px;">
              <tr>
                <td style="padding: 18px 20px; text-align: center;">
                  <div style="font-size: 13px; font-weight: 700; color: #071B33; margin-bottom: 6px;">Reservierung bearbeiten &amp; Gast informieren</div>
                  <div style="font-size: 12.5px; color: #475569; margin-bottom: 16px;">Mit einem Klick öffnen Sie die Bestätigungsansicht (auf Wunsch mit persönlicher Notiz) und senden dem Gast automatisch eine Zu- oder Absage per E-Mail:</div>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
                    <tr>
                      <td align="center" bgcolor="#15803D" style="border-radius: 6px; background-color: #15803D;">
                        <a href="${acceptUrl}" style="display: inline-block; padding: 11px 22px; font-size: 13.5px; font-weight: 700; color: #FFFFFF; text-decoration: none;">Reservierung bestätigen</a>
                      </td>
                      <td width="14">&nbsp;</td>
                      <td align="center" bgcolor="#B91C1C" style="border-radius: 6px; background-color: #B91C1C;">
                        <a href="${declineUrl}" style="display: inline-block; padding: 11px 22px; font-size: 13.5px; font-weight: 700; color: #FFFFFF; text-decoration: none;">Reservierung ablehnen</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          ` : ''}
        `;

        const contactHtml = renderBickbeernhofEmailShell({
          preheader: isReservation
            ? `Tischreservierungsanfrage (${guests} Personen am ${dateFormatted} um ${time} Uhr) von ${name}.`
            : `Neue Anfrage über bickbeernhof.de von ${name} (${email}).`,
          eyebrow: isReservation ? 'Tischreservierung' : 'Website-Anfrage',
          title: isReservation ? `Anfrage: ${guests} Pers. am ${dateFormatted}` : 'Neue Kontaktanfrage',
          bodyHtml: contactBodyHtml
        });

        // Eingangsbestätigung an den Gast (bei Tischreservierung)
        const customerAckBodyHtml = `
          <p style="margin: 0 0 12px 0; color: #0F172A;">Guten Tag <strong>${name}</strong>,</p>
          <p style="margin: 0 0 18px 0;">vielen Dank für Ihre Reservierungsanfrage im Bickbeernhof Brokeloh. Wir haben Ihre Anfrage erhalten und prüfen aktuell unsere freien Tischkapazitäten für Ihren Wunschtermin.</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 3px solid #D9A24A; border-radius: 6px; margin-bottom: 20px; font-size: 13.5px;">
            <tr>
              <td style="padding: 16px 18px;">
                <div style="font-weight: 700; color: #071B33; margin-bottom: 8px;">Ihre angefragten Reservierungsdaten (${resId})</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding: 3px 0; color: #64748B; width: 140px;">Datum &amp; Uhrzeit:</td>
                    <td style="padding: 3px 0; color: #0F172A; font-weight: 700;">${dateFormatted}${time ? ' um ' + time + ' Uhr' : ''}</td>
                  </tr>
                  <tr>
                    <td style="padding: 3px 0; color: #64748B;">Personenanzahl:</td>
                    <td style="padding: 3px 0; color: #0F172A; font-weight: 700;">${guests} Personen</td>
                  </tr>
                  <tr>
                    <td style="padding: 3px 0; color: #64748B;">Name / Telefon:</td>
                    <td style="padding: 3px 0; color: #0F172A;">${name}${phone ? ' (' + phone + ')' : ''}</td>
                  </tr>
                  ${cleanNotes ? `
                    <tr>
                      <td style="padding: 3px 0; color: #64748B; vertical-align: top;">Anmerkungen:</td>
                      <td style="padding: 3px 0; color: #0F172A;">${cleanNotes}</td>
                    </tr>
                  ` : ''}
                </table>
              </td>
            </tr>
          </table>

          <p style="margin: 0 0 14px 0; font-size: 13.5px; color: #334155;">
            <strong>Bitte beachten Sie:</strong> Diese E-Mail bestätigt den Eingang Ihrer Anfrage. Sobald unser Team Ihre Reservierung geprüft hat, erhalten Sie eine separate E-Mail mit Ihrer verbindlichen Reservierungsbestätigung.
          </p>
          <p style="margin: 0; font-size: 13px; color: #475569;">
            Bei kurzfristigen Rückfragen erreichen Sie uns telefonisch unter <strong>0 50 27 / 15 66</strong> oder per E-Mail an <a href="mailto:post@bickbeernhof.de" style="color: #071B33; font-weight: 600;">post@bickbeernhof.de</a>.
          </p>
        `;

        const customerAckHtml = renderBickbeernhofEmailShell({
          preheader: `Wir haben Ihre Reservierungsanfrage für den ${dateFormatted} um ${time} Uhr (${guests} Personen) erhalten.`,
          eyebrow: 'Tischreservierung',
          title: 'Eingang Ihrer Anfrage',
          bodyHtml: customerAckBodyHtml
        });

        if (RESEND_KEY && RESEND_KEY.startsWith('re_') && RESEND_KEY !== 're_test_dummy') {
          const emailSubject = isReservation
            ? `Reservierungsanfrage: ${guests} Personen am ${dateFormatted} um ${time} Uhr (${name})`
            : (subject || `Neue Anfrage von ${name} – Bickbeernhof`);

          const r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: [CONTACT_TO],
              reply_to: email,
              subject: emailSubject,
              html: contactHtml
            })
          });
          const rData = await r.json();
          if (!r.ok) {
            return new Response(JSON.stringify({ success: false, message: rData?.message || 'E-Mail-Versand fehlgeschlagen.' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          if (isReservation && email) {
            try {
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  from: FROM_EMAIL,
                  to: [email],
                  reply_to: CONTACT_TO,
                  subject: `Eingangsbestätigung Ihrer Reservierungsanfrage am ${dateFormatted} – Bickbeernhof Brokeloh`,
                  html: customerAckHtml
                })
              });
            } catch (ackErr) {
              console.warn('Customer reservation ack email error:', ackErr);
            }
          }
        }

        return new Response(JSON.stringify({ success: true, reservationId: isReservation ? resId : null }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // -------------------------------------------------------------
    // 5d. API: Tischreservierung bestätigen / ablehnen (/api/reservation/respond)
    // -------------------------------------------------------------
    if (url.pathname === '/api/reservation/respond' && (request.method === 'GET' || request.method === 'POST')) {
      try {
        if (!env.EVENTS_KV) {
          return new Response('KV Storage nicht konfiguriert.', { status: 500 });
        }

        if (request.method === 'GET') {
          const resId = url.searchParams.get('id') || '';
          const token = url.searchParams.get('token') || '';
          const initialAction = (url.searchParams.get('action') === 'decline') ? 'decline' : 'accept';

          const raw = resId ? await env.EVENTS_KV.get('bickbeern_res_' + resId, { type: 'json' }) : null;
          if (!raw || !token || raw.token !== token) {
            return new Response(`<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reservierung nicht gefunden</title></head><body style="font-family:sans-serif;background:#F3F5F7;padding:40px 16px;text-align:center;color:#0F172A;"><div style="max-width:480px;margin:0 auto;background:#fff;padding:32px;border-radius:12px;border:1px solid #E2E8F0;"><h2>Reservierungslink ungültig oder abgelaufen</h2><p style="color:#64748B;font-size:14px;">Diese Reservierungsanfrage konnte nicht gefunden werden.</p></div></body></html>`, {
              status: 404,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          }

          const statusBanner = raw.status === 'accepted'
            ? `<div style="background:#F0FDF4;border:1px solid #BBF7D0;color:#166534;padding:12px 16px;border-radius:8px;font-size:13px;margin-bottom:20px;"><strong>Hinweis:</strong> Diese Reservierung wurde bereits als <strong>Bestätigt</strong> an den Gast gesendet. Sie können bei Bedarf unten eine aktualisierte Nachricht senden.</div>`
            : (raw.status === 'declined'
                ? `<div style="background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;padding:12px 16px;border-radius:8px;font-size:13px;margin-bottom:20px;"><strong>Hinweis:</strong> Diese Reservierung wurde bereits als <strong>Abgelehnt</strong> an den Gast gesendet. Sie können den Status bei Bedarf unten ändern.</div>`
                : '');

          const pageHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reservierung ${raw.id} bearbeiten | Bickbeernhof Brokeloh</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px 16px; background: #F3F5F7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0F172A; }
    .card { max-width: 560px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(15,23,42,0.06); }
    .top-bar { height: 5px; background: #071B33; }
    .header { padding: 24px 28px; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; }
    .body { padding: 26px 28px; }
    .meta { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px 18px; margin-bottom: 20px; font-size: 14px; line-height: 1.6; }
    .choice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; }
    .choice-btn { padding: 13px 14px; border-radius: 8px; border: 2px solid #CBD5E1; background: #FFFFFF; font-weight: 700; font-size: 14px; cursor: pointer; text-align: center; transition: all 0.15s ease; }
    .choice-btn.accept.active { border-color: #15803D; background: #F0FDF4; color: #166534; }
    .choice-btn.decline.active { border-color: #B91C1C; background: #FEF2F2; color: #991B1B; }
    textarea { width: 100%; min-height: 90px; border: 1px solid #CBD5E1; border-radius: 8px; padding: 10px 12px; font-family: inherit; font-size: 14px; resize: vertical; }
    .submit-btn { width: 100%; margin-top: 18px; padding: 14px 20px; border: none; border-radius: 8px; font-weight: 700; font-size: 15px; color: #FFFFFF; cursor: pointer; background: #071B33; }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  </style>
</head>
<body>
  <div class="card">
    <div class="top-bar"></div>
    <div class="header">
      <img src="${BICKBEERNHOF_LOGO_URL}" alt="Bickbeernhof" style="height: 42px; width: auto;">
      <div style="text-align: right;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #B45309;">Tischreservierung</div>
        <div style="font-size: 15px; font-weight: 700; color: #071B33;">${raw.id}</div>
      </div>
    </div>
    <div class="body" id="mainView">
      ${statusBanner}
      <div class="meta">
        <div><strong>Gast:</strong> ${raw.name}</div>
        <div><strong>E-Mail:</strong> ${raw.email}</div>
        ${raw.phone ? `<div><strong>Telefon:</strong> ${raw.phone}</div>` : ''}
        <div><strong>Termin:</strong> ${raw.dateFormatted || raw.date}${raw.time ? ' um ' + raw.time + ' Uhr' : ''}</div>
        <div><strong>Personen:</strong> ${raw.guests} Personen</div>
        ${raw.notes ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #E2E8F0;"><strong>Anmerkungen:</strong> ${raw.notes}</div>` : ''}
      </div>

      <div style="font-size: 13px; font-weight: 700; color: #071B33; margin-bottom: 8px;">1. Entscheidung auswählen:</div>
      <div class="choice-grid">
        <button type="button" id="btnAccept" class="choice-btn accept ${initialAction === 'accept' ? 'active' : ''}" onclick="setDecision('accept')">Reservierung bestätigen</button>
        <button type="button" id="btnDecline" class="choice-btn decline ${initialAction === 'decline' ? 'active' : ''}" onclick="setDecision('decline')">Reservierung ablehnen</button>
      </div>

      <label for="customNote" style="display: block; font-size: 13px; font-weight: 700; color: #071B33; margin-bottom: 6px;">2. Optionale persönliche Notiz an den Gast:</label>
      <textarea id="customNote" placeholder="Optional: z. B. Hinweis zum reservierten Bereich oder Grund/Alternativuhrzeit bei Absage..."></textarea>

      <button type="button" id="sendBtn" class="submit-btn" onclick="submitDecision()">Rückmeldung jetzt per E-Mail an ${raw.name} senden</button>
    </div>
  </div>

  <script>
    let currentDecision = ${JSON.stringify(initialAction)};
    function setDecision(d) {
      currentDecision = d;
      document.getElementById('btnAccept').classList.toggle('active', d === 'accept');
      document.getElementById('btnDecline').classList.toggle('active', d === 'decline');
    }
    async function submitDecision() {
      const btn = document.getElementById('sendBtn');
      const customNote = document.getElementById('customNote').value.trim();
      btn.disabled = true;
      btn.textContent = 'E-Mail wird an den Gast gesendet...';
      try {
        const res = await fetch('/api/reservation/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: ${JSON.stringify(raw.id)},
            token: ${JSON.stringify(raw.token)},
            decision: currentDecision,
            customNote
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Fehler beim Senden');
        const isAcc = (currentDecision === 'accept');
        document.getElementById('mainView').innerHTML = \`
          <div style="text-align: center; padding: 18px 8px;">
            <div style="display: inline-block; padding: 8px 16px; border-radius: 99px; font-weight: 700; font-size: 13px; margin-bottom: 14px; background: \${isAcc ? '#F0FDF4' : '#FEF2F2'}; color: \${isAcc ? '#166534' : '#991B1B'}; border: 1px solid \${isAcc ? '#BBF7D0' : '#FECACA'};">
              \${isAcc ? 'Reservierung verbindlich bestätigt' : 'Reservierungsanfrage abgelehnt'}
            </div>
            <h2 style="margin: 0 0 10px 0; color: #071B33; font-size: 20px;">E-Mail wurde an ${raw.name} gesendet</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
              Der Gast (<strong>${raw.email}</strong>) hat soeben automatisch die \${isAcc ? 'Reservierungsbestätigung' : 'Absage-Information'} für den <strong>${raw.dateFormatted || raw.date} um ${raw.time} Uhr (${raw.guests} Personen)</strong> erhalten.
            </p>
          </div>
        \`;
      } catch (e) {
        alert('Fehler: ' + e.message);
        btn.disabled = false;
        btn.textContent = 'Rückmeldung jetzt per E-Mail senden';
      }
    }
  </script>
</body>
</html>`;

          return new Response(pageHtml, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        }

        // POST /api/reservation/respond
        const body = await request.json();
        const { id, token, decision, customNote } = body || {};
        const raw = id ? await env.EVENTS_KV.get('bickbeern_res_' + id, { type: 'json' }) : null;
        if (!raw || !token || raw.token !== token) {
          return new Response(JSON.stringify({ success: false, message: 'Reservierung nicht gefunden oder Token ungültig.' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const isAccept = (decision === 'accept');
        const dateDisp = raw.dateFormatted || raw.date || '';
        const timeDisp = raw.time ? `${raw.time} Uhr` : '';
        const noteClean = (customNote || '').trim();

        const RESEND_KEY = env.RESEND_API_KEY || '';
        const FROM_EMAIL = env.RESEND_FROM_EMAIL || 'Bickbeernhof Brokeloh <noreply@scholz-friese-webdesign.de>';
        const REPLY_TO = env.STORE_NOTIFICATION_EMAIL || 'post@bickbeernhof.de';

        const customerDecisionBodyHtml = isAccept ? `
          <p style="margin: 0 0 12px 0; color: #0F172A;">Guten Tag <strong>${raw.name}</strong>,</p>
          <p style="margin: 0 0 18px 0;">wir freuen uns sehr, Ihnen Ihre Tischreservierung im <strong>Bickbeernhof Brokeloh</strong> hiermit verbindlich zu bestätigen.</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-left: 4px solid #15803D; border-radius: 6px; margin-bottom: 20px; font-size: 13.5px;">
            <tr>
              <td style="padding: 16px 18px;">
                <div style="font-weight: 700; color: #166534; margin-bottom: 8px;">Verbindliche Reservierungsbestätigung (${raw.id})</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding: 3px 0; color: #166534; width: 140px;">Datum &amp; Uhrzeit:</td>
                    <td style="padding: 3px 0; color: #0F172A; font-weight: 700;">${dateDisp}${timeDisp ? ' um ' + timeDisp : ''}</td>
                  </tr>
                  <tr>
                    <td style="padding: 3px 0; color: #166534;">Personenanzahl:</td>
                    <td style="padding: 3px 0; color: #0F172A; font-weight: 700;">${raw.guests} Personen</td>
                  </tr>
                  <tr>
                    <td style="padding: 3px 0; color: #166534;">Reserviert auf:</td>
                    <td style="padding: 3px 0; color: #0F172A;">${raw.name}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          ${noteClean ? `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; margin-bottom: 20px;">
              <tr>
                <td style="padding: 14px 16px; font-size: 13.5px; color: #1E293B;">
                  <div style="font-weight: 700; color: #071B33; margin-bottom: 4px;">Nachricht vom Bickbeernhof-Team:</div>
                  <div style="white-space: pre-wrap;">${noteClean}</div>
                </td>
              </tr>
            </table>
          ` : ''}

          <p style="margin: 0; font-size: 13px; color: #475569;">
            Sollte sich Ihre Personenanzahl ändern oder sollten Sie verhindert sein, geben Sie uns bitte kurz telefonisch unter <strong>0 50 27 / 15 66</strong> oder per E-Mail an <a href="mailto:post@bickbeernhof.de" style="color: #071B33; font-weight: 600;">post@bickbeernhof.de</a> Bescheid. Wir freuen uns auf Ihren Besuch!
          </p>
        ` : `
          <p style="margin: 0 0 12px 0; color: #0F172A;">Guten Tag <strong>${raw.name}</strong>,</p>
          <p style="margin: 0 0 18px 0;">herzlichen Dank für Ihre Reservierungsanfrage im <strong>Bickbeernhof Brokeloh</strong> für den <strong>${dateDisp}${timeDisp ? ' um ' + timeDisp : ''} (${raw.guests} Personen)</strong>.</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FEF2F2; border: 1px solid #FECACA; border-left: 4px solid #B91C1C; border-radius: 6px; margin-bottom: 20px; font-size: 13.5px;">
            <tr>
              <td style="padding: 16px 18px; color: #7F1D1D; line-height: 1.55;">
                Leider müssen wir Ihnen mitteilen, dass wir Ihnen zum gewünschten Zeitpunkt (${dateDisp}${timeDisp ? ', ' + timeDisp : ''}) keine passenden Tischkapazitäten für ${raw.guests} Personen mehr anbieten können.
              </td>
            </tr>
          </table>

          ${noteClean ? `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; margin-bottom: 20px;">
              <tr>
                <td style="padding: 14px 16px; font-size: 13.5px; color: #1E293B;">
                  <div style="font-weight: 700; color: #071B33; margin-bottom: 4px;">Nachricht vom Bickbeernhof-Team:</div>
                  <div style="white-space: pre-wrap;">${noteClean}</div>
                </td>
              </tr>
            </table>
          ` : ''}

          <p style="margin: 0; font-size: 13px; color: #475569;">
            Für einen alternativen Termin oder eine andere Uhrzeit erreichen Sie uns jederzeit gerne telefonisch unter <strong>0 50 27 / 15 66</strong> oder per E-Mail an <a href="mailto:post@bickbeernhof.de" style="color: #071B33; font-weight: 600;">post@bickbeernhof.de</a>. Wir würden uns freuen, Sie bald bei uns begrüßen zu dürfen!
          </p>
        `;

        const customerDecisionHtml = renderBickbeernhofEmailShell({
          preheader: isAccept
            ? `Ihre Tischreservierung am ${dateDisp} um ${timeDisp} (${raw.guests} Personen) im Bickbeernhof ist bestätigt.`
            : `Rückmeldung zu Ihrer Reservierungsanfrage am ${dateDisp} im Bickbeernhof Brokeloh.`,
          eyebrow: isAccept ? 'Reservierung bestätigt' : 'Reservierungsanfrage',
          title: isAccept ? `Zusage für den ${dateDisp}` : 'Rückmeldung zu Ihrer Anfrage',
          bodyHtml: customerDecisionBodyHtml
        });

        if (RESEND_KEY && RESEND_KEY.startsWith('re_') && RESEND_KEY !== 're_test_dummy') {
          const r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: [raw.email],
              reply_to: REPLY_TO,
              subject: isAccept
                ? `Reservierungsbestätigung für den ${dateDisp}${timeDisp ? ' um ' + timeDisp : ''} – Bickbeernhof Brokeloh`
                : `Information zu Ihrer Reservierungsanfrage am ${dateDisp} – Bickbeernhof Brokeloh`,
              html: customerDecisionHtml
            })
          });
          const rOut = await r.json();
          if (!r.ok) {
            return new Response(JSON.stringify({ success: false, message: rOut?.message || 'E-Mail konnte nicht gesendet werden.' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        }

        raw.status = isAccept ? 'accepted' : 'declined';
        raw.respondedAt = new Date().toISOString();
        raw.customNote = noteClean;
        await env.EVENTS_KV.put('bickbeern_res_' + raw.id, JSON.stringify(raw), {
          expirationTtl: 60 * 60 * 24 * 120
        });

        return new Response(JSON.stringify({ success: true, status: raw.status }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), {
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
