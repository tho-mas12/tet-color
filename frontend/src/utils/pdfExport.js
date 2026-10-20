/**
 * Professional TN TET Paper 2 PDF Quiz Exporter
 * Generates an authentic, beautifully styled printable document matching the official
 * TN TET Paper 2 Question Paper format with Tamil Unicode font rendering,
 * boxed layout, options on two lines, and bold answers.
 */

function cleanTamilForPdf(str) {
  if (!str || typeof str !== "string") return "";
  let t = str.normalize("NFC");
  // 1. Strip Private Use Area (U+E000-U+F8FF), surrogates, and replacement characters (causes tofu 􀄠)
  t = t.replace(/[\uE000-\uF8FF\uD800-\uDFFF\uFFFD\uFEFF]/g, "");
  // 2. Strip non-printable control characters
  t = t.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");
  // 3. Remove OCR artifact 'F' inside Tamil words
  t = t.replace(/([\u0B80-\u0BFF])F([\u0B80-\u0BFF])/g, "$1$2");
  // 4. Deduplicate combining vowel signs (கொொ -> கொ, நோோ -> நோ)
  t = t.replace(/(\u0BCA|\u0BCB|\u0BCC)+/g, "$1");
  t = t.replace(/(\u0BBE|\u0BBF|\u0BC0|\u0BC1|\u0BC2|\u0BC6|\u0BC7|\u0BC8)+/g, "$1");
  // 5. Fix spaces before pullis or vowel signs (e.g. 'சொ ன்னார்' -> 'சொன்னார்')
  t = t.replace(/\s+([\u0BCD\u0BBE-\u0BCC])/g, "$1");
  // 6. Deduplicate pulli
  t = t.replace(/\u0BCD+/g, "\u0BCD");
  // 7. Fix split conjuncts with rogue spaces
  t = t.replace(/ற்\s+றை/g, "ற்றை")
       .replace(/ற்\s+ற/g, "ற்ற")
       .replace(/ந்\s+தை/g, "ந்தை")
       .replace(/ந்\s+த/g, "ந்த")
       .replace(/ன்\s+ன/g, "ன்ன")
       .replace(/ன்\s+ற/g, "ன்ற")
       .replace(/ட்\s+ட/g, "ட்ட")
       .replace(/ப்\s+ப/g, "ப்ப")
       .replace(/த்\s+த/g, "த்த")
       .replace(/க்\s+க/g, "க்க")
       .replace(/ச்\s+ச/g, "ச்ச")
       .replace(/ச்\s+சி/g, "ச்சி")
       .replace(/ச்\s+சொ\s*ன்ன/g, "ச்சொன்ன")
       .replace(/சொ\s+ன்ன/g, "சொன்ன")
       .replace(/ள்\s+ள/g, "ள்ள")
       .replace(/ல்\s+ல/g, "ல்ல")
       .replace(/ண்\s+ட/g, "ண்ட")
       .replace(/ங்\s+க/g, "ங்க")
       .replace(/பின்ன\s+ர்/g, "பின்னர்")
       .replace(/இன\s+த்தின்/g, "இனத்தின்")
       .replace(/என\s+ப்படுகிறது/g, "எனப்படுகிறது")
       .replace(/உடை\s+டைய/g, "உடைய");
  // 8. Clean chapter headings at start like 'அலகு 1 ', 'அலகு1 '
  t = t.replace(/^அலகு\s*\d+\s*/, "");
  // 9. Strip boilerplate question prefixes
  t = t.replace(/^(?:பாடப்பகுதியின்\s*(?:வரலாற்றுத்\s*)?தகவல்களின்படி,?\s*)?(?:கீழ்க்கண்ட|கீழ்கண்ட|பின்வரும்|கீழ்க்காணும்)\s*(?:கூற்றுகளு(?:ள்|ளில்)|கருத்துக்களில்)?\s*(?:எது|எவை)\s*(?:பாடப்புத்தகத்?\s*தகவல்களின்படி\s*)?(?:சரியான(?:து|தாகும்| விடையாகும்| கூற்று)|தவறானது)\??\s*/i, "");
  t = t.replace(/^பாடப்பகுதியின்\s*(?:வரலாற்றுத்\s*)?தகவல்களின்படி,?\s*(?:பின்வரும்|கீழ்க்கண்ட)?\s*கூற்றுகளில்\s*(?:எது|எவை)\s*சரியானது\??\s*['"]?/i, "");
  t = t.replace(/^(?:தகவல்\s*பகுதி|தகவலின்படி)\s*:\s*['"]?/i, "");
  t = t.replace(/^பாடநூல்\s*விளக்கம்\s*:\s*['"]?/i, "");
  t = t.replace(/[ \t]+/g, " ").trim();
  // Strip surrounding quotes
  if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

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

  const subject = cleanTamilForPdf(lesson?.subject || "சமூக அறிவியல் (Social Science)");
  const classNum = lesson?.class_num ? `வகுப்பு ${lesson.class_num}` : "எட்டாம் வகுப்பு (Class 8)";
  const term = cleanTamilForPdf(lesson?.term || "பருவம் 1 (Term 1)");
  const headingTitle = cleanTamilForPdf(title || lesson?.title || "அலகு 1: ஐரோப்பியர்களின் வருகை");
  
  const isType2 = quizType === "type2";
  const sectionTitle = isType2
    ? "பகுதி II: உயர் சிந்தனை & சிறப்பு மீட்புப் பயிற்சி வினாக்கள் (Type 2 Remedial Quiz)"
    : "பகுதி I: மாதிரித் தேர்வு & பயிற்சி வினாக்கள் (Type 1 Standard Practice)";

  const questionsHtml = questions.map((q, idx) => {
    const qNum = idx + 1;
    const rawOpts = q.options || ["", "", "", ""];
    const optA = cleanTamilForPdf(rawOpts[0] || "");
    const optB = cleanTamilForPdf(rawOpts[1] || "");
    const optC = cleanTamilForPdf(rawOpts[2] || "");
    const optD = cleanTamilForPdf(rawOpts[3] || "");
    const cleanOpts = [optA, optB, optC, optD];

    const cleanQ = cleanTamilForPdf(q.question || "");
    const cleanExp = cleanTamilForPdf(q.explanation || "");

    let ansLetter = "A";
    let ansText = optA;
    if (typeof q.answer === "string") {
      const trimmed = q.answer.trim();
      if (["A", "B", "C", "D"].includes(trimmed.toUpperCase())) {
        ansLetter = trimmed.toUpperCase();
        const mapIdx = { A: 0, B: 1, C: 2, D: 3 };
        ansText = cleanOpts[mapIdx[ansLetter]] || "";
      } else {
        const foundIdx = cleanOpts.findIndex(o => o.trim() === cleanTamilForPdf(trimmed));
        if (foundIdx !== -1) {
          ansLetter = String.fromCharCode(65 + foundIdx);
          ansText = cleanOpts[foundIdx];
        } else {
          ansText = cleanTamilForPdf(trimmed);
        }
      }
    } else if (typeof q.answer_index === "number" && q.answer_index >= 0 && q.answer_index < 4) {
      ansLetter = String.fromCharCode(65 + q.answer_index);
      ansText = cleanOpts[q.answer_index] || "";
    }

    return `
      <div class="q-block">
        <div class="q-title"><strong>${qNum}.</strong> ${cleanQ}</div>
        <div class="q-options-row">
          <div class="q-opt"><strong>A.</strong> ${optA}</div>
          <div class="q-opt"><strong>B.</strong> ${optB}</div>
        </div>
        <div class="q-options-row">
          <div class="q-opt"><strong>C.</strong> ${optC}</div>
          <div class="q-opt"><strong>D.</strong> ${optD}</div>
        </div>
        <div class="q-ans"><strong>விடை:</strong> <b>${ansLetter}. ${ansText}</b></div>
        ${cleanExp ? `<div class="q-exp"><em>(விளக்கம்: ${cleanExp})</em></div>` : ""}
      </div>
    `;
  }).join("");

  const html = `
    <!DOCTYPE html>
    <html lang="ta">
    <head>
      <meta charset="utf-8" />
      <title>${headingTitle} - TET Paper 2 PDF</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Mukta+Malar:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Mukta+Malar:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;600;700;800&display=swap');
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
          font-family: 'Noto Sans Tamil', 'Mukta Malar', 'Nirmala UI', 'Latha', 'Segoe UI', Tahoma, Arial, sans-serif;
          margin: 0;
          padding: 16px;
          color: #000;
          background: #fff;
          font-size: 13px;
          line-height: 1.55;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
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
