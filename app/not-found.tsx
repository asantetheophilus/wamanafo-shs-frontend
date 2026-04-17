// ============================================================
// Wamanafo SHS — 404 Not Found Page
// ============================================================

import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-5">
          <FileQuestion className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-slate-800 mb-2">404</h1>
        <p className="text-lg font-semibold text-slate-700 mb-2">Page not found</p>
        <p className="text-sm text-slate-500 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
            bg-teal-700 text-white text-sm font-semibold hover:bg-teal-600 transition-colors"
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}
