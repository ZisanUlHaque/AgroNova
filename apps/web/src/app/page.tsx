"use client";

import Link from "next/link";
import { useState } from "react";
import { Anek_Bangla, Hind_Siliguri } from "next/font/google";
import { ArrowRight, Play, Languages, Sprout, WifiOff, Satellite, Droplets, SlidersHorizontal, MapPin, ShieldCheck, Menu, X } from "lucide-react";

const display = Anek_Bangla({ subsets: ["bengali", "latin"], weight: ["600", "800"], display: "swap" });
const body = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "700"], display: "swap" });

const BG = "https://images.unsplash.com/photo-1560321941-84a23c5fce8c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D";
const SHOT = "/dashboard.png";

const NASA = ["SMAP L4", "Landsat 9", "MODIS", "NASA POWER"];
const OTHER = ["ISRIC SoilGrids", "BARI", "BRRI", "SRDI"];

export default function Hero() {
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [open, setOpen] = useState(false);
  const nudge = lang === "bn" ? "pt-[3px]" : ""; // Bangla glyphs sit high; this re-centres them
  const tr = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E3F27A]";

  return (
    <main lang={lang} className={`${body.className} relative overflow-hidden bg-[#0B2A24] text-white`}>
      <style>{`
        @keyframes rise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
        @keyframes drift{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .rise{animation:rise .9s cubic-bezier(.2,.8,.2,1) backwards}
        .drift{animation:drift 6s ease-in-out infinite}
        @media (prefers-reduced-motion:reduce){.rise,.drift{animation:none}}
      `}</style>

      {/* Background photo and legibility layers */}
      <img src={BG} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(7,36,31,.55) 0%,rgba(7,36,31,.72) 45%,rgba(11,42,36,.96) 100%)" }} />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Navbar */}
        <header className="rise sticky top-4 z-50 mx-auto mt-5 max-w-6xl">
          <div className="flex items-center justify-between gap-3 rounded-full border border-white/70 bg-white py-2 pl-2.5 pr-2 text-[#0B2A24] shadow-[0_12px_40px_-12px_rgba(0,0,0,.55)]">
            <Link href="/" aria-label="TerraShift" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B2A24] text-[#E3F27A]"><Sprout size={22} aria-hidden /></span>
              <span className="flex items-center gap-2">
                <span className={`${display.className} ${nudge} text-xl font-extrabold leading-none`}>{tr("টেরাশিফ্‌ট", "TerraShift")}</span>
                <span className="hidden rounded-md bg-[#E3F27A] px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide sm:inline">NASA DATA</span>
              </span>
            </Link>

            <nav aria-label="Primary" className="hidden items-center gap-1 rounded-full bg-[#F0F4EE] p-1 md:flex">
              {([["#product", tr("প্রোডাক্ট", "Product")], ["#data", tr("ডেটা উৎস", "Data sources")], ["/dashboard", tr("ড্যাশবোর্ড", "Dashboard")], ["/dashboard?preset=barind", tr("ডেমো", "Demo")]] as const).map(([href, label], i) => (
                <a key={href} href={href} className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-bold transition ${i === 0 ? "bg-white shadow-sm" : "text-[#35524A] hover:bg-white/70"} ${focus}`}>
                  <span className={nudge}>{label}</span>
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden rounded-full bg-[#F0F4EE] p-1 sm:flex" role="group" aria-label="Language">
                {([["bn", "বাংলা"], ["en", "EN"]] as const).map(([l, label]) => (
                  <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={`h-9 rounded-full px-3.5 text-sm font-bold transition ${lang === l ? "bg-white shadow-sm" : "text-[#35524A] hover:bg-white/70"} ${focus}`}>
                    <span className={l === "bn" ? "pt-[3px] inline-block" : ""}>{label}</span>
                  </button>
                ))}
              </div>
              <Link href="/dashboard" className={`hidden h-11 items-center gap-2 rounded-full bg-[#0B2A24] pl-5 pr-1.5 text-sm font-bold text-white hover:bg-[#12403A] sm:inline-flex ${focus}`}>
                <span className={nudge}>{tr("শুরু করুন", "Get started")}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E3F27A] text-[#0B2A24]"><ArrowRight size={15} aria-hidden /></span>
              </Link>
              <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu" className={`flex h-11 w-11 items-center justify-center rounded-full bg-[#F0F4EE] md:hidden ${focus}`}>
                {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
              </button>
            </div>
          </div>

          {open && (
            <div className="mt-2 rounded-3xl border border-white/70 bg-white p-3 text-[#0B2A24] shadow-2xl md:hidden">
              {([["#product", tr("প্রোডাক্ট", "Product")], ["#data", tr("ডেটা উৎস", "Data sources")], ["/dashboard", tr("ড্যাশবোর্ড", "Dashboard")], ["/dashboard?preset=barind", tr("ডেমো", "Demo")]] as const).map(([href, label]) => (
                <a key={href} href={href} onClick={() => setOpen(false)} className="flex h-12 items-center rounded-2xl px-4 font-bold hover:bg-[#F0F4EE]"><span className={nudge}>{label}</span></a>
              ))}
              <button onClick={() => setLang(lang === "bn" ? "en" : "bn")} className="mt-1 flex h-12 w-full items-center gap-2 rounded-2xl px-4 font-bold hover:bg-[#F0F4EE]"><Languages size={17} aria-hidden />{lang === "bn" ? "English" : "বাংলা"}</button>
            </div>
          )}
        </header>

        {/* Message */}
        <div className="mx-auto max-w-4xl pt-14 text-center sm:pt-20">
          <p className="rise inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-1.5 text-sm font-medium ring-1 ring-white/25 backdrop-blur" style={{ animationDelay: ".1s" }}>
            <Satellite size={14} className="text-[#E3F27A]" aria-hidden />{tr("NASA Space Apps 2026 · Field Shift", "NASA Space Apps 2026 · Field Shift")}
          </p>
          <h1 className={`${display.className} rise mt-6 text-[clamp(2.3rem,6vw,4.9rem)] font-extrabold leading-[1.08] tracking-tight`} style={{ animationDelay: ".2s" }}>
            {tr("আপনার জমির জন্য সেরা ফসল-আবর্তন,", "The right crop rotation for your land,")}
            <br />
            <span className="mt-2 inline-block -rotate-1 rounded-2xl bg-[#E3F27A] px-4 py-0.5 text-[#0B2A24]">{tr("মহাকাশের তথ্য থেকে", "read from orbit")}</span>
          </h1>
          <p className="rise mx-auto mt-7 max-w-[58ch] text-lg leading-relaxed text-[#DCEBE6]" style={{ animationDelay: ".3s" }}>
            {tr("SMAP মাটির আর্দ্রতা, Landsat বাষ্পীভবন ও NASA POWER আবহাওয়া দিয়ে তিনটি আবর্তন পাশাপাশি দেখুন। ইন্টারনেট ছাড়াও চলে। সিদ্ধান্ত নেন আপনি।",
              "See three rotations side by side using SMAP soil moisture, Landsat evapotranspiration and NASA POWER weather. Works offline. You make the decision.")}
          </p>
          <div className="rise mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: ".4s" }}>
            <Link href="/dashboard" className={`inline-flex min-h-14 items-center gap-3 rounded-full bg-[#E3F27A] py-1.5 pl-8 pr-1.5 text-base font-bold text-[#0B2A24] shadow-xl shadow-black/25 hover:bg-[#EDF79A] ${focus}`}>
              {tr("আমার জমির পরিকল্পনা", "Plan my field")}
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B2A24] text-white"><ArrowRight size={18} aria-hidden /></span>
            </Link>
            <Link href="/dashboard?preset=barind" className={`inline-flex min-h-14 items-center gap-3 rounded-full bg-white/12 py-1.5 pl-7 pr-1.5 text-base font-bold ring-1 ring-white/35 backdrop-blur hover:bg-white/20 ${focus}`}>
              {tr("৩০ সেকেন্ড ডেমো", "30-second demo")}
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0B2A24]"><Play size={16} aria-hidden /></span>
            </Link>
          </div>
          <p className="rise mt-5 inline-flex items-center gap-2 text-sm text-[#BFD6CF]" style={{ animationDelay: ".5s" }}>
            <WifiOff size={14} aria-hidden />{tr("অফলাইন-ফার্স্ট PWA · বাংলা ও English", "Offline-first PWA · Bangla and English")}
          </p>
        </div>

        {/* Dashboard preview */}
        <div id="product" className="rise relative mx-auto mt-14 max-w-6xl" style={{ animationDelay: ".6s" }}>
          <div className="rounded-[28px] bg-white/15 p-2 shadow-2xl shadow-black/40 ring-1 ring-white/30 backdrop-blur-xl sm:p-3">
            <div className="flex items-center gap-1.5 px-3 pb-2 pt-1" aria-hidden>
              {["#FF8A8F", "#F2C14E", "#7BD88F"].map((c) => <i key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}
              <span className="ml-3 rounded-full bg-white/15 px-3 py-0.5 text-xs text-[#DCEBE6]">terrashift.app/dashboard</span>
            </div>
            <div className="relative max-h-[300px] overflow-hidden rounded-2xl sm:max-h-[520px]">
              <img src={SHOT} alt={tr("টেরাশিফ্‌ট ড্যাশবোর্ড: স্যাটেলাইট মানচিত্রে জমি নির্বাচন", "TerraShift dashboard: choosing a field on a satellite map")} className="w-full" />
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-32" style={{ background: "linear-gradient(0deg,#0B2A24,transparent)" }} />
            </div>
          </div>

          {/* Floating callouts */}
          <div className="drift absolute -left-2 top-24 hidden max-w-[230px] rounded-2xl bg-white p-3.5 text-[#0B2A24] shadow-2xl shadow-black/30 lg:block">
            <p className="flex items-center gap-1.5 text-xs font-bold text-[#2F7D4F]"><MapPin size={14} aria-hidden />{tr("ধাপ ১", "Step 1")}</p>
            <p className={`${display.className} mt-0.5 text-sm font-extrabold`}>{tr("স্যাটেলাইট মানচিত্রে নিজের জমি বেছে নিন", "Pick your field on a satellite map")}</p>
          </div>
          <div className="drift absolute -right-2 top-48 hidden max-w-[240px] rounded-2xl bg-white p-3.5 text-[#0B2A24] shadow-2xl shadow-black/30 lg:block" style={{ animationDelay: "1.5s" }}>
            <p className="flex items-center gap-1.5 text-xs font-bold text-[#2E7BD6]"><SlidersHorizontal size={14} aria-hidden />{tr("ধাপ ২", "Step 2")}</p>
            <p className={`${display.className} mt-0.5 text-sm font-extrabold`}>{tr("পানি, আয়, মাটির অগ্রাধিকার স্লাইডারে দিন", "Set water, income and soil priorities with sliders")}</p>
          </div>
          <div className="drift absolute -bottom-3 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-[#E3F27A] px-5 py-2.5 text-sm font-bold text-[#0B2A24] shadow-2xl shadow-black/30 sm:flex" style={{ animationDelay: "3s" }}>
            <Droplets size={16} aria-hidden />{tr("তিনটি আবর্তন তুলনা, প্রমাণ ও ঝুঁকিসহ", "Three rotations compared, with evidence and risks")}
          </div>
        </div>

        {/* Data strip */}
        <div id="data" className="mt-16 grid gap-6 pb-10 sm:grid-cols-2">
          {([[tr("NASA পর্যবেক্ষণ", "NASA observations"), NASA, "#E3F27A"], [tr("বাহ্যিক উৎস, NASA নয়", "External sources, not NASA"), OTHER, "#9CC9FF"]] as const).map(([title, items, c]) => (
            <div key={title}>
              <p className="flex items-center gap-2 text-sm font-bold" style={{ color: c }}><ShieldCheck size={15} aria-hidden />{title}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {items.map((n) => <li key={n} className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold ring-1 ring-white/20">{n}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}