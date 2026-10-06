"use client";

import React from "react";
import { Language, translations } from "../lib/translations";
import { Globe, Moon, Sun, Wifi, WifiOff, LogOut, Sprout } from "lucide-react";
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
    <header className="border-b bg-white dark:bg-black dark:border-yellow-400 sticky top-0 z-40 shadow-sm transition-colors">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
<Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
  <div className="w-10 h-10 rounded-xl bg-agrogreen-600 dark:bg-yellow-400 flex items-center justify-center text-white dark:text-black shadow">
    <Sprout className="w-6 h-6" />
  </div>
  <div>
    <div className="flex items-center gap-2">
      <span className="font-extrabold text-xl tracking-tight text-agrogreen-800 dark:text-yellow-400">
        {t.appName}
      </span>
      <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-nasablue-500/10 text-nasablue-600 dark:bg-yellow-400/20 dark:text-yellow-300">
        NASA Data
      </span>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-300 hidden sm:block">
      {t.tagline}
    </p>
  </div>
</Link>

        {/* Accessibility & Mode Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Airplane Mode Simulator */}
          <button
            onClick={onSimulatedOfflineToggle}
            className={`min-h-touch px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isSimulatedOffline
                ? "bg-amber-500 text-white border-amber-600 animate-pulse"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700"
            }`}
            title="Toggle offline airplane simulation"
          >
            {isSimulatedOffline ? (
              <>
                <WifiOff className="w-4 h-4" />
                <span>{t.simulateOffline} (ON)</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-agrogreen-600" />
                <span>{t.onlineMode}</span>
              </>
            )}
          </button>

          <button
            onClick={onThemeToggle}
            className="min-h-touch px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Font Scaling */}
          <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800">
            <button
              onClick={() => onFontScaleChange(1.0)}
              className={`min-h-touch px-2.5 text-xs font-bold ${
                fontScale === 1.0 ? "bg-agrogreen-600 text-white dark:bg-yellow-400 dark:text-black" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              A
            </button>
            <button
              onClick={() => onFontScaleChange(1.15)}
              className={`min-h-touch px-2.5 text-sm font-bold ${
                fontScale === 1.15 ? "bg-agrogreen-600 text-white dark:bg-yellow-400 dark:text-black" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              A+
            </button>
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => onLanguageChange(language === "bn" ? "en" : "bn")}
            className="min-h-touch px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-yellow-300 border border-gray-300 dark:border-gray-700 flex items-center gap-1.5"
          >
            <Globe className="w-4 h-4" />
            <span>{language === "bn" ? "English" : "বাংলা"}</span>
          </button>

          {/* User / Auth */}
          {user ? (
            <div className="flex items-center gap-2 pl-1">
              <span className="text-xs font-bold text-gray-700 dark:text-yellow-300 hidden lg:inline">
                {user.fullName}
              </span>
              <button
                onClick={onLogout}
                className="min-h-touch p-2 rounded-lg text-gray-500 hover:text-red-600 dark:text-gray-300"
                title={t.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="min-h-touch px-3 py-1.5 rounded-lg text-xs font-bold bg-agrogreen-600 hover:bg-agrogreen-700 text-white dark:bg-yellow-400 dark:text-black"
            >
              {t.login}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
