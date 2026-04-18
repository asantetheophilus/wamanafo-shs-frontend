// ============================================================
// Wamanafo SHS — Page Header Component (Liquid UI)
// ============================================================

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title:        string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  action?:      React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, action }: PageHeaderProps) {
  return (
    <div className="px-8 pt-6 pb-5 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-slate-400 mb-2">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3 shrink-0" />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-teal-700 transition-colors font-medium">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-600 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
            {title}
          </h1>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
