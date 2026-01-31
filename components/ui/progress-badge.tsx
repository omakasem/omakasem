"use client";

interface ProgressBadgeProps {
  progress: number;
}

export default function ProgressBadge({ progress }: ProgressBadgeProps) {
  const colorClasses =
    progress >= 60
      ? "bg-success text-success-foreground"
      : progress >= 25
        ? "bg-warning text-warning-foreground"
        : "bg-danger text-danger-foreground";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClasses}`}
    >
      {progress}%
    </span>
  );
}
