/**
 * Professional TNTET Course Payment Receipt & Tax Invoice PDF Exporter
 * Formatted to STRICTLY fit within 1 Single A4 Page (No overflow, no cut-offs)
 * Features actual TN Teachers emblem logo, verified badge, and required powered-by footer.
 */
import { RECEIPT_LOGO_BASE64 } from "./receiptLogo";

function numberToWords(num) {
  const n = parseInt(num, 10);
  if (isNaN(n) || n === 0) return "Zero Rupees Only";
  if (n === 1000) return "Rupees One Thousand Only";
  if (n === 999) return "Rupees Nine Hundred and Ninety Nine Only";
  if (n === 499) return "Rupees Four Hundred and Ninety Nine Only";
  if (n === 1499) return "Rupees One Thousand Four Hundred and Ninety Nine Only";
  if (n === 1999) return "Rupees One Thousand Nine Hundred and Ninety Nine Only";
  if (n === 2000) return "Rupees Two Thousand Only";

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(val) {
    if ((val = val.toString()).length > 9) return 'Overflow';
    let nArr = ('000000000' + val).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!nArr) return '';
    let str = '';
    str += (Number(nArr[1]) !== 0) ? (a[Number(nArr[1])] || b[nArr[1][0]] + ' ' + a[nArr[1][1]]) + 'Crore ' : '';
    str += (Number(nArr[2]) !== 0) ? (a[Number(nArr[2])] || b[nArr[2][0]] + ' ' + a[nArr[2][1]]) + 'Lakh ' : '';
    str += (Number(nArr[3]) !== 0) ? (a[Number(nArr[3])] || b[nArr[3][0]] + ' ' + a[nArr[3][1]]) + 'Thousand ' : '';
    str += (Number(nArr[4]) !== 0) ? (a[Number(nArr[4])] || b[nArr[4][0]] + ' ' + a[nArr[4][1]]) + 'Hundred ' : '';
    str += (Number(nArr[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(nArr[5])] || b[nArr[5][0]] + ' ' + a[nArr[5][1]]) : '';
    return str.trim();
  }

  return `Rupees ${inWords(n)} Only`;
}

export function generateReceiptPdf(enrollment) {
  if (!enrollment) {
    alert("Receipt information is not available.");
    return;
  }

  const receiptNo = `REC-TET-${String(enrollment.id || 1001).padStart(6, "0")}`;
  
  // Format Date in IST
  let dateStr = "Recent";
  let timeStr = "";
  if (enrollment.created_at) {
    try {
      const d = new Date(enrollment.created_at);
      dateStr = d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
      timeStr = d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch (e) {
      dateStr = String(enrollment.created_at).slice(0, 10);
    }
  }

  const studentName = (enrollment.name || "Enrolled Student").toUpperCase();
  const studentEmail = enrollment.email || "candidate@tet.com";
  const studentMobile = enrollment.mobile || "—";
  const designation = enrollment.designation || "Private School Teacher / Aspirant";
  const courseName = enrollment.course_name || "TET 1 and TET 2 Comprehensive Course Package";
  const amountNum = enrollment.amount !== undefined ? Number(enrollment.amount) : 1000;
  const paymentId = enrollment.payment_id || "pay_TroS46OjCj36Am";
  const orderId = enrollment.order_id || `order_TET${enrollment.id || 1001}`;
  const paymentMethod = (enrollment.payment_method || "RAZORPAY").toUpperCase();
  const amountWords = numberToWords(amountNum);

  const printWindow = window.open("", "_blank", "width=820,height=960");
  if (!printWindow) {
    alert("Please allow pop-ups to open and print your payment receipt.");
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Payment Receipt - ${receiptNo} - TN Teachers</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    @page {
      size: A4 portrait;
      margin: 8mm 12mm 8mm 12mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    html, body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      height: 100%;
    }

    body {
      display: flex;
      justify-content: center;
      padding: 12px 0;
    }

    .receipt-container {
      width: 100%;
      max-width: 186mm;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 14px;
      padding: 20px 24px 16px 24px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      position: relative;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* HEADER */
    .receipt-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 12px;
      gap: 16px;
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-logo-img {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #0055ff;
      box-shadow: 0 2px 8px rgba(0, 85, 255, 0.2);
      flex-shrink: 0;
      background: #ffffff;
    }

    .brand-text h1 {
      font-size: 15px;
      font-weight: 900;
      color: #061b36;
      letter-spacing: -0.2px;
      line-height: 1.2;
    }

    .brand-text p {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
      font-weight: 600;
    }

    .brand-text .portal-link {
      font-size: 10.5px;
      color: #0055ff;
      font-weight: 700;
    }

    .receipt-title-box {
      text-align: right;
    }

    .receipt-badge {
      display: inline-block;
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      color: #3730a3;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .receipt-number {
      font-size: 14px;
      font-weight: 900;
      color: #0f172a;
      margin-top: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    .receipt-date {
      font-size: 10px;
      color: #64748b;
      font-weight: 600;
      margin-top: 1px;
    }

    /* SUCCESS STATUS STRIP */
    .status-strip {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 7px 12px;
      margin-top: 11px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-left {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .status-check {
      width: 17px;
      height: 17px;
      background: #16a34a;
      color: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10.5px;
      font-weight: 900;
    }

    .status-text {
      font-size: 11px;
      font-weight: 800;
      color: #15803d;
      letter-spacing: 0.2px;
    }

    .payment-id-tag {
      font-size: 10px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: #1e293b;
      background: #dcfce7;
      padding: 2px 7px;
      border-radius: 5px;
      font-weight: 700;
    }

    /* DETAILS GRID */
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 11px;
    }

    .detail-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 9px 12px;
    }

    .detail-card-title {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 11px;
      line-height: 1.3;
    }

    .detail-row:last-child {
      margin-bottom: 0;
    }

    .detail-label {
      color: #64748b;
      font-weight: 600;
    }

    .detail-val {
      font-weight: 700;
      color: #0f172a;
      text-align: right;
    }

    /* ITEMS TABLE */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
    }

    .items-table th {
      background: #061b36;
      color: #ffffff;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 7px 10px;
      text-align: left;
    }

    .items-table th.text-right {
      text-align: right;
    }

    .items-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11px;
      vertical-align: top;
    }

    .item-title {
      font-weight: 800;
      color: #061b36;
      font-size: 12px;
    }

    .item-desc {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
      line-height: 1.35;
    }

    .item-tags {
      margin-top: 4px;
      display: flex;
      gap: 5px;
    }

    .item-tag {
      font-size: 9px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }

    /* TOTALS SECTION */
    .totals-area {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 11px;
      gap: 16px;
    }

    .words-box {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      padding: 8px 11px;
    }

    .words-label {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 2px;
    }

    .words-text {
      font-size: 11px;
      font-weight: 800;
      color: #061b36;
    }

    .totals-table-box {
      width: 240px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }

    .totals-row.grand-total {
      border-top: 1.5px solid #061b36;
      border-bottom: 1.5px solid #061b36;
      padding: 5px 0;
      margin-top: 3px;
      font-size: 13.5px;
      font-weight: 900;
      color: #061b36;
    }

    /* SIGNATURE & VERIFICATION */
    .verification-section {
      margin-top: 12px;
      padding-top: 9px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .verification-note {
      flex: 1;
      font-size: 9.5px;
      color: #64748b;
      line-height: 1.4;
    }

    .verification-badge-box {
      text-align: right;
      flex-shrink: 0;
    }

    .stamp-badge {
      display: inline-block;
      border: 1.5px solid #16a34a;
      background: #f0fdf4;
      color: #16a34a;
      border-radius: 6px;
      padding: 4px 10px;
      font-weight: 900;
      font-size: 10px;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .stamp-subtitle {
      font-size: 8.5px;
      color: #64748b;
      margin-top: 2px;
      font-weight: 600;
    }

    /* MANDATORY FOOTER */
    .receipt-footer {
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 9.5px;
      font-weight: 700;
      color: #475569;
      letter-spacing: 0.2px;
    }

    .print-controls {
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      gap: 10px;
      z-index: 1000;
    }

    .btn-print {
      background: #0055ff;
      color: #ffffff;
      border: none;
      padding: 9px 18px;
      border-radius: 9999px;
      font-weight: 800;
      font-size: 12px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 85, 255, 0.35);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-print:hover {
      background: #0040c0;
    }

    @media print {
      html, body {
        background: #ffffff !important;
        padding: 0 !important;
        margin: 0 !important;
        height: auto !important;
      }
      .receipt-container {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .print-controls {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <div class="print-controls">
    <button class="btn-print" onclick="window.print()">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <div class="receipt-container">

    <!-- HEADER WITH ACTUAL LOGO -->
    <div class="receipt-header">
      <div class="brand-section">
        <img src="${RECEIPT_LOGO_BASE64}" alt="TN Teachers Logo" class="brand-logo-img" />
        <div class="brand-text">
          <h1>TN TEACHERS BENCHMARK PLATFORM</h1>
          <p>Online Teacher Eligibility Test (TNTET) Academic Portal</p>
          <p><span class="portal-link">https://tnteachers.in</span> • support@tnteachers.in</p>
        </div>
      </div>

      <div class="receipt-title-box">
        <span class="receipt-badge">Payment Receipt / Tax Invoice</span>
        <div class="receipt-number">${receiptNo}</div>
        <div class="receipt-date">Date: ${dateStr}${timeStr ? ` • ${timeStr}` : ""}</div>
      </div>
    </div>

    <!-- STATUS STRIP -->
    <div class="status-strip">
      <div class="status-left">
        <div class="status-check">✓</div>
        <div class="status-text">PAYMENT STATUS: COMPLETED / VERIFIED</div>
      </div>
      <div class="payment-id-tag">Txn ID: ${paymentId}</div>
    </div>

    <!-- DETAILS GRID -->
    <div class="details-grid">
      <!-- Billed To (Student) -->
      <div class="detail-card">
        <div class="detail-card-title">Candidate Details (Billed To)</div>
        <div class="detail-row">
          <span class="detail-label">Name:</span>
          <span class="detail-val">${studentName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-val">${studentEmail}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Mobile:</span>
          <span class="detail-val">${studentMobile}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Designation:</span>
          <span class="detail-val">${designation}</span>
        </div>
      </div>

      <!-- Payment & Transaction Details -->
      <div class="detail-card">
        <div class="detail-card-title">Transaction Particulars</div>
        <div class="detail-row">
          <span class="detail-label">Payment Gateway:</span>
          <span class="detail-val">Razorpay Gateway</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment ID:</span>
          <span class="detail-val" style="font-family: monospace;">${paymentId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Order ID:</span>
          <span class="detail-val" style="font-family: monospace;">${orderId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Mode:</span>
          <span class="detail-val">${paymentMethod}</span>
        </div>
      </div>
    </div>

    <!-- ITEMS TABLE -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 35px;">#</th>
          <th>Service Description</th>
          <th style="width: 105px;">Access Plan</th>
          <th class="text-right" style="width: 110px;">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>
            <div class="item-title">${courseName}</div>
            <div class="item-desc">
              Comprehensive TNTET Course Package. Includes 5-stage sequential study workflow (PDF Books, Topic Notes, Video Lectures, Daily Practice MCQs, 80% Benchmark Qualifying Exams) and VIP Community Access.
            </div>
            <div class="item-tags">
              <span class="item-tag">Paper 1 (Class 1-8)</span>
              <span class="item-tag">Paper 2 (Class 6-12)</span>
              <span class="item-tag">Digital Access</span>
            </div>
          </td>
          <td>
            <div style="font-weight: 700; color: #0f172a; font-size: 11px;">1-Year Access</div>
            <div style="font-size: 9.5px; color: #16a34a; font-weight: 700;">Instant Digital</div>
          </td>
          <td class="text-right" style="font-weight: 800; font-size: 13.5px; color: #061b36;">
            ₹${amountNum.toLocaleString("en-IN")}.00
          </td>
        </tr>
      </tbody>
    </table>

    <!-- TOTALS AREA -->
    <div class="totals-area">
      <div class="words-box">
        <div class="words-label">Amount in Words</div>
        <div class="words-text">${amountWords}</div>
      </div>

      <div class="totals-table-box">
        <div class="totals-row">
          <span>Subtotal:</span>
          <span>₹${amountNum.toLocaleString("en-IN")}.00</span>
        </div>
        <div class="totals-row">
          <span>Taxes (Inclusive):</span>
          <span>₹0.00</span>
        </div>
        <div class="totals-row grand-total">
          <span>Total Paid:</span>
          <span>₹${amountNum.toLocaleString("en-IN")}.00</span>
        </div>
      </div>
    </div>

    <!-- VERIFICATION SECTION -->
    <div class="verification-section">
      <div class="verification-note">
        <strong>Important Notice:</strong> This is a digitally verified receipt for candidate enrollment on <strong>tnteachers.in</strong>. Immediate access to study materials and mock exams has been granted.
      </div>

      <div class="verification-badge-box">
        <div class="stamp-badge">
          ✓ OFFICIALLY VERIFIED
        </div>
        <div class="stamp-subtitle">TN Teachers Academic Portal</div>
      </div>
    </div>

    <!-- MANDATORY FOOTER REQUIRED BY USER -->
    <div class="receipt-footer">
      This receipt is auto generated - Powered by FrontierWox Tech Pvt Ltd - www.frontierwox.in
    </div>

  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
