/**
 * Professional TN TET Paper 2 PDF Quiz Exporter
 * Generates an authentic, beautifully styled printable document matching the official
 * TN TET Paper 2 Question Paper format with Tamil Unicode font rendering,
 * perfect grid alignment for questions, options, answers, and page-break stability.
 */

function cleanTamilForPdf(str) {
  if (!str || typeof str !== "string") return "";
  let t = str.normalize("NFC");

  // 1. Strip Private Use Area (U+E000-U+F8FF), surrogates, and replacement characters (causes tofu 􀄠)
  t = t.replace(/[\uE000-\uF8FF\uD800-\uDFFF\uFFFD\uFEFF]/g, "");

  // 2. Strip non-printable control characters
  t = t.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");

  // 3. Strip rogue InDesign filenames (*.indd) and adjacent page numbers
  t = t.replace(/[\w\-\.]+(?:\s+[\w\-\.]+)*\.indd(?:\s*\d+)?/gi, "");

  // 4. Strip timestamps (e.g. 1/3/2025 10:54:44 AM)
  t = t.replace(/\d{1,2}\/\d{1,2}\/\d{2,4}\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?/g, "");

  // 5. Remove OCR artifact 'F' inside Tamil words
  t = t.replace(/([\u0B80-\u0BFF])F([\u0B80-\u0BFF])/g, "$1$2");

  // 6. Deduplicate combining vowel signs (கொொ -> கொ, நோோ -> நோ)
  t = t.replace(/(\u0BCA|\u0BCB|\u0BCC)+/g, "$1");
  t = t.replace(/(\u0BBE|\u0BBF|\u0BC0|\u0BC1|\u0BC2|\u0BC6|\u0BC7|\u0BC8)+/g, "$1");

  // 7. Fix spaces before pullis or vowel signs (e.g. 'சொ ன்னார்' -> 'சொன்னார்')
  t = t.replace(/\s+([\u0BCD\u0BBE-\u0BCC])/g, "$1");

  // 8. Deduplicate pulli
  t = t.replace(/\u0BCD+/g, "\u0BCD");

  // 9. Fix split conjuncts with rogue spaces
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

  // 10. Clean running class headers like '6 ஆம் வகுப்பு கணக்கு'
  t = t.replace(/\d+\s*ஆம்\s*வகுப்பு(?:\s+[\u0B80-\u0BFF\w]+)?/g, "");

  // 11. Clean chapter headings at start like 'அலகு 1 ', 'அலகு1 '
  t = t.replace(/^அலகு\s*\d+\s*[-:]?\s*/i, "");

  // 12. Strip repetitive boilerplate question prefixes
  t = t.replace(/^(?:பாடப்பகுதியின்\s*(?:வரலாற்றுத்\s*)?தகவல்களின்படி,?\s*)?(?:கீழ்க்கண்ட|கீழ்கண்ட|பின்வரும்|கீழ்க்காணும்)\s*(?:கூற்றுகளு(?:ள்|ளில்)|கருத்துக்களில்)?\s*(?:எது|எவை)\s*(?:பாடப்புத்தகத்?\s*தகவல்களின்படி\s*)?(?:சரியான(?:து|தாகும்| விடையாகும்| கூற்று)|தவறானது)\??\s*/i, "");
  t = t.replace(/^பாடப்பகுதியின்\s*(?:வரலாற்றுத்\s*)?தகவல்களின்படி,?\s*(?:பின்வரும்|கீழ்க்கண்ட)?\s*கூற்றுகளில்\s*(?:எது|எவை)\s*சரியானது\??\s*['"]?/i, "");
  t = t.replace(/^(?:தகவல்\s*பகுதி|தகவலின்படி)\s*:\s*['"]?/i, "");
  t = t.replace(/^பாடநூல்\s*விளக்கம்\s*:\s*['"]?/i, "");
  t = t.replace(/^Statement Context\s*:\s*['"]?/i, "");

  // 13. Strip bullet characters and geometric shapes at the start
  t = t.replace(/^[●■◆▲►★*•▪▫]\s*/, "");

  t = t.replace(/[ \t]+/g, " ").trim();

  // 14. Strip surrounding quotes
  if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

/**
 * Cleans the question stem specifically for PDF export:
 * Removes duplicate question numbers, formats statement lines cleanly with line-breaks.
 */
function cleanQuestionStemForPdf(str, lessonTitle = "") {
  if (!str || typeof str !== "string") return "";
  let t = cleanTamilForPdf(str);

  if (lessonTitle) {
    const esc = lessonTitle.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    t = t.replace(new RegExp(`^['"]?${esc}['"]?\\s*[-:]?\\s*`, "i"), "");
  }

  // Strip question number prefixes like: '1.', '1)', '(1)', 'Q1.', 'வினா 1:', 'கேள்வி 1.'
  t = t.replace(/^\s*(?:வினா\s*(?:எண்)?\s*\d+\s*[\.\:\-\)]?|கேள்வி\s*\d+\s*[\.\:\-\)]?|Question\s*\d+\s*[\.\:\-\)]?|Q\.?\s*\d+\s*[\.\:\-\)]?|\(?\d+\)[\.\:\-\s]*|\d+[\.\)\:\-]\s*)/i, "");

  // Format merged statement lines (e.g. 'கூற்று (A):', 'காரணம் (R):', 'I.', 'II.') onto clean newlines
  t = t.replace(/\s+(காரணம்\s*(?:\([A-Za-z0-9]+\)|[A-Za-z0-9]+)?\s*[:\-])/g, "\n$1");
  t = t.replace(/\s+([I|V|X|i|v|x]+\.\s+)/g, "\n$1");
  t = t.replace(/\s+(கீழ்க்கண்டவற்றுள்\s+)/g, "\n$1");
  t = t.replace(/\s+(இவற்றுள்\s+)/g, "\n$1");
  t = t.replace(/\s+(மேற்கண்டவற்றுள்\s+)/g, "\n$1");

  return t.trim();
}

/**
 * Strips option prefixes like: (A), [A], A., A), a., a), (1), 1., 1)
 * so that option letters don't appear duplicated or misaligned.
 */
function cleanOptionText(str) {
  if (!str || typeof str !== "string") return "";
  let t = cleanTamilForPdf(str);
  t = t.replace(/^\s*(?:\([A-Da-d1-4]\)|\[[A-Da-d1-4]\]|[A-Da-d1-4][\.\)\-\:]\s*|\b[A-Da-d1-4]\s*[-–—]\s*)\s*/, "");
  return t.trim();
}

export function downloadQuizAsPdf({ title, subtitle, lesson, quizType, questions }) {
  if (!questions || questions.length === 0) {
    alert("No questions available to download.");
    return;
  }

  const printWindow = window.open("", "_blank", "width=960,height=850");
  if (!printWindow) {
    alert("Please allow popups in your browser to view and download the PDF.");
    return;
  }

  const subject = cleanTamilForPdf(lesson?.subject || "சமூக அறிவியல் (Social Science)");
  const classNum = lesson?.class_num ? `வகுப்பு ${lesson.class_num}` : "எட்டாம் வகுப்பு (Class 8)";
  const term = cleanTamilForPdf(lesson?.term || "பருவம் 1 (Term 1)");
  const headingTitle = cleanTamilForPdf(title || lesson?.title || "அலகு 1: ஐரோப்பியர்களின் வருகை");
  
  let sectionTitle = "பகுதி I: மாதிரித் தேர்வு & முதன்மைப் பயிற்சி வினாக்கள் (Type 1 Standard Practice)";
  if (quizType === "type2") {
    sectionTitle = "பகுதி II: உயர் சிந்தனை & சிறப்பு மீட்புப் பயிற்சி வினாக்கள் (Type 2 Remedial Quiz)";
  } else if (quizType === "daily_practice") {
    sectionTitle = "தினசரி மாதிரிப் பயிற்சித் தேர்வு வினாக்கள் (Daily Practice Mock Test)";
  }

  const questionsHtml = questions.map((q, idx) => {
    const qNum = idx + 1;
    const rawOpts = Array.isArray(q.options) && q.options.length > 0 ? q.options : ["", "", "", ""];
    const optA = cleanOptionText(rawOpts[0] || "");
    const optB = cleanOptionText(rawOpts[1] || "");
    const optC = cleanOptionText(rawOpts[2] || "");
    const optD = cleanOptionText(rawOpts[3] || "");
    const cleanOpts = [optA, optB, optC, optD];

    const cleanQ = cleanQuestionStemForPdf(q.question || "", headingTitle);
    const cleanExp = cleanTamilForPdf(q.explanation || "");

    // Resolve answer index (0..3)
    let ansIdx = -1;
    if (typeof q.answer_index === "number" && q.answer_index >= 0 && q.answer_index < 4) {
      ansIdx = q.answer_index;
    } else if (typeof q.answer === "number" && q.answer >= 0 && q.answer < 4) {
      ansIdx = q.answer;
    } else if (typeof q.answer === "string") {
      const trimmed = q.answer.trim().toUpperCase();
      if (["A", "B", "C", "D"].includes(trimmed)) {
        ansIdx = { A: 0, B: 1, C: 2, D: 3 }[trimmed];
      } else if (["0", "1", "2", "3"].includes(trimmed)) {
        ansIdx = parseInt(trimmed, 10);
      } else {
        const matchIdx = cleanOpts.findIndex(o => o.trim() === cleanOptionText(q.answer));
        if (matchIdx !== -1) {
          ansIdx = matchIdx;
        } else {
          const rawMatchIdx = rawOpts.findIndex(o => o && o.trim() === q.answer.trim());
          if (rawMatchIdx !== -1) ansIdx = rawMatchIdx;
        }
      }
    }

    const ansLetter = ansIdx >= 0 && ansIdx < 4 ? String.fromCharCode(65 + ansIdx) : "A";
    const ansText = ansIdx >= 0 && ansIdx < 4 ? cleanOpts[ansIdx] : cleanOptionText(q.answer || optA);

    // Adaptive option layout:
    // If any option exceeds 34 characters or contains line breaks, use 1-column layout
    // Otherwise use clean 2-column layout (A/B on line 1, C/D on line 2)
    const isLong = cleanOpts.some(o => o.length > 34 || o.includes("\n"));
    const optionsClass = isLong ? "q-opts-1col" : "q-opts-2col";

    return `
      <div class="q-block">
        <div class="q-header">
          <span class="q-num">${qNum}.</span>
          <div class="q-stem">${cleanQ}</div>
        </div>
        <div class="${optionsClass}">
          <div class="q-opt">
            <span class="q-opt-key">(A)</span>
            <span class="q-opt-val">${optA}</span>
          </div>
          <div class="q-opt">
            <span class="q-opt-key">(B)</span>
            <span class="q-opt-val">${optB}</span>
          </div>
          <div class="q-opt">
            <span class="q-opt-key">(C)</span>
            <span class="q-opt-val">${optC}</span>
          </div>
          <div class="q-opt">
            <span class="q-opt-key">(D)</span>
            <span class="q-opt-val">${optD}</span>
          </div>
        </div>
        <div class="q-answer-box">
          <div class="q-ans-line">
            <span class="q-ans-label">விடை:</span>
            <span class="q-ans-val">(${ansLetter}) ${ansText}</span>
          </div>
          ${cleanExp ? `<div class="q-exp-line"><span class="q-exp-label">விளக்கம்:</span> ${cleanExp}</div>` : ""}
        </div>
      </div>
    `;
  }).join("");

  const estimatedTime = Math.max(15, Math.round(questions.length * 0.9));

  const html = `
    <!DOCTYPE html>
    <html lang="ta">
    <head>
      <meta charset="utf-8" />
      <title>${headingTitle} - TNTET Paper 2 Quiz</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Mukta+Malar:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Mukta+Malar:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;600;700;800&display=swap');
        
        @page {
          size: A4 portrait;
          margin: 12mm 14mm 14mm 14mm;
        }

        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        body {
          font-family: 'Noto Sans Tamil', 'Mukta Malar', 'Nirmala UI', 'Latha', 'Segoe UI', Tahoma, Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #0f172a;
          background: #f8fafc;
          font-size: 13px;
          line-height: 1.55;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
        }

        .exam-document {
          max-width: 860px;
          margin: 24px auto 40px auto;
          background: #ffffff;
          padding: 32px 36px;
          border-radius: 6px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }

        .exam-header {
          border: 2px solid #0f172a;
          border-radius: 4px;
          padding: 14px 18px;
          margin-bottom: 14px;
          text-align: center;
          page-break-after: avoid;
          break-after: avoid;
          background: #fff;
        }

        .header-main-title {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 0.8px;
          color: #0f172a;
          margin-bottom: 3px;
        }

        .header-eng-title {
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 1.2px;
          color: #334155;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .header-meta-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px 12px;
          border-top: 1px solid #0f172a;
          padding-top: 8px;
          text-align: left;
        }

        .meta-cell {
          font-size: 11.5px;
          color: #1e293b;
          line-height: 1.4;
        }

        .meta-cell.full-width {
          grid-column: 1 / -1;
          font-size: 12px;
        }

        .meta-cell strong {
          font-weight: 800;
          color: #0f172a;
        }

        .section-banner {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-left: 4px solid #1e3a8a;
          border-radius: 3px;
          padding: 8px 12px;
          margin-bottom: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          page-break-after: avoid;
          break-after: avoid;
        }

        .section-title {
          font-size: 12.5px;
          font-weight: 800;
          color: #1e3a8a;
        }

        .section-meta {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
        }

        .q-block {
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px dashed #cbd5e1;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        .q-block:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .q-header {
          display: flex;
          align-items: flex-start;
          margin-bottom: 5px;
          text-align: left;
        }

        .q-num {
          flex-shrink: 0;
          width: 32px;
          font-weight: 800;
          font-size: 13px;
          color: #0f172a;
          text-align: left;
          line-height: 1.55;
        }

        .q-stem {
          flex: 1;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.55;
          color: #0f172a;
          text-align: left;
          white-space: pre-line;
          word-break: break-word;
          overflow-wrap: break-word;
        }

        .q-opts-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: 20px;
          row-gap: 5px;
          margin-left: 32px;
          margin-top: 4px;
          margin-bottom: 6px;
        }

        .q-opts-1col {
          display: grid;
          grid-template-columns: 1fr;
          row-gap: 5px;
          margin-left: 32px;
          margin-top: 4px;
          margin-bottom: 6px;
        }

        .q-opt {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 12px;
          line-height: 1.45;
        }

        .q-opt-key {
          flex-shrink: 0;
          min-width: 22px;
          font-weight: 700;
          color: #1e3a8a;
          text-align: left;
        }

        .q-opt-val {
          flex: 1;
          color: #1e293b;
          text-align: left;
          word-break: break-word;
          overflow-wrap: break-word;
        }

        .q-answer-box {
          margin-left: 32px;
          margin-top: 5px;
          padding: 4px 10px;
          background: #f8fafc;
          border-left: 3px solid #0284c7;
          border-radius: 2px;
        }

        .q-ans-line {
          font-size: 11.5px;
          color: #0f172a;
          line-height: 1.45;
        }

        .q-ans-label {
          font-weight: 800;
          color: #0369a1;
          margin-right: 4px;
        }

        .q-ans-val {
          font-weight: 700;
          color: #0f172a;
        }

        .q-exp-line {
          font-size: 11px;
          color: #475569;
          margin-top: 2px;
          line-height: 1.4;
        }

        .q-exp-label {
          font-weight: 700;
          color: #64748b;
          margin-right: 4px;
        }

        .exam-footer {
          margin-top: 24px;
          padding-top: 10px;
          border-top: 2px solid #0f172a;
          display: flex;
          justify-content: space-between;
          font-size: 10.5px;
          font-weight: 700;
          color: #475569;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .no-print-toolbar {
          position: fixed;
          top: 14px;
          right: 20px;
          background: #092c85;
          color: white;
          padding: 8px 16px;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
          display: flex;
          gap: 12px;
          align-items: center;
          z-index: 9999;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .no-print-toolbar .toolbar-title {
          font-size: 12.5px;
          font-weight: 700;
        }

        .no-print-toolbar button {
          background: #0055ff;
          color: white;
          border: none;
          padding: 7px 14px;
          border-radius: 8px;
          font-weight: 800;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.15s;
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
          body {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .exam-document {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print-toolbar {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print-toolbar">
        <span class="toolbar-title">📄 TN TET Paper 2 PDF Quiz (${questions.length} வினாக்கள்)</span>
        <button onclick="window.print()">📥 Save as PDF / Print</button>
        <button class="close-btn" onclick="window.close()">✕ Close</button>
      </div>

      <div class="exam-document">
        <div class="exam-header">
          <div class="header-main-title">தமிழ்நாடு ஆசிரியர் தகுதித் தேர்வு (TNTET) - தாள் II</div>
          <div class="header-eng-title">TAMIL NADU TEACHERS ELIGIBILITY TEST • PAPER - II</div>
          <div class="header-meta-grid">
            <div class="meta-cell"><strong>வகுப்பு:</strong> ${classNum}</div>
            <div class="meta-cell"><strong>பாடம்:</strong> ${subject}</div>
            <div class="meta-cell"><strong>பருவம்:</strong> ${term}</div>
            <div class="meta-cell full-width"><strong>பாடப்பகுதி:</strong> ${headingTitle}</div>
            <div class="meta-cell"><strong>மொத்த வினாக்கள்:</strong> ${questions.length}</div>
            <div class="meta-cell"><strong>தேர்வு நேரம்:</strong> ${estimatedTime} நிமிடம்</div>
            <div class="meta-cell"><strong>மதிப்பெண்கள்:</strong> ${questions.length}</div>
          </div>
        </div>

        <div class="section-banner">
          <span class="section-title">${sectionTitle}</span>
          <span class="section-meta">வினா எண்: 1 - ${questions.length}</span>
        </div>

        <div class="questions-list">
          ${questionsHtml}
        </div>

        <div class="exam-footer">
          <div>K. SELVAKUMAR - TRICHY • TN Teacher Platform (tnteachers.in)</div>
          <div>Tamil Nadu Teachers Eligibility Test (TET Paper 2) Examination Model</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function() {
              setTimeout(function() {
                window.print();
              }, 250);
            });
          } else {
            setTimeout(function() {
              window.print();
            }, 450);
          }
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
