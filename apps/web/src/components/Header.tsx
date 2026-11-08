"use client";

import React from "react";
import { Language, translations } from "../lib/translations";
import { Moon, Sun, Wifi, WifiOff, Sprout, Satellite, User, LogOut, Radio } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  fontScale: number;
  onFontScaleChange: (scale: number) => void;
  isSimulatedOffline: boolean;
  onSimulatedOfflineToggle: () => void;
  user: any;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export function Header({
  language,
  onLanguageChange,
  isDarkMode,
  onThemeToggle,
  fontScale,
  onFontScaleChange,
  isSimulatedOffline,
  onSimulatedOfflineToggle,
  user,
  onLogout,
  onOpenAuth,
}: HeaderProps) {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Mission Badge */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                {t.appName}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-nasablue-500/10 text-nasablue-600 dark:bg-nasablue-500/20 dark:text-nasablue-300 border border-nasablue-500/20">
                NASA DATA
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block leading-none mt-0.5">
              {t.tagline}
            </p>
          </div>
        </Link>

        {/* Live Satellite Feed Pill (Center/Right) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Satellite className="w-3.5 h-3.5 text-nasablue-500" />
          <span>{language === "bn" ? "লাইভ নাসা উপাত্ত: SMAP L4 · Landsat 9 · POWER" : "Live NASA EO: SMAP L4 · Landsat 9 · POWER"}</span>
        </div>

        {/* Controls: Language, Mode, Font, Auth */}
        <div className="flex items-center gap-2">
          {/* Offline Mode Toggle Pill */}
          <button
            onClick={onSimulatedOfflineToggle}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              isSimulatedOffline
                ? "bg-amber-500 text-white border-amber-600 shadow-sm animate-pulse"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700"
            }`}
            title="Toggle simulated offline mode"
          >
            {isSimulatedOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.simulateOffline}</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">{t.onlineMode}</span>
              </>
            )}
          </button>

          {/* Language Switcher Segmented Control */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onLanguageChange("bn")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                language === "bn"
                  ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => onLanguageChange("en")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                language === "en"
                  ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-700"
            title={isDarkMode ? "Light mode" : "Dark mode"}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Font Scaling Toggle */}
          <button
            onClick={() => onFontScaleChange(fontScale === 1.0 ? 1.15 : 1.0)}
            className={`px-2 py-1 rounded-xl text-xs font-extrabold border transition-all ${
              fontScale > 1.0
                ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
            }`}
            title="Toggle larger farmer-friendly font size"
          >
            A+
          </button>

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-1.5 pl-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden md:inline truncate max-w-[120px]">
                {user.name || user.phone}
              </span>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-extrabold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "লগইন" : "Login"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
