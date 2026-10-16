/**
 * Professional TN TET Paper 2 PDF Quiz Exporter
 * Generates an authentic, beautifully styled printable document matching the official
 * TN TET Paper 2 Question Paper format with Tamil Unicode font rendering,
 * boxed layout, options on two lines, and bold answers.
 */

export function downloadQuizAsPdf({ title, subtitle, lesson, quizType, questions }) {
  if (!questions || questions.length === 0) {
    alert("No questions available to download.");
    return;
  }

  const printWindow = window.open("", "_blank", "width=920,height=850");
  if (!printWindow) {
    alert("Please allow popups in your browser to view and download the PDF.");
    return;
  }

  const subject = lesson?.subject || "சமூக அறிவியல் (Social Science)";
  const classNum = lesson?.class_num ? `வகுப்பு ${lesson.class_num}` : "எட்டாம் வகுப்பு (Class 8)";
  const term = lesson?.term || "பருவம் 1 (Term 1)";
  const headingTitle = title || lesson?.title || "அலகு 1: ஐரோப்பியர்களின் வருகை";
  
  const isType2 = quizType === "type2";
  const sectionTitle = isType2
    ? "பகுதி II: உயர் சிந்தனை & சிறப்பு மீட்புப் பயிற்சி வினாக்கள் (Type 2 Remedial Quiz - 200 MCQs)"
    : "பகுதி I: மாதிரித் தேர்வு & பயிற்சி வினாக்கள் (Type 1 Standard Practice - 200 MCQs)";

  const questionsHtml = questions.map((q, idx) => {
    const qNum = idx + 1;
    const opts = q.options || ["", "", "", ""];
    const optA = opts[0] || "";
    const optB = opts[1] || "";
    const optC = opts[2] || "";
    const optD = opts[3] || "";

    let ansLetter = "A";
    let ansText = optA;
    if (typeof q.answer === "string") {
      const trimmed = q.answer.trim();
      if (["A", "B", "C", "D"].includes(trimmed.toUpperCase())) {
        ansLetter = trimmed.toUpperCase();
        const mapIdx = { A: 0, B: 1, C: 2, D: 3 };
        ansText = opts[mapIdx[ansLetter]] || "";
      } else {
        ansText = trimmed;
        const foundIdx = opts.findIndex(o => o.trim() === trimmed);
        if (foundIdx !== -1) {
          ansLetter = String.fromCharCode(65 + foundIdx);
        }
      }
    } else if (typeof q.answer_index === "number") {
      ansLetter = String.fromCharCode(65 + q.answer_index);
      ansText = opts[q.answer_index] || "";
    }

    return `
      <div class="q-block">
        <div class="q-title"><strong>${qNum}.</strong> ${q.question}</div>
        <div class="q-options-row">
          <div class="q-opt"><strong>A.</strong> ${optA}</div>
          <div class="q-opt"><strong>B.</strong> ${optB}</div>
        </div>
        <div class="q-options-row">
          <div class="q-opt"><strong>C.</strong> ${optC}</div>
          <div class="q-opt"><strong>D.</strong> ${optD}</div>
        </div>
        <div class="q-ans"><strong>விடை:</strong> <b>${ansLetter}. ${ansText}</b></div>
        ${q.explanation ? `<div class="q-exp"><em>(விளக்கம்: ${q.explanation})</em></div>` : ""}
      </div>
    `;
  }).join("");

  const html = `
    <!DOCTYPE html>
    <html lang="ta">
    <head>
      <meta charset="utf-8" />
      <title>${headingTitle} - TET Paper 2 PDF</title>
      <style>
        @page {
          size: A4;
          margin: 10mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          font-family: 'Nirmala UI', 'Latha', 'Mukta Malar', 'Segoe UI', Tahoma, Arial, sans-serif;
          margin: 0;
          padding: 16px;
          color: #000;
          background: #fff;
          font-size: 13px;
          line-height: 1.5;
        }
        .page-border {
          border: 2px solid #000;
          padding: 22px;
          min-height: 98vh;
        }
        .top-banner {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .top-banner h1 {
          font-size: 21px;
          font-weight: 900;
          letter-spacing: 1.5px;
          margin: 0 0 5px 0;
          text-transform: uppercase;
        }
        .top-banner h2 {
          font-size: 15px;
          font-weight: 800;
          margin: 0 0 4px 0;
        }
        .top-banner p {
          font-size: 12px;
          font-weight: bold;
          margin: 0;
          color: #222;
        }
        .section-header {
          font-size: 13.5px;
          font-weight: 900;
          background: #f1f5f9;
          padding: 7px 12px;
          border: 1px solid #000;
          margin: 16px 0 12px 0;
          letter-spacing: 0.5px;
        }
        .q-block {
          margin-bottom: 15px;
          page-break-inside: avoid;
        }
        .q-title {
          font-size: 13px;
          margin-bottom: 5px;
          text-align: justify;
          line-height: 1.5;
        }
        .q-options-row {
          display: flex;
          justify-content: space-between;
          margin-left: 18px;
          margin-bottom: 3px;
        }
        .q-opt {
          width: 48%;
          font-size: 12.5px;
          line-height: 1.4;
        }
        .q-ans {
          margin-left: 18px;
          margin-top: 4px;
          font-size: 12.5px;
        }
        .q-ans b {
          font-weight: 900;
        }
        .q-exp {
          margin-left: 18px;
          font-size: 11.5px;
          color: #333;
          margin-top: 2px;
        }
        .footer-bar {
          margin-top: 30px;
          border-top: 1px solid #000;
          padding-top: 8px;
          text-align: center;
          font-size: 11px;
          font-weight: bold;
          color: #111;
        }
        .no-print-toolbar {
          position: fixed;
          top: 14px;
          right: 20px;
          background: #092c85;
          color: white;
          padding: 10px 18px;
          border-radius: 14px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.35);
          display: flex;
          gap: 12px;
          align-items: center;
          z-index: 9999;
        }
        .no-print-toolbar button {
          background: #0055ff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 10px;
          font-weight: 900;
          cursor: pointer;
          font-size: 13px;
          transition: background 0.2s;
        }
        .no-print-toolbar button:hover {
          background: #0044cc;
        }
        .no-print-toolbar button.close-btn {
          background: #dc2626;
        }
        .no-print-toolbar button.close-btn:hover {
          background: #b91c1c;
        }
        @media print {
          .no-print-toolbar { display: none !important; }
          body { padding: 0; }
          .page-border { border: 2px solid #000; min-height: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="no-print-toolbar">
        <span style="font-weight: bold;">📄 TN TET Paper 2 PDF Exporter</span>
        <button onclick="window.print()">📥 Save as PDF / Print</button>
        <button class="close-btn" onclick="window.close()">✕ Close</button>
      </div>

      <div class="page-border">
        <div class="top-banner">
          <h1>TET PAPER 2</h1>
          <h2>${classNum} - ${subject} (${term})</h2>
          <p>${headingTitle} • Total Questions: ${questions.length} • Minimum Pass Mark: 80%</p>
        </div>

        <div class="section-header">${sectionTitle} (1 - ${questions.length})</div>

        ${questionsHtml}

        <div class="footer-bar">
          K. SELVAKUMAR - TRICHY • TN Teacher Platform • Tamil Nadu Teachers Eligibility Test (TET Paper 2) Standards
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
