import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Layers, 
  Eye, 
  Download, 
  CheckCircle2, 
  FileText, 
  X,
  Languages
} from "lucide-react";
import { fetchApi } from "../api";
import { translations } from "../translations";

export default function MaterialsPage({ lang = "en" }) {
  const [selectedClass, setSelectedClass] = useState(10);
  const [selectedSubject, setSelectedSubject] = useState("Tamil");
  const [selectedMedium, setSelectedMedium] = useState("Tamil Medium");
  const [selectedTerm, setSelectedTerm] = useState("Term-1");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePdfModal, setActivePdfModal] = useState(null);

  const t = translations[lang] || translations.en;

  const classes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  
  const classColorMap = {
    1: { active: "bg-[#e52b50] text-white border-[#e52b50]", inactive: "bg-[#e52b50]/10 text-[#e52b50] border-[#e52b50]/30 hover:bg-[#e52b50]/20" },
    2: { active: "bg-[#0066ff] text-white border-[#0066ff]", inactive: "bg-[#0066ff]/10 text-[#0066ff] border-[#0066ff]/30 hover:bg-[#0066ff]/20" },
    3: { active: "bg-[#00b027] text-white border-[#00b027]", inactive: "bg-[#00b027]/10 text-[#00b027] border-[#00b027]/30 hover:bg-[#00b027]/20" },
    4: { active: "bg-[#7d00e5] text-white border-[#7d00e5]", inactive: "bg-[#7d00e5]/10 text-[#7d00e5] border-[#7d00e5]/30 hover:bg-[#7d00e5]/20" },
    5: { active: "bg-[#ff7a00] text-white border-[#ff7a00]", inactive: "bg-[#ff7a00]/10 text-[#ff7a00] border-[#ff7a00]/30 hover:bg-[#ff7a00]/20" },
    6: { active: "bg-[#00a896] text-white border-[#00a896]", inactive: "bg-[#00a896]/10 text-[#00a896] border-[#00a896]/30 hover:bg-[#00a896]/20" },
    7: { active: "bg-[#ff0055] text-white border-[#ff0055]", inactive: "bg-[#ff0055]/10 text-[#ff0055] border-[#ff0055]/30 hover:bg-[#ff0055]/20" },
    8: { active: "bg-[#0033cc] text-white border-[#0033cc]", inactive: "bg-[#0033cc]/10 text-[#0033cc] border-[#0033cc]/30 hover:bg-[#0033cc]/20" },
    9: { active: "bg-[#5c00e6] text-white border-[#5c00e6]", inactive: "bg-[#5c00e6]/10 text-[#5c00e6] border-[#5c00e6]/30 hover:bg-[#5c00e6]/20" },
    10: { active: "bg-[#8d4b00] text-white border-[#8d4b00]", inactive: "bg-[#8d4b00]/10 text-[#8d4b00] border-[#8d4b00]/30 hover:bg-[#8d4b00]/20" },
    11: { active: "bg-[#0066ff] text-white border-[#0066ff]", inactive: "bg-[#0066ff]/10 text-[#0066ff] border-[#0066ff]/30 hover:bg-[#0066ff]/20" },
    12: { active: "bg-[#ff2a00] text-white border-[#ff2a00]", inactive: "bg-[#ff2a00]/10 text-[#ff2a00] border-[#ff2a00]/30 hover:bg-[#ff2a00]/20" },
  };
  
  const baseSubjects = ["Tamil", "English", "Mathematics", "Science", "Social Science"];
  const higherSubjects = [
    "Physics", "Chemistry", "Botany", "Zoology", 
    "Computer Science", "Commerce", "Economics", "Accountancy"
  ];
  
  const subjects = selectedClass <= 10 
    ? baseSubjects 
    : ["Tamil", "English", ...higherSubjects];

  const terms = ["Term-1", "Term-2", "Term-3"];

  useEffect(() => {
    if (selectedSubject === "Tamil") {
      setSelectedMedium("Tamil Medium");
    } else if (selectedSubject === "English") {
      setSelectedMedium("English Medium");
    }
  }, [selectedSubject]);

  useEffect(() => {
    loadMaterials();
  }, [selectedClass, selectedSubject, selectedMedium, selectedTerm]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const data = await fetchApi(
        `/materials?class_num=${selectedClass}&subject=${encodeURIComponent(selectedSubject)}&medium=${encodeURIComponent(selectedMedium)}&term=${encodeURIComponent(selectedTerm)}`
      );
      setMaterials(data);
    } catch (err) {
      console.error("Materials load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (mat) => {
    const pdfUrl = mat.pdf_url.startsWith("/") ? `http://localhost:8000${mat.pdf_url}` : mat.pdf_url;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = mat.pdf_filename || `${mat.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fade-in text-[#071c38]">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-center space-x-2 text-[#0055ff] mb-1.5 font-bold text-xs uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Curriculum Material Repository</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#093c85] tracking-tight">
          {t.materials}
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl font-medium">
          Filter by Grade (1-12), Subject, Medium (Tamil / English), and Term across the 4-grid interface to preview or download official study resources.
        </p>
      </div>

      {/* ================= 4 GRID LAYOUT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: GRIDS 1, 2, 3 */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* GRID 1: CLASS SELECTION (1 to 12) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-extrabold text-[#093c85] uppercase tracking-wider flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#093c85] text-white flex items-center justify-center text-[10px]">1</span>
                <span>{t.matStep1Title}</span>
              </span>
              <span className="text-[11px] text-slate-500 font-bold">{t.allClasses}</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
              {classes.map((c) => {
                const isSelected = selectedClass === c;
                const styleMap = classColorMap[c] || classColorMap[1];
                return (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedClass(c);
                      if (c > 10 && !higherSubjects.includes(selectedSubject) && selectedSubject !== "Tamil" && selectedSubject !== "English") {
                        setSelectedSubject("Physics");
                      }
                    }}
                    className={`py-3 px-2 rounded-2xl border text-center font-bold transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? `${styleMap.active} shadow-md scale-105 ring-2 ring-offset-1`
                        : `${styleMap.inactive}`
                    }`}
                  >
                    <span className="block text-[10px] opacity-90 font-bold uppercase tracking-wider">வகுப்பு</span>
                    <span className="text-base font-black">{c}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GRID 2: CHOOSE SUBJECT & MEDIUM */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#093c85] uppercase tracking-wider flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#093c85] text-white flex items-center justify-center text-[10px]">2</span>
                <span>{t.matStep2Title}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {subjects.map((s) => {
                const isSelected = selectedSubject === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedSubject(s)}
                    className={`p-3 rounded-2xl border text-left font-bold text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-[#0055ff] text-white border-[#0055ff] shadow-sm"
                        : "bg-slate-50 text-[#093c85] border-slate-200 hover:bg-blue-50/60"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <BookOpen className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-[#0055ff]"}`} />
                      <span className="truncate">{s}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Language Medium Selection - Hidden for Tamil and English */}
            {selectedSubject !== "Tamil" && selectedSubject !== "English" && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#093c85]">
                  <Languages className="w-4 h-4 text-[#0055ff]" />
                  <span>Medium:</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedMedium("Tamil Medium")}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      selectedMedium === "Tamil Medium"
                        ? "bg-[#093c85] text-white border-[#093c85] shadow-xs"
                        : "bg-slate-50 text-[#093c85] border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {t.mediumTamil}
                  </button>

                  <button
                    onClick={() => setSelectedMedium("English Medium")}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      selectedMedium === "English Medium"
                        ? "bg-[#093c85] text-white border-[#093c85] shadow-xs"
                        : "bg-slate-50 text-[#093c85] border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {t.mediumEnglish}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* GRID 3: SELECT TERM */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-extrabold text-[#093c85] uppercase tracking-wider flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#093c85] text-white flex items-center justify-center text-[10px]">3</span>
                <span>{t.matStep3Title}</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {terms.map((termKey, idx) => {
                const isSelected = selectedTerm === termKey;
                const displayTerm = lang === "ta" ? termKey.replace("Term-", "பருவம்-") : termKey;
                
                // Color mapping matching image 2 (Term 1 = Blue, Term 2 = Light Blue, Term 3 = Green)
                const termColorClasses = [
                  isSelected ? "bg-[#0040ff] text-white border-[#0040ff]" : "bg-blue-50 text-[#0040ff] border-blue-200 hover:bg-blue-100",
                  isSelected ? "bg-[#0070e0] text-white border-[#0070e0]" : "bg-sky-50 text-[#0070e0] border-sky-200 hover:bg-sky-100",
                  isSelected ? "bg-[#009933] text-white border-[#009933]" : "bg-emerald-50 text-[#009933] border-emerald-200 hover:bg-emerald-100",
                ];

                return (
                  <button
                    key={termKey}
                    onClick={() => setSelectedTerm(termKey)}
                    className={`py-3 px-3 rounded-2xl border text-center font-black text-xs transition-all shadow-xs cursor-pointer ${
                      termColorClasses[idx % 3]
                    }`}
                  >
                    <span>{displayTerm}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: GRID 4 (SELECTED DETAILS & VIEW/DOWNLOAD PDF OPTIONS) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-xs sticky top-24 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <span className="text-xs font-extrabold text-[#093c85] uppercase tracking-wider flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#093c85] text-white flex items-center justify-center text-[10px]">4</span>
                  <span>{t.matStep4Title}</span>
                </span>
                <h3 className="text-base font-extrabold text-[#093c85] mt-1">
                  Class {selectedClass} • {selectedSubject}
                </h3>
                <span className="text-xs text-slate-500 font-bold">
                  {selectedMedium} • {selectedTerm}
                </span>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-blue-50 border border-[#0055ff]/30 text-[#0055ff] text-xs font-bold">
                {materials.length} PDF Guide(s)
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-[#0055ff] text-xs font-semibold">
                Loading study materials...
              </div>
            ) : materials.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-300 rounded-2xl p-5">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-[#093c85]">{t.noMaterialsFound}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Class {selectedClass} {selectedSubject} ({selectedMedium}) {selectedTerm} resources.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#0055ff]/40 transition-all space-y-3"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-blue-100 text-[#0055ff] border border-[#0055ff]/30 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#093c85] leading-snug truncate">{mat.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium line-clamp-2">{mat.description}</p>
                        <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                          Medium: {mat.medium} • Size: {mat.file_size || "3.8 MB"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => setActivePdfModal(mat)}
                        className="flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-xl bg-white hover:bg-blue-50 text-[#0055ff] text-xs font-bold border border-[#0055ff]/40 shadow-xs transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#0055ff]" />
                        <span>{t.viewPdfBtn}</span>
                      </button>

                      <button
                        onClick={() => handleDownload(mat)}
                        className="flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t.downloadPdfBtn}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* PDF VIEWER MODAL */}
      {activePdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl h-[85vh] bg-white border border-sky-100 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-[#0284C7]" />
                <div>
                  <h3 className="text-xs font-bold text-[#1E3A8A]">{activePdfModal.title}</h3>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Class {selectedClass} • {selectedSubject} • {selectedMedium} • {selectedTerm}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(activePdfModal)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.downloadPdfBtn}</span>
                </button>

                <button
                  onClick={() => setActivePdfModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100">
              <iframe
                src={activePdfModal.pdf_url.startsWith("/") ? `http://localhost:8000${activePdfModal.pdf_url}` : activePdfModal.pdf_url}
                className="w-full h-full border-none"
                title="PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
