"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-xs">
            CS
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900 leading-none">Customer Success Dashboard</h1>
            <p className="text-xs text-gray-400 mt-0.5">Portfolio Health Monitor</p>
          </div>
        </Link>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
          Live · 8 accounts
        </div>
      </div>
    </header>
  );
}
