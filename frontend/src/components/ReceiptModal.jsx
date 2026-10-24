import React from "react";
import { X, Download, Printer, CheckCircle2, ShieldCheck, CreditCard, Calendar, User, FileText, ExternalLink } from "lucide-react";
import { generateReceiptPdf } from "../utils/receiptPdfExport";

export default function ReceiptModal({ enrollment, onClose, lang = "en" }) {
  if (!enrollment) return null;

  const isTa = lang === "ta";
  const receiptNo = `REC-TET-${String(enrollment.id || 1001).padStart(6, "0")}`;

  let dateFormatted = "Recent";
  let timeFormatted = "";
  if (enrollment.created_at) {
    try {
      const d = new Date(enrollment.created_at);
      dateFormatted = d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
      timeFormatted = d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch (e) {
      dateFormatted = String(enrollment.created_at).slice(0, 10);
    }
  }

  const amountNum = enrollment.amount !== undefined ? Number(enrollment.amount) : 1000;
  const paymentId = enrollment.payment_id || "pay_TroS46OjCj36Am";
  const orderId = enrollment.order_id || `order_TET${enrollment.id || 1001}`;

  const handlePrint = () => {
    generateReceiptPdf(enrollment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative my-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR */}
        <div className="bg-[#061b36] text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0055ff] flex items-center justify-center text-white font-black text-xs shadow-md">
              TN
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">
                {isTa ? "கட்டண ரசீது / Tax Invoice" : "Fee Payment Receipt / Invoice"}
              </h3>
              <p className="text-[11px] text-slate-300">
                {receiptNo}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto text-[#071c38]">
          
          {/* SUCCESS BADGE STRIP */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                ✓
              </div>
              <div>
                <span className="text-xs font-black text-emerald-900 block">
                  {isTa ? "கட்டணம் வெற்றிகரமாக செலுத்தப்பட்டது" : "Payment Completed & Verified"}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  TN Teachers Platform • Instant Digital Access
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900">
              PAID ✓
            </span>
          </div>

          {/* CANDIDATE & PAYMENT DETAILS BOX */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* Student Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200">
                {isTa ? "மாணவர் விவரம் (Billed To)" : "Candidate Details"}
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{isTa ? "பெயர்" : "Name"}</span>
                <span className="font-black text-[#061b36] text-sm">{enrollment.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{isTa ? "மின்னஞ்சல்" : "Email"}</span>
                <span className="font-semibold text-slate-700 break-all">{enrollment.email}</span>
              </div>
              {enrollment.mobile && (
                <div>
                  <span className="text-slate-400 block text-[10px]">{isTa ? "கைபேசி எண்" : "Mobile"}</span>
                  <span className="font-semibold text-slate-700">{enrollment.mobile}</span>
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200">
                {isTa ? "பரிவர்த்தனை விவரம்" : "Transaction Details"}
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Payment ID (Razorpay)</span>
                <span className="font-mono font-bold text-slate-800 break-all">{paymentId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{isTa ? "தேதி & நேரம்" : "Date & Time"}</span>
                <span className="font-semibold text-slate-700">{dateFormatted} {timeFormatted ? `• ${timeFormatted}` : ""}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{isTa ? "கட்டண முறை" : "Payment Mode"}</span>
                <span className="font-semibold text-slate-700">Online (Razorpay / UPI)</span>
              </div>
            </div>
          </div>

          {/* ITEM SUMMARY TABLE */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 text-[11px] font-black uppercase text-slate-600 flex justify-between">
              <span>{isTa ? "பாடநெறி / தொகுப்பு" : "Course Package"}</span>
              <span>{isTa ? "தொகை" : "Amount"}</span>
            </div>
            <div className="p-4 flex items-start justify-between gap-4">
              <div>
                <h4 className="font-black text-[#061b36] text-xs sm:text-sm">
                  {enrollment.course_name || "TNTET Paper 1 & 2 All-in-One Pass"}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Full 1-Year Access to TNTET Study Modules, Practice MCQs, Mock Exams, and VIP Teachers Community.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base font-black text-[#0055ff]">
                  ₹{amountNum.toLocaleString("en-IN")}.00
                </span>
                <span className="block text-[10px] text-emerald-600 font-bold">Paid in Full</span>
              </div>
            </div>
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-600">{isTa ? "மொத்தக் கட்டணம் (Tax Inclusive):" : "Total Amount Paid:"}</span>
              <span className="text-base font-black text-[#061b36]">₹{amountNum.toLocaleString("en-IN")}.00</span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#0055ff] hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isTa ? "ரசீதை PDF வடிவில் பதிவிறக்குக" : "Download Official PDF Receipt"}</span>
            </button>
            <button
              onClick={onClose}
              className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              {isTa ? "மூடுக" : "Close"}
            </button>
          </div>

          {/* MANDATORY FOOTER */}
          <div className="pt-3 border-t border-slate-200 text-center">
            <p className="text-[11px] font-bold text-slate-500">
              This receipt is auto generated - Powered by FrontierWox Tech Pvt Ltd - www.frontierwox.in
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
