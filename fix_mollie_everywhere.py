import os

directory = 'C:/Users/eaddi/.gemini/antigravity/scratch/bickbeernhof'
js_path = os.path.join(directory, 'script.js')

with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Replace the entire ensureCartDrawerDOM & bindCartEvents with the real Mollie checkout
old_ensure_block = """    <div class="shop-modal-overlay" id="checkoutModalOverlay"></div>
    <div class="checkout-modal" id="checkoutModal">
      <button class="modal-close-btn" id="closeCheckoutModalBtn" aria-label="Schließen">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <div class="checkout-modal-header">
        <h2>💳 Kasse &amp; Bezahlung</h2>
        <p>Geben Sie Ihre Lieferadresse ein und wählen Sie Ihre bevorzugte Bezahlmethode.</p>
      </div>

      <form id="mollieCheckoutForm" class="checkout-form">
        <div class="form-row-2">
          <div class="form-group">
            <label for="coFirstName">Vorname *</label>
            <input type="text" id="coFirstName" class="form-control" placeholder="Max" required>
          </div>
          <div class="form-group">
            <label for="coLastName">Nachname *</label>
            <input type="text" id="coLastName" class="form-control" placeholder="Mustermann" required>
          </div>
        </div>

        <div class="form-group">
          <label for="coEmail">E-Mail-Adresse für Bestellbestätigung *</label>
          <input type="email" id="coEmail" class="form-control" placeholder="max.mustermann@beispiel.de" required>
        </div>

        <div class="form-group">
          <label for="coStreet">Straße &amp; Hausnummer *</label>
          <input type="text" id="coStreet" class="form-control" placeholder="Musterstraße 12" required>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label for="coZip">Postleitzahl *</label>
            <input type="text" id="coZip" class="form-control" placeholder="31628" required>
          </div>
          <div class="form-group">
            <label for="coCity">Ort *</label>
            <input type="text" id="coCity" class="form-control" placeholder="Landesbergen" required>
          </div>
        </div>

        <div class="form-group">
          <label for="coPaymentMethod">Bevorzugte Zahlungsart wählen *</label>
          <select id="coPaymentMethod" class="form-control" required>
            <option value="paypal">🅿️ PayPal (Schnell &amp; Einfach)</option>
            <option value="klarna">🛍️ Klarna (Kauf auf Rechnung / Ratenkauf)</option>
            <option value="creditcard">💳 Kreditkarte (Visa, Mastercard)</option>
            <option value="applepay">🍏 Apple Pay</option>
            <option value="giropay">🏦 Giropay / SOFORT Überweisung</option>
            <option value="banktransfer">📑 Vorkasse Banküberweisung</option>
          </select>
        </div>

        <div class="checkout-order-summary-box">
          <div class="summary-line"><span>Artikel im Warenkorb:</span> <strong id="modalSummaryCount">0</strong></div>
          <div class="summary-line"><span>Gesamtsumme inkl. MwSt. &amp; Versand:</span> <strong id="modalSummaryTotal" style="color: var(--color-secondary); font-size: 1.2rem;">0,00 €</strong></div>
        </div>

        <button type="submit" class="btn btn-secondary btn-special-glow" style="width: 100%; margin-top: 20px; padding: 14px;">
          🔒 Jetzt kostenpflichtig bestellen &amp; bezahlen
        </button>
        
        <p style="font-size: 0.78rem; text-align: center; color: var(--color-text-muted); margin-top: 12px;">
          Mit Klick auf Bestellbutton akzeptieren Sie unsere <a href="agb.html" target="_blank" style="color: var(--color-secondary);">AGB</a> und <a href="widerruf.html" target="_blank" style="color: var(--color-secondary);">Widerrufsbelehrung</a>.
        </p>
      </form>
    </div>"""

new_ensure_block = """    <div class="shop-modal-overlay" id="checkoutModalOverlay"></div>
    <div class="checkout-modal" id="checkoutModal">
      <button class="modal-close-btn" id="closeCheckoutModalBtn" aria-label="Schließen">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <div class="checkout-modal-header">
        <h2>💳 Kasse &amp; Bezahlung</h2>
        <p>Geben Sie Ihre Lieferadresse für den Versand ein.</p>
      </div>

      <form id="mollieCheckoutForm" class="checkout-form">
        <div class="form-row-2">
          <div class="form-group">
            <label for="coFirstName">Vorname *</label>
            <input type="text" id="coFirstName" class="form-control" placeholder="Max" required>
          </div>
          <div class="form-group">
            <label for="coLastName">Nachname *</label>
            <input type="text" id="coLastName" class="form-control" placeholder="Mustermann" required>
          </div>
        </div>

        <div class="form-group">
          <label for="coEmail">E-Mail-Adresse für Bestellbestätigung *</label>
          <input type="email" id="coEmail" class="form-control" placeholder="max.mustermann@beispiel.de" required>
        </div>

        <div class="form-group">
          <label for="coStreet">Straße &amp; Hausnummer *</label>
          <input type="text" id="coStreet" class="form-control" placeholder="Musterstraße 12" required>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label for="coZip">Postleitzahl *</label>
            <input type="text" id="coZip" class="form-control" placeholder="31628" required>
          </div>
          <div class="form-group">
            <label for="coCity">Ort *</label>
            <input type="text" id="coCity" class="form-control" placeholder="Landesbergen" required>
          </div>
        </div>

        <div class="mollie-payment-notice-box" style="background: rgba(44, 94, 59, 0.06); border: 1px solid rgba(44, 94, 59, 0.15); border-radius: 12px; padding: 14px 16px; margin: 15px 0; display: flex; align-items: flex-start; gap: 12px; text-align: left;">
          <span style="font-size: 1.4rem; line-height: 1;">🛡️</span>
          <div style="font-size: 0.86rem; color: var(--color-text-dark); line-height: 1.45;">
            <strong style="color: var(--color-primary); display: block; margin-bottom: 2px;">Sichere Bezahlung via Mollie:</strong>
            Die Auswahl Ihrer Zahlungsart (<strong>PayPal, Klarna, Kreditkarte, Apple Pay, Überweisung</strong> etc.) erfolgt im nächsten Schritt direkt auf der gesicherten Zahlungsseite.
          </div>
        </div>

        <div class="checkout-order-summary-box">
          <div class="summary-line"><span>Artikel im Warenkorb:</span> <strong id="modalSummaryCount">0</strong></div>
          <div class="summary-line"><span>Gesamtsumme inkl. MwSt. &amp; Versand:</span> <strong id="modalSummaryTotal" style="color: var(--color-secondary); font-size: 1.2rem;">0,00 €</strong></div>
        </div>

        <button type="submit" class="btn btn-secondary btn-special-glow" style="width: 100%; margin-top: 20px; padding: 14px;">
          🔒 Jetzt bezahlen mit Mollie
        </button>
        
        <p style="font-size: 0.78rem; text-align: center; color: var(--color-text-muted); margin-top: 12px;">
          Mit Klick auf Bestellbutton akzeptieren Sie unsere <a href="agb.html" target="_blank" style="color: var(--color-secondary);">AGB</a> und <a href="widerruf.html" target="_blank" style="color: var(--color-secondary);">Widerrufsbelehrung</a>.
        </p>
      </form>
    </div>"""

if old_ensure_block in js:
    js = js.replace(old_ensure_block, new_ensure_block)
    print("Replaced old ensureCartDrawerDOM checkout modal HTML.")

# 2. Define global handleMollieCheckoutSubmit function
old_submit_in_bind = """  const checkoutForm = document.getElementById('mollieCheckoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('coFirstName').value + ' ' + document.getElementById('coLastName').value;
      const email = document.getElementById('coEmail').value;
      const method = document.getElementById('coPaymentMethod').value;

      alert(`Vielen Dank für Ihre Bestellung, ${name}!\\n\\nIhre Bestellung wird jetzt an das gesicherten Zahlungsdienstleister (${method.toUpperCase()}) weitergeleitet. Eine Bestätigungs-E-Mail wird an ${email} gesendet.`);

      bickbeernhofCart = [];
      saveCart();

      if (checkoutModal) checkoutModal.classList.remove('active');
      if (checkoutOverlay) checkoutOverlay.classList.remove('active');
    });
  }"""

new_submit_in_bind = """  const checkoutForm = document.getElementById('mollieCheckoutForm');
  if (checkoutForm) {
    checkoutForm.removeEventListener('submit', window.handleMollieCheckoutSubmit);
    checkoutForm.addEventListener('submit', window.handleMollieCheckoutSubmit);
  }"""

if old_submit_in_bind in js:
    js = js.replace(old_submit_in_bind, new_submit_in_bind)
    print("Replaced old submit listener in bindCartEvents.")

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)
