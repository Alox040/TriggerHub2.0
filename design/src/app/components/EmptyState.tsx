import React from "react";

interface EmptyStateProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  ctaLabel: string;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, ctaLabel, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`flex min-h-[176px] flex-col items-center justify-center rounded-[10px] border border-dashed border-[var(--th-border-weak)] bg-[var(--th-bg-panel)] px-6 py-8 text-center ${className}`}
    >
      <Icon size={32} className="text-[var(--th-text-muted)]" />
      <h3 className="mt-4 text-[14px] font-medium text-[var(--th-text-secondary)]">{title}</h3>
      <p className="mt-1 text-[12px] text-[var(--th-text-muted)]">{description}</p>
      <button
        type="button"
        className="mt-4 rounded-md bg-th-accent px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-th-accent-hover"
      >
        {ctaLabel}
      </button>
    </div>
  );
}
