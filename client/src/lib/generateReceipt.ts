interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ReceiptData {
  orderId?: number | string;
  shopName?: string;
  shopPhone?: string;
  customerName: string;
  customerPhone: string;
  deliveryLocation?: string;
  items: ReceiptItem[];
  deliveryFee?: number;
  date?: string;
  status?: string;
}

const statusLabel: Record<string, string> = {
  pending: "En attente",
  contacted: "Contacté",
  confirmed: "Confirmé",
  delivered: "Livré ✅",
  cancelled: "Annulé",
};

export function generateReceipt(data: ReceiptData) {
  const subtotal = data.items.reduce((s, i) => s + i.total, 0);
  const delivery = data.deliveryFee ?? 0;
  const grandTotal = subtotal + delivery;
  const dateStr = data.date
    ? new Date(data.date).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })
    : new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 6px;border-bottom:1px solid #f0f0f0;">${item.name}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #f0f0f0;text-align:right;">${item.unitPrice.toLocaleString("fr-FR")} F</td>
        <td style="padding:8px 6px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${item.total.toLocaleString("fr-FR")} F</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Reçu #${data.orderId ?? "—"} — ${data.shopName ?? "Jappandal Boutique"}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f5;color:#222;padding:20px;}
    .page{max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);}
    .header{background:linear-gradient(135deg,#1E5A8E,#0a3060);color:#fff;padding:28px 24px 20px;text-align:center;}
    .logo{font-size:22px;font-weight:900;letter-spacing:-0.5px;}
    .logo span{color:#A8D24E;}
    .subtitle{font-size:11px;opacity:.7;margin-top:2px;}
    .badge{display:inline-block;margin-top:10px;background:rgba(168,210,78,0.2);border:1px solid rgba(168,210,78,0.4);color:#A8D24E;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;}
    .meta{display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:1px solid #f0f0f0;}
    .meta-item{padding:12px 20px;}
    .meta-item:first-child{border-right:1px solid #f0f0f0;}
    .meta-label{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:.5px;}
    .meta-value{font-size:13px;font-weight:700;color:#1a1a1a;margin-top:2px;}
    .section{padding:16px 20px;}
    .section-title{font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:#999;margin-bottom:10px;font-weight:700;}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
    .info-item .label{font-size:10px;color:#aaa;}
    .info-item .value{font-size:13px;font-weight:600;margin-top:1px;}
    table{width:100%;border-collapse:collapse;font-size:13px;}
    thead tr{background:#f8f9fa;}
    thead th{padding:8px 6px;text-align:left;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:.5px;}
    thead th:nth-child(2){text-align:center;}
    thead th:nth-child(3),thead th:nth-child(4){text-align:right;}
    .totals{background:#f8f9fa;padding:14px 20px;}
    .total-row{display:flex;justify-content:space-between;font-size:13px;padding:3px 0;}
    .total-row .label{color:#666;}
    .total-row .value{font-weight:600;}
    .grand-total{border-top:2px solid #1E5A8E;margin-top:8px;padding-top:10px;display:flex;justify-content:space-between;}
    .grand-total .label{font-size:15px;font-weight:700;}
    .grand-total .value{font-size:18px;font-weight:900;color:#1E5A8E;}
    .footer{background:#fafafa;border-top:1px solid #f0f0f0;padding:16px 20px;text-align:center;}
    .footer p{font-size:11px;color:#aaa;line-height:1.6;}
    .footer strong{color:#555;}
    .status-badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;background:#e8f5e9;color:#2e7d32;}
    @media print{
      body{background:#fff;padding:0;}
      .page{box-shadow:none;border-radius:0;}
      .no-print{display:none!important;}
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo">Jappandal <span>Boutique</span></div>
      <div class="subtitle">Votre Supermarché de Confiance · Dakar, Sénégal</div>
      <div class="badge">Reçu de commande</div>
    </div>

    <div class="meta">
      <div class="meta-item">
        <div class="meta-label">N° Commande</div>
        <div class="meta-value">#${data.orderId ?? "—"}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Date</div>
        <div class="meta-value" style="font-size:11px;">${dateStr}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Informations client</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="label">Nom</div>
          <div class="value">${data.customerName || "—"}</div>
        </div>
        <div class="info-item">
          <div class="label">Téléphone</div>
          <div class="value">+221 ${data.customerPhone || "—"}</div>
        </div>
        ${data.deliveryLocation ? `
        <div class="info-item" style="grid-column:1/-1">
          <div class="label">Zone de livraison</div>
          <div class="value">📍 ${data.deliveryLocation}</div>
        </div>` : ""}
        ${data.status ? `
        <div class="info-item">
          <div class="label">Statut</div>
          <div class="value"><span class="status-badge">${statusLabel[data.status] ?? data.status}</span></div>
        </div>` : ""}
      </div>
    </div>

    <div class="section" style="padding-top:0;">
      <div class="section-title">Articles commandés</div>
      <table>
        <thead>
          <tr>
            <th>Produit</th>
            <th>Qté</th>
            <th>P.U.</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>

    <div class="totals">
      <div class="total-row">
        <span class="label">Sous-total</span>
        <span class="value">${subtotal.toLocaleString("fr-FR")} FCFA</span>
      </div>
      <div class="total-row">
        <span class="label">Frais de livraison</span>
        <span class="value">${delivery > 0 ? `${delivery.toLocaleString("fr-FR")} FCFA` : "Offerts"}</span>
      </div>
      <div class="grand-total">
        <span class="label">TOTAL À PAYER</span>
        <span class="value">${grandTotal.toLocaleString("fr-FR")} FCFA</span>
      </div>
    </div>

    <div class="footer">
      <p>Paiement à la livraison · Livraison sous 24h à Dakar</p>
      <p style="margin-top:6px;"><strong>${data.shopName ?? "Jappandal Boutique"}</strong>${data.shopPhone ? ` · +221 ${data.shopPhone}` : ""}</p>
      <p style="margin-top:8px;">Merci de votre confiance ! 🙏</p>
    </div>
  </div>

  <div class="no-print" style="text-align:center;margin-top:20px;">
    <button onclick="window.print()" style="background:#1E5A8E;color:#fff;border:none;padding:12px 32px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">
      🖨️ Imprimer / Enregistrer en PDF
    </button>
  </div>

  <script>
    // Auto-print after load (comment out if not wanted)
    // window.onload = () => window.print();
  </script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=600,height=800");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
