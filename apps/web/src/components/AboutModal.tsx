"use client";

import React from "react";
import { Language } from "../lib/translations";
import { X, Sprout, ShieldCheck, Heart, Github, ExternalLink, Sparkles, BookOpen } from "lucide-react";

interface AboutModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ language, isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border-2 border-agrogreen-400 dark:border-yellow-400 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-agrogreen-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-agrogreen-700 text-white flex items-center justify-center shadow">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-gray-900 dark:text-yellow-400">
                  TerraShift · টেরাশিফ্‌ট
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-300">
                NASA Space Apps Challenge 2026 · Team AgroNova
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          {/* Section 1: Team & Mission */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2">
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-yellow-400 uppercase tracking-wider">
              {language === "bn" ? "টিম এগ্রোনোভা ও লক্ষ্য" : "Team AgroNova & Mission"}
            </h4>
            <p>
              {language === "bn"
                ? "টিম এগ্রোনোভা (Team AgroNova) নাসা স্পেস অ্যাপস ২০২৬ প্রতিযোগিতার 'Field Shift: Adapting Farms with NASA Data' চ্যালেঞ্জের অংশ হিসেবে টেরাশিফ্‌ট প্ল্যাটফর্মটি উদ্ভাবন করেছে। আমাদের লক্ষ্য বাংলাদেশের উপকূল ও বরেন্দ্র অঞ্চলের প্রান্তিক কৃষকদের হাতে স্যাটেলাইট প্রযুক্তির সরাসরি সুবিধা পৌঁছে দেওয়া।"
                : "Team AgroNova engineered TerraShift for NASA Space Apps Challenge 2026. Our mission is delivering actionable, honest, offline-first Earth observation tools directly to Bangladesh's smallholder farmers."}
            </p>
          </div>

          {/* Section 2: AI Disclosure (Judges Criterion) */}
          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-extrabold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>{language === "bn" ? "কৃত্রিম বুদ্ধিমত্তা ব্যবহারের স্বচ্ছ স্বীকৃতি (AI Disclosure)" : "AI Usage Disclosure & Transparency"}</span>
            </div>
            <p className="text-purple-950 dark:text-purple-200">
              {language === "bn"
                ? "টেরাশিফ্‌টের কোড কাঠামো, টাইপস্ক্রিপ্ট ইন্টারফেস ও দ্বিভাষিক (বাংলা-ইংরেজি) অনুবাদের প্রাথমিক খসড়ায় উন্নত এআই মডেলের সহায়তা নেওয়া হয়েছে। তবে সমস্ত বৈজ্ঞানিক সমীকরণ (FAO-56 Penman-Monteith, RothC কার্বন গতিবিদ্যা, Peoples BNF ও BARI/BRRI জাতের কৃষি পরামিতি) এবং NASA উপগ্রহ ডেটাসেটের প্রক্রিয়াকরণ মানুষের সরাসরি পর্যালোচনা ও সত্যনিষ্ঠ বৈজ্ঞানিক গবেষণাপত্রের মাধ্যমে নিশ্চিত করা হয়েছে।"
                : "Generative AI assistants were used for software scaffolding, UI code drafting, and translation assistance. All scientific algorithms (FAO-56, RothC SOC kinetics, Peoples BNF, Landsat SSEBop) and agronomic tables were human-reviewed, audited, and strictly referenced against peer-reviewed citations."}
            </p>
          </div>

          {/* Section 3: Exact FAO SOLAW Citation */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-extrabold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>{language === "bn" ? "এফএও শীর্ষ মৃত্তিকা অবক্ষয় তথ্যসূত্র (Exact FAO Source Citation)" : "Exact FAO SOLAW 2021 Reference"}</span>
            </div>
            <p className="font-mono text-[11px] text-blue-950 dark:text-blue-200 bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900">
              FAO (2021). <em>The State of the World&apos;s Land and Water Resources for Food and Agriculture: Systems at breaking point (SOLAW 2021)</em>. Main report. Rome, FAO. DOI: <code>10.4060/cb9910en</code>, Chapter 2, Section 2.3.
            </p>
            <p className="text-[11px] text-blue-800 dark:text-blue-300">
              {language === "bn"
                ? "বিশ্বের ৯০% শীর্ষ মাটির অবক্ষয় ঝুঁকির বৈজ্ঞানিক দাবিটি FAO-র এই অফিসিয়াল প্রকাশনা থেকে উদ্ধৃত।"
                : "The global 90% topsoil degradation vulnerability assessment is explicitly cited from this landmark FAO report."}
            </p>
          </div>

          {/* Section 4: Open Source Repository & NASA Links */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-[11px] font-bold text-gray-500">
              NASA Earthdata Open Access · MIT License
            </span>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-agrogreen-700 text-white dark:bg-yellow-400 dark:text-black font-extrabold text-xs shadow hover:opacity-90"
          >
            {language === "bn" ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
