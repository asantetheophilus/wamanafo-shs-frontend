// ============================================================
// Wamanafo SHS — Global Error Boundary
// Catches unhandled errors in the component tree.
// Shows user-friendly message; never exposes internals.
// ============================================================

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your monitoring service in production (e.g. Sentry)
    if (process.env.NODE_ENV === "production") {
      console.error("[GlobalError]", error.digest, error.message);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            An unexpected error occurred. If this keeps happening, please
            contact your school administrator.
          </p>
          {error.digest && (
            <p className="text-xs text-slate-400 font-mono mb-6">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                bg-teal-700 text-white text-sm font-semibold hover:bg-teal-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700
                text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
