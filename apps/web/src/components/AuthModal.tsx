"use client";

import React, { useState } from "react";
import { Language, translations } from "../lib/translations";
import { api } from "../lib/api";
import { X, User, Phone, Lock, Sparkles, CheckCircle2 } from "lucide-react";

interface AuthModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export function AuthModal({
  language,
  isOpen,
  onClose,
  onLoginSuccess,
}: AuthModalProps) {
  if (!isOpen) return null;
  const t = translations[language];

  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickRafiqLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login("01700000000", "rafiq123");
      if (res.ok && res.data.user) {
        onLoginSuccess(res.data.user);
        onClose();
      } else {
        // Fallback demo user if API is offline
        const mockRafiq = {
          id: "rafiq-pilot-farmer-id",
          fullName: "Md. Rafiqul Islam (কৃষক রফিক)",
          phone: "01700000000",
          role: "farmer",
        };
        onLoginSuccess(mockRafiq);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const res = await api.login(phone, password);
        if (res.ok && res.data.user) {
          onLoginSuccess(res.data.user);
          onClose();
        } else {
          setError(res.data?.error || "Login failed");
        }
      } else {
        const res = await api.register(phone, fullName, password);
        if (res.ok && res.data.user) {
          onLoginSuccess(res.data.user);
          onClose();
        } else {
          setError(res.data?.error || "Registration failed");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border-2 border-agrogreen-500 dark:border-yellow-400 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900 dark:text-yellow-400">
            {mode === "login" ? t.login : t.register}
          </h3>
          <button
            onClick={onClose}
            className="min-h-touch p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Rafiq Demo Button (PRD Primary Persona) */}
        <button
          type="button"
          onClick={handleQuickRafiqLogin}
          disabled={loading}
          className="w-full min-h-touch py-3 px-4 rounded-2xl bg-gradient-to-r from-agrogreen-600 to-nasablue-600 hover:from-agrogreen-700 hover:to-nasablue-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{t.loginAsRafiq}</span>
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
          <span className="flex-shrink mx-2 text-xs text-gray-400 uppercase font-bold">Or</span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {t.fullName}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Md. Rafiqul Islam"
                  className="w-full min-h-touch pl-9 pr-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium focus:ring-2 focus:ring-agrogreen-500 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t.phone}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full min-h-touch pl-9 pr-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium focus:ring-2 focus:ring-agrogreen-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t.password}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full min-h-touch pl-9 pr-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium focus:ring-2 focus:ring-agrogreen-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-touch py-3 rounded-2xl bg-gray-900 text-white dark:bg-yellow-400 dark:text-black font-extrabold text-sm shadow hover:bg-black transition-all"
          >
            {loading ? "..." : mode === "login" ? t.login : t.register}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-xs font-bold text-agrogreen-700 dark:text-yellow-400 hover:underline"
          >
            {mode === "login" ? "নতুন অ্যাকাউন্ট তৈরি করতে চান? নিবন্ধন করুন" : "আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}
