// ============================================================
// Wamanafo SHS — Empty State Component (Liquid UI)
// ============================================================
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, body, description, action }: EmptyStateProps) {
  const text = body ?? description;
  return (
    <div className="empty-state">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-slate-300" />
      </div>
      <p className="empty-state-title">{title}</p>
      {text && <p className="empty-state-body mt-1">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
