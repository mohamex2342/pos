import { Sale, Settings, Customer } from "./database";
import { formatCurrency, formatInt, toArabicDigits, formatDateTime } from "./format";

const wrapPrint = (content: string, title: string) => {
  const w = window.open("", "_blank", "width=800,height=600");
  if (!w) return;
  w.document.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Cairo', sans-serif; }
        body { padding: 30px; color: #1a1a2e; background: #fff; direction: rtl; }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 3px solid #0ea5e9; margin-bottom: 25px; }
        .header h1 { color: #0ea5e9; font-size: 32px; font-weight: 800; }
        .header p { color: #666; margin-top: 5px; font-size: 14px; }
        .info { display: flex; justify-content: space-between; margin: 20px 0; padding: 15px; background: #f1f5f9; border-radius: 12px; }
        .info-block h3 { font-size: 13px; color: #64748b; margin-bottom: 5px; font-weight: 600; }
        .info-block p { font-weight: 700; font-size: 15px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        thead { background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; }
        th, td { padding: 12px; text-align: right; }
        tbody tr { border-bottom: 1px solid #e2e8f0; }
        tbody tr:nth-child(even) { background: #f8fafc; }
        .totals { margin: 20px 0; padding: 20px; background: #f1f5f9; border-radius: 12px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .totals-row.grand { border-top: 2px solid #0ea5e9; padding-top: 12px; margin-top: 8px; font-size: 20px; font-weight: 800; color: #0ea5e9; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px dashed #e2e8f0; color: #64748b; font-size: 13px; }
        @media print { body { padding: 15px; } .no-print { display: none; } }
      </style>
    </head>
    <body>
      ${content}
      <div class="no-print" style="text-align:center;margin-top:20px;">
        <button onclick="window.print()" style="padding:12px 30px;background:#0ea5e9;color:#fff;border:none;border-radius:8px;font-size:16px;cursor:pointer;font-family:'Cairo',sans-serif;">طباعة</button>
      </div>
      <script>setTimeout(() => window.print(), 500);</script>
    </body>
    </html>
  `);
  w.document.close();
};

export const printInvoice = (sale: Sale, settings: Settings) => {
  const itemsHtml = sale.items.map((it, i) => `
    <tr>
      <td>${toArabicDigits(i + 1)}</td>
      <td>${it.name}</td>
      <td>${formatInt(it.quantity)}</td>
      <td>${formatCurrency(it.price, settings.currency)}</td>
      <td>${formatCurrency(it.total, settings.currency)}</td>
    </tr>
  `).join("");

  const content = `
    <div class="header">
      <h1>${settings.companyName}</h1>
      ${settings.companyAddress ? `<p>${settings.companyAddress}</p>` : ""}
      ${settings.companyPhone ? `<p>هاتف: ${toArabicDigits(settings.companyPhone)}</p>` : ""}
    </div>
    <h2 style="text-align:center;color:#0ea5e9;margin-bottom:15px;">فاتورة مبيعات</h2>
    <div class="info">
      <div class="info-block">
        <h3>رقم الفاتورة</h3>
        <p>#${toArabicDigits(sale.invoiceNumber)}</p>
      </div>
      <div class="info-block">
        <h3>التاريخ</h3>
        <p>${formatDateTime(sale.date)}</p>
      </div>
      <div class="info-block">
        <h3>العميل</h3>
        <p>${sale.customerName}</p>
      </div>
      <div class="info-block">
        <h3>طريقة الدفع</h3>
        <p>${sale.paymentMethod === "cash" ? "نقد" : "على الحساب"}</p>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>المنتج</th>
          <th>الكمية</th>
          <th>السعر</th>
          <th>الإجمالي</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div class="totals">
      <div class="totals-row"><span>المجموع الفرعي:</span><span>${formatCurrency(sale.subtotal, settings.currency)}</span></div>
      <div class="totals-row"><span>الضريبة (${toArabicDigits(sale.tax)}٪):</span><span>${formatCurrency(sale.taxAmount, settings.currency)}</span></div>
      <div class="totals-row grand"><span>الإجمالي:</span><span>${formatCurrency(sale.total, settings.currency)}</span></div>
      ${sale.remaining > 0 ? `
        <div class="totals-row"><span>المدفوع:</span><span>${formatCurrency(sale.paid, settings.currency)}</span></div>
        <div class="totals-row" style="color:#dc2626;font-weight:700;"><span>المتبقي:</span><span>${formatCurrency(sale.remaining, settings.currency)}</span></div>
      ` : ""}
    </div>
    <div class="footer">
      <p>شكراً لتعاملكم معنا</p>
      <p style="margin-top:8px;"> نظام إدارة نقاط البيع</p>
    </div>
  `;
  wrapPrint(content, `فاتورة #${sale.invoiceNumber}`);
};

export const printReceipt = (
  data: { partyName: string; amount: number; date: number; notes?: string; type: "customer" | "supplier" },
  settings: Settings,
) => {
  const content = `
    <div class="header">
      <h1>${settings.companyName}</h1>
    </div>
    <h2 style="text-align:center;color:#0ea5e9;margin:20px 0;">إيصال ${data.type === "customer" ? "استلام" : "صرف"} مبلغ</h2>
    <div class="info">
      <div class="info-block">
        <h3>التاريخ</h3>
        <p>${formatDateTime(data.date)}</p>
      </div>
      <div class="info-block">
        <h3>${data.type === "customer" ? "من السيد/ة" : "إلى السيد/ة"}</h3>
        <p>${data.partyName}</p>
      </div>
    </div>
    <div style="text-align:center;padding:30px;background:#f1f5f9;border-radius:12px;margin:20px 0;">
      <p style="color:#64748b;margin-bottom:10px;">المبلغ</p>
      <p style="font-size:40px;font-weight:800;color:#0ea5e9;">${formatCurrency(data.amount, settings.currency)}</p>
    </div>
    ${data.notes ? `<p style="padding:15px;background:#f8fafc;border-radius:8px;"><strong>ملاحظات:</strong> ${data.notes}</p>` : ""}
    <div style="display:flex;justify-content:space-between;margin-top:60px;">
      <div style="text-align:center;"><div style="border-top:2px solid #1a1a2e;width:200px;padding-top:8px;">توقيع المستلم</div></div>
      <div style="text-align:center;"><div style="border-top:2px solid #1a1a2e;width:200px;padding-top:8px;">توقيع المسلّم</div></div>
    </div>
  `;
  wrapPrint(content, "إيصال مبلغ");
};

export const printCustomerStatement = (customer: Customer, sales: Sale[], settings: Settings) => {
  const customerSales = sales.filter((s) => s.customerId === customer.id);
  const rows = customerSales.map((s) => `
    <tr>
      <td>${formatDateTime(s.date)}</td>
      <td>#${toArabicDigits(s.invoiceNumber)}</td>
      <td>${formatCurrency(s.total, settings.currency)}</td>
      <td>${formatCurrency(s.paid, settings.currency)}</td>
      <td style="color:${s.remaining > 0 ? "#dc2626" : "#16a34a"};font-weight:700;">${formatCurrency(s.remaining, settings.currency)}</td>
    </tr>
  `).join("");

  const content = `
    <div class="header">
      <h1>${settings.companyName}</h1>
    </div>
    <h2 style="text-align:center;color:#0ea5e9;margin:20px 0;">كشف حساب عميل</h2>
    <div class="info">
      <div class="info-block"><h3>اسم العميل</h3><p>${customer.name}</p></div>
      <div class="info-block"><h3>الهاتف</h3><p>${toArabicDigits(customer.phone || "-")}</p></div>
      <div class="info-block"><h3>الرصيد الحالي</h3><p style="color:${customer.balance > 0 ? "#dc2626" : "#16a34a"};">${formatCurrency(Math.abs(customer.balance), settings.currency)} ${customer.balance > 0 ? "مدين" : "دائن"}</p></div>
    </div>
    <table>
      <thead>
        <tr><th>التاريخ</th><th>الفاتورة</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th></tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="5" style="text-align:center;padding:30px;">لا توجد معاملات</td></tr>`}</tbody>
    </table>
  `;
  wrapPrint(content, `كشف حساب - ${customer.name}`);
};
