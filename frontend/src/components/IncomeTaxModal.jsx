import React, { useState, useEffect } from "react";
import { 
  Calculator, 
  Download, 
  X, 
  CheckCircle2, 
  FileText, 
  User, 
  Building, 
  IndianRupee, 
  ShieldCheck, 
  AlertCircle,
  Edit3,
  Printer,
  ChevronRight,
  Info
} from "lucide-react";
import { fetchApi } from "../api";
import { generateIncomeTaxPdf } from "../utils/itPdfExport";

export default function IncomeTaxModal({ isOpen, onClose, user }) {
  if (!isOpen) return null;

  const [activeStep, setActiveStep] = useState("form"); // "form" or "statement"
  const [activeTab, setActiveTab] = useState("personal"); // "personal", "pay", "surrender", "tds"
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [calculationResult, setCalculationResult] = useState(null);

  // Form State initialized with realistic defaults matching TN Teacher Form
  const [formData, setFormData] = useState({
    name: user?.name || "",
    sex: "MALE",
    designation: "S.G. TEACHER",
    pan_number: "",
    tan_number: "",
    phone: user?.phone || "",
    whatsapp_number: user?.phone || "",
    school_type: "Primary",
    school_name: "",
    office_address: "",
    
    // Pay Particulars
    basic_pay: 39600,
    increment_month: 7, // July default
    pp: 0,
    bonus: 3000,
    hra_grade: 4, // Grade 4 default for rural/town
    cca_grade: 0, // Grade 0 default
    spl_transport_allowance: 0,
    
    // Surrender & Career Advancement
    surrender_month: 0,
    pp_surrender: 0,
    selection_grade_pay: 0,
    selection_grade_month: 0,
    selection_grade_arrears: 0,
    
    // Strike
    strike_month: 0,
    strike_days: 0,
    
    // Monthly IT Advance / TDS
    it_advance_monthly: {
      3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 1: 0, 2: 0
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMonthlyTdsChange = (monthNum, value) => {
    const num = Math.max(0, Number(value) || 0);
    setFormData(prev => ({
      ...prev,
      it_advance_monthly: {
        ...prev.it_advance_monthly,
        [monthNum]: num
      }
    }));
  };

  const handleCalculateAndSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.pan_number) {
      setErrorMsg("Please fill in Employee Name and PAN Number.");
      return;
    }
    if (!formData.basic_pay || Number(formData.basic_pay) <= 0) {
      setErrorMsg("Please enter a valid Basic Pay for March 2025.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        ...formData,
        basic_pay: Number(formData.basic_pay),
        increment_month: Number(formData.increment_month) || 0,
        pp: Number(formData.pp) || 0,
        bonus: Number(formData.bonus) || 0,
        hra_grade: Number(formData.hra_grade) || 1,
        cca_grade: Number(formData.cca_grade) || 0,
        spl_transport_allowance: Number(formData.spl_transport_allowance) || 0,
        surrender_month: Number(formData.surrender_month) || 0,
        pp_surrender: Number(formData.pp_surrender) || 0,
        selection_grade_pay: Number(formData.selection_grade_pay) || 0,
        selection_grade_month: Number(formData.selection_grade_month) || 0,
        selection_grade_arrears: Number(formData.selection_grade_arrears) || 0,
        strike_month: Number(formData.strike_month) || 0,
        strike_days: Number(formData.strike_days) || 0
      };

      const res = await fetchApi("/income-tax/calculate-and-save", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (res) {
        setCalculationResult(res);
        setActiveStep("statement");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to calculate Income Tax statement.");
    } finally {
      setLoading(false);
    }
  };

  const fmt = (val) => {
    if (val === undefined || val === null || isNaN(val)) return "0";
    return Math.round(Number(val)).toLocaleString("en-IN");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-6xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  INCOME TAX CALCULATION STATEMENT
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  FY 2025-26 • AY 2026-27
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                New Tax Regime (Section 115BAC) • Sheet 3 (1 PAGE) Format
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {calculationResult && activeStep === "statement" && (
              <button
                onClick={() => generateIncomeTaxPdf(calculationResult)}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: FORM INPUTS */}
          {activeStep === "form" && (
            <form onSubmit={handleCalculateAndSave} className="space-y-5">
              
              {/* Tab Navigation */}
              <div className="flex items-center space-x-1 border-b border-slate-200 pb-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("personal")}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                    activeTab === "personal"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>1. Employee & School</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("pay")}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                    activeTab === "pay"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>2. Basic Pay & Allowances</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("surrender")}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                    activeTab === "surrender"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>3. Surrender, Selection & Strike</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("tds")}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                    activeTab === "tds"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>4. Monthly TDS / IT Advance</span>
                </button>
              </div>

              {/* TAB 1: PERSONAL & SCHOOL */}
              {activeTab === "personal" && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-700">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Employee & School Particulars (Google Form Fields)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Employee Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="e.g. K. Selvakumar"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Sex
                      </label>
                      <select
                        value={formData.sex}
                        onChange={(e) => handleInputChange("sex", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Designation <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.designation}
                        onChange={(e) => handleInputChange("designation", e.target.value)}
                        placeholder="e.g. S.G. TEACHER / B.T. ASST / PG ASST"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        PAN Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={formData.pan_number}
                        onChange={(e) => handleInputChange("pan_number", e.target.value.toUpperCase())}
                        placeholder="e.g. ABCDE1234F"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-black tracking-wider focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        TAN Number (Office / BEO)
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        value={formData.tan_number}
                        onChange={(e) => handleInputChange("tan_number", e.target.value.toUpperCase())}
                        placeholder="e.g. MRIA01163B"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={formData.whatsapp_number}
                        onChange={(e) => handleInputChange("whatsapp_number", e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        School Type
                      </label>
                      <select
                        value={formData.school_type}
                        onChange={(e) => handleInputChange("school_type", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="Primary">Primary School (P.U.P.S)</option>
                        <option value="Middle">Middle School (P.U.M.S)</option>
                        <option value="High">High School (G.H.S)</option>
                        <option value="Higher Secondary">Higher Secondary (G.H.S.S)</option>
                        <option value="BEO Office">BEO Office / Block Resource Centre</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        School / Office Name
                      </label>
                      <input
                        type="text"
                        value={formData.school_name}
                        onChange={(e) => handleInputChange("school_name", e.target.value)}
                        placeholder="e.g. P.U.PRIMARY SCHOOL, SEVALKULAM"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Office / BEO Address & District
                      </label>
                      <input
                        type="text"
                        value={formData.office_address}
                        onChange={(e) => handleInputChange("office_address", e.target.value)}
                        placeholder="e.g. BEO OFFICE, KURUVIKULAM / TENKASI DIST"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("pay")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Next: Basic Pay & Allowances</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: BASIC PAY & ALLOWANCES */}
              {activeTab === "pay" && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-700">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    <span>Basic Pay, Increment Month & Allowances (March 2025 - Feb 2026)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Basic Pay in March 2025 (Rs.) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="10000"
                        step="100"
                        value={formData.basic_pay}
                        onChange={(e) => handleInputChange("basic_pay", e.target.value)}
                        placeholder="e.g. 39600"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Base salary as on 01.03.2025
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Annual Increment Month
                      </label>
                      <select
                        value={formData.increment_month}
                        onChange={(e) => handleInputChange("increment_month", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                      >
                        <option value="0">None / No Increment this year</option>
                        <option value="1">January (Month 1)</option>
                        <option value="4">April (Month 4)</option>
                        <option value="7">July (Month 7)</option>
                        <option value="10">October (Month 10)</option>
                      </select>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        3% rounded to nearest hundred will be added from this month
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Personal Pay (PP) per Month (Rs.)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={formData.pp}
                        onChange={(e) => handleInputChange("pp", e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        HRA Grade (House Rent Allowance)
                      </label>
                      <select
                        value={formData.hra_grade}
                        onChange={(e) => handleInputChange("hra_grade", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                      >
                        <option value="1">Grade 1 (Chennai & Special Places)</option>
                        <option value="2">Grade 2 (Madurai, Coimbatore, Trichy, Salem, Tiruppur etc)</option>
                        <option value="3">Grade 3 (Other Municipalities / Taluk HQs)</option>
                        <option value="4">Grade 4 (Town Panchayats)</option>
                        <option value="5">Grade 5 (Village Panchayats / Rural)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        CCA Grade (City Compensatory Allowance)
                      </label>
                      <select
                        value={formData.cca_grade}
                        onChange={(e) => handleInputChange("cca_grade", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                      >
                        <option value="0">Grade 0 (Not Eligible / Rural)</option>
                        <option value="1">Grade 1 (Non-Chennai Municipal Corporations: 260/400/720)</option>
                        <option value="2">Grade 2 (Chennai City: 360/500/800/1200)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pongal Festival Bonus (Rs.)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={formData.bonus}
                        onChange={(e) => handleInputChange("bonus", e.target.value)}
                        placeholder="3000"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        TN Govt default: Rs. 3,000/-
                      </span>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Specially Abled Persons Transport Allowance (Monthly Rs.)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={formData.spl_transport_allowance}
                        onChange={(e) => handleInputChange("spl_transport_allowance", e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Full transport allowance drawn will be eligible for deduction u/s 10(14)
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("personal")}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("surrender")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Next: Surrender & Promotions</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: SURRENDER LEAVE, SELECTION GRADE & STRIKE */}
              {activeTab === "surrender" && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-700">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Surrender Leave, Selection Grade & Strike Deductions</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        15 Days Surrender Leave Month
                      </label>
                      <select
                        value={formData.surrender_month}
                        onChange={(e) => handleInputChange("surrender_month", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                      >
                        <option value="0">None / Not Surrendered</option>
                        <option value="10">October 2025</option>
                        <option value="11">November 2025</option>
                        <option value="12">December 2025</option>
                        <option value="1">January 2026</option>
                      </select>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Automatically calculates 15 days Basic, DA, OA, HRA, CCA
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        PP in Surrender Leave (if any Rs.)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.pp_surrender}
                        onChange={(e) => handleInputChange("pp_surrender", e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Promotion / Selection Grade Month
                      </label>
                      <select
                        value={formData.selection_grade_month}
                        onChange={(e) => handleInputChange("selection_grade_month", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                      >
                        <option value="0">None / No Promotion</option>
                        <option value="3">March 2025</option>
                        <option value="4">April 2025</option>
                        <option value="5">May 2025</option>
                        <option value="6">June 2025</option>
                        <option value="7">July 2025</option>
                        <option value="8">August 2025</option>
                        <option value="9">September 2025</option>
                        <option value="10">October 2025</option>
                        <option value="11">November 2025</option>
                        <option value="12">December 2025</option>
                        <option value="1">January 2026</option>
                        <option value="2">February 2026</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        New Basic Pay after Selection Grade (Rs.)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.selection_grade_pay}
                        onChange={(e) => handleInputChange("selection_grade_pay", e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Selection Grade / Promotion Arrears (Rs.)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.selection_grade_arrears}
                        onChange={(e) => handleInputChange("selection_grade_arrears", e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Strike / Non-Duty Month (if any)
                      </label>
                      <select
                        value={formData.strike_month}
                        onChange={(e) => handleInputChange("strike_month", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                      >
                        <option value="0">None / No Strike</option>
                        <option value="5">May 2025</option>
                        <option value="6">June 2025</option>
                        <option value="7">July 2025</option>
                        <option value="8">August 2025</option>
                        <option value="9">September 2025</option>
                        <option value="10">October 2025</option>
                        <option value="11">November 2025</option>
                        <option value="12">December 2025</option>
                        <option value="1">January 2026</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Number of Strike Days (Deduction)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="31"
                        value={formData.strike_days}
                        onChange={(e) => handleInputChange("strike_days", e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("pay")}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("tds")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Next: TDS Deductions</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: MONTHLY TDS DEDUCTIONS */}
              {activeTab === "tds" && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Monthly IT Advance / TDS Deducted (March 2025 to January 2026)</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-bold">
                      Optional: Leave 0 if no advance TDS deducted yet
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {[
                      { m: 3, label: "MAR 2025" },
                      { m: 4, label: "APR 2025" },
                      { m: 5, label: "MAY 2025" },
                      { m: 6, label: "JUN 2025" },
                      { m: 7, label: "JUL 2025" },
                      { m: 8, label: "AUG 2025" },
                      { m: 9, label: "SEP 2025" },
                      { m: 10, label: "OCT 2025" },
                      { m: 11, label: "NOV 2025" },
                      { m: 12, label: "DEC 2025" },
                      { m: 1, label: "JAN 2026" },
                      { m: 2, label: "FEB 2026 (Adv)" }
                    ].map(item => (
                      <div key={item.m} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                          {item.label}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={formData.it_advance_monthly[item.m] || ""}
                          onChange={(e) => handleMonthlyTdsChange(item.m, e.target.value)}
                          placeholder="0"
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveTab("surrender")}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      ← Back
                    </button>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Calculating Statement...</span>
                        </>
                      ) : (
                        <>
                          <Calculator className="w-4 h-4" />
                          <span>🚀 CALCULATE & GENERATE STATEMENT</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </form>
          )}

          {/* STEP 2: COMPLETE STATEMENT PREVIEW */}
          {activeStep === "statement" && calculationResult && (
            <div className="space-y-5 animate-fade-in">
              
              {/* TOP ACTION BAR */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Statement Successfully Generated for {calculationResult.employee?.name || calculationResult.employee_info?.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      PAN: {calculationResult.employee?.pan_number || calculationResult.employee_info?.pan_number} • Saved in Database
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveStep("form")}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Particulars</span>
                  </button>

                  <button
                    onClick={() => generateIncomeTaxPdf(calculationResult)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Download Printable PDF (Sheet 3)</span>
                  </button>
                </div>
              </div>

              {/* SUMMARY STATS TILES */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Gross Salary</span>
                  <span className="text-sm sm:text-base font-black text-slate-800">
                    ₹{fmt(calculationResult.gross_salary)}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Std Deduction</span>
                  <span className="text-sm sm:text-base font-black text-emerald-600">
                    -₹{fmt(calculationResult.deductions?.standard_deduction)}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-blue-200 bg-blue-50/50 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-blue-700 block">Taxable Income</span>
                  <span className="text-sm sm:text-base font-black text-blue-900">
                    ₹{fmt(calculationResult.taxable_income)}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Total Tax</span>
                  <span className="text-sm sm:text-base font-black text-slate-700">
                    ₹{fmt(calculationResult.tax_summary?.total_tax_before_rebate)}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">87A Rebate</span>
                  <span className="text-sm sm:text-base font-black text-emerald-600">
                    -₹{fmt(calculationResult.tax_summary?.rebate_87a)}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-amber-200 bg-amber-50/50 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-amber-800 block">Net Tax Payable</span>
                  <span className="text-sm sm:text-base font-black text-amber-900">
                    ₹{fmt(calculationResult.tax_summary?.tax_payable)}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-rose-200 bg-rose-50/50 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-rose-800 block">Feb 2026 Bill TDS</span>
                  <span className="text-sm sm:text-base font-black text-rose-900">
                    ₹{fmt(calculationResult.tax_summary?.balance_tax_feb)}
                  </span>
                </div>
              </div>

              {/* DUAL TABLE PREVIEW MATCHING SHEET 3 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* LEFT: TAX CALCULATION & SLABS (5 COLS) */}
                <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span>Tax Calculation Particulars</span>
                    <span className="text-[10px] text-blue-600">New Regime</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 font-semibold text-slate-700">
                      <span>1.0 Gross Salary:</span>
                      <span className="font-black text-slate-900">₹{fmt(calculationResult.gross_salary)}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                      <span>2.0 Standard Deduction u/s 16(ia):</span>
                      <span className="font-bold text-slate-800">₹{fmt(calculationResult.deductions?.standard_deduction)}</span>
                    </div>

                    {(calculationResult.deductions?.spl_transport_deduction || calculationResult.deductions?.spl_transport_allowance || 0) > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                        <span>3.0 Specially Abled Transport Deduction:</span>
                        <span className="font-bold text-slate-800">₹{fmt(calculationResult.deductions?.spl_transport_deduction || calculationResult.deductions?.spl_transport_allowance)}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-1 border-b border-slate-100 font-bold text-slate-700 bg-slate-50 px-2 rounded-lg">
                      <span>4.0 Total Deductions:</span>
                      <span className="font-black text-slate-900">₹{fmt(calculationResult.deductions?.total_deduction)}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-blue-200 font-black text-blue-900 bg-blue-50 px-2 rounded-lg">
                      <span>5.0 Total Taxable Salary Income:</span>
                      <span>₹{fmt(calculationResult.taxable_income)}</span>
                    </div>
                  </div>

                  {/* SLABS TABLE */}
                  <div className="pt-2">
                    <span className="text-[11px] font-black uppercase text-slate-500 block mb-1.5">
                      Table 2 - Slab Calculations
                    </span>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-bold">
                            <th className="p-1.5 border border-slate-200">Slab</th>
                            <th className="p-1.5 border border-slate-200 text-center">Rate</th>
                            <th className="p-1.5 border border-slate-200 text-right">Tax (Rs.)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(calculationResult.slabs || calculationResult.tax_slabs || [])?.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 border-b border-slate-100">
                              <td className="p-1.5 border border-slate-200">{s.slab_desc || s.label}</td>
                              <td className="p-1.5 border border-slate-200 text-center">{s.rate_percent !== undefined ? s.rate_percent + "%" : s.rate}</td>
                              <td className="p-1.5 border border-slate-200 text-right font-semibold">₹{fmt(s.tax)}</td>
                            </tr>
                          ))}
                          <tr className="bg-slate-100 font-black text-slate-800">
                            <td colSpan={2} className="p-1.5 border border-slate-200">6.0 Total Tax</td>
                            <td className="p-1.5 border border-slate-200 text-right">₹{fmt(calculationResult.tax_summary?.total_tax_before_rebate)}</td>
                          </tr>
                          <tr className="text-emerald-700 font-bold">
                            <td colSpan={2} className="p-1.5 border border-slate-200">7.0 Less: 87A Rebate</td>
                            <td className="p-1.5 border border-slate-200 text-right">₹{fmt(calculationResult.tax_summary?.rebate_87a)}</td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="p-1.5 border border-slate-200 text-slate-600">8.0 Educational Cess (4%)</td>
                            <td className="p-1.5 border border-slate-200 text-right font-semibold">₹{fmt(calculationResult.tax_summary?.cess_amount)}</td>
                          </tr>
                          <tr className="bg-amber-50 font-black text-amber-900">
                            <td colSpan={2} className="p-1.5 border border-amber-200">9.0 Net Tax Payable</td>
                            <td className="p-1.5 border border-amber-200 text-right">₹{fmt(calculationResult.tax_summary?.tax_payable)}</td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="p-1.5 border border-slate-200 text-slate-600">10.0 TDS So Far Deducted</td>
                            <td className="p-1.5 border border-slate-200 text-right font-semibold">₹{fmt(calculationResult.tax_summary?.tds_deducted)}</td>
                          </tr>
                          <tr className="bg-rose-50 font-black text-rose-900">
                            <td colSpan={2} className="p-1.5 border border-rose-200">11.0 Balance in Feb 2026</td>
                            <td className="p-1.5 border border-rose-200 text-right">₹{fmt(calculationResult.tax_summary?.balance_tax_feb)}</td>
                          </tr>
                          {calculationResult.tax_summary?.tax_refund > 0 && (
                            <tr className="bg-emerald-50 font-black text-emerald-900">
                              <td colSpan={2} className="p-1.5 border border-emerald-200">12.0 Tax Refund</td>
                              <td className="p-1.5 border border-emerald-200 text-right">₹{fmt(calculationResult.tax_summary?.tax_refund)}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* RIGHT: 12-MONTH SALARY PARTICULARS (7 COLS) */}
                <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span>Pay Drawn Particulars (FY 2025 - 2026)</span>
                    <span className="text-[10px] text-slate-500">March 2025 to February 2026</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold">
                          <th className="p-1 border border-slate-200 text-center">Month</th>
                          <th className="p-1 border border-slate-200 text-center">DA%</th>
                          <th className="p-1 border border-slate-200 text-right">Basic</th>
                          <th className="p-1 border border-slate-200 text-right">DA</th>
                          <th className="p-1 border border-slate-200 text-right">HRA</th>
                          <th className="p-1 border border-slate-200 text-right">CCA</th>
                          <th className="p-1 border border-slate-200 text-right">OA</th>
                          <th className="p-1 border border-slate-200 text-right font-black">Gross</th>
                          <th className="p-1 border border-slate-200 text-right">TDS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(calculationResult.monthly_breakdown || calculationResult.monthly_rows || [])?.map((m, idx) => (
                          <tr key={m.month_num || idx} className="hover:bg-slate-50 border-b border-slate-100">
                            <td className="p-1 border border-slate-200 font-bold text-center">{m.month_label || m.month}</td>
                            <td className="p-1 border border-slate-200 text-center">{m.da_rate !== undefined ? m.da_rate : m.da_pct}%</td>
                            <td className="p-1 border border-slate-200 text-right">{fmt(m.basic_pay !== undefined ? m.basic_pay : m.basic)}</td>
                            <td className="p-1 border border-slate-200 text-right">{fmt(m.da)}</td>
                            <td className="p-1 border border-slate-200 text-right">{fmt(m.hra)}</td>
                            <td className="p-1 border border-slate-200 text-right">{fmt(m.cca)}</td>
                            <td className="p-1 border border-slate-200 text-right">{fmt(m.oa)}</td>
                            <td className="p-1 border border-slate-200 text-right font-bold text-slate-900">{fmt(m.gross)}</td>
                            <td className="p-1 border border-slate-200 text-right">{fmt(m.it_advance)}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100 font-black text-slate-900">
                          <td className="p-1 border border-slate-200 text-center">TOTAL</td>
                          <td className="p-1 border border-slate-200"></td>
                          <td className="p-1 border border-slate-200 text-right">{fmt(calculationResult.monthly_totals?.basic_pay !== undefined ? calculationResult.monthly_totals?.basic_pay : calculationResult.monthly_totals?.basic)}</td>
                          <td className="p-1 border border-slate-200 text-right">{fmt(calculationResult.monthly_totals?.da)}</td>
                          <td className="p-1 border border-slate-200 text-right">{fmt(calculationResult.monthly_totals?.hra)}</td>
                          <td className="p-1 border border-slate-200 text-right">{fmt(calculationResult.monthly_totals?.cca)}</td>
                          <td className="p-1 border border-slate-200 text-right">{fmt(calculationResult.monthly_totals?.oa)}</td>
                          <td className="p-1 border border-slate-200 text-right text-blue-900 font-black">{fmt(calculationResult.monthly_totals?.gross)}</td>
                          <td className="p-1 border border-slate-200 text-right">{fmt(calculationResult.monthly_totals?.it_advance)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* ADDITIONAL EARNINGS BREAKDOWN */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-slate-50 rounded-xl flex justify-between">
                      <span className="text-slate-600">Pongal Bonus:</span>
                      <span className="font-bold text-slate-900">₹{fmt(calculationResult.additions?.bonus)}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl flex justify-between">
                      <span className="text-slate-600">DA Arrears 1 (Jan-Apr):</span>
                      <span className="font-bold text-slate-900">₹{fmt(calculationResult.additions?.da_arrears_1)}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl flex justify-between">
                      <span className="text-slate-600">DA Arrears 2 (Jul-Oct):</span>
                      <span className="font-bold text-slate-900">₹{fmt(calculationResult.additions?.da_arrears_2)}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl flex justify-between">
                      <span className="text-slate-600">Surrender Leave (15 Days):</span>
                      <span className="font-bold text-slate-900">₹{fmt(calculationResult.additions?.surrender_leave !== undefined ? calculationResult.additions?.surrender_leave : calculationResult.additions?.surrender_total)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* FOOTER NOTICE */}
              <div className="text-center py-2 text-[10px] text-slate-400 font-medium tracking-wide">
                Generated by FrontierWox Tech Pvt Ltd Automation Suite
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
