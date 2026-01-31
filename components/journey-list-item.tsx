"use client";

import Link from "next/link";
import ProgressBadge from "@/components/ui/progress-badge";

interface JourneyListItemProps {
  title: string;
  progress: number;
  isActive?: boolean;
  href: string;
  icon?: string;
}

export default function JourneyListItem({
  title,
  progress,
  isActive = false,
  href,
  icon,
}: JourneyListItemProps) {
  return (
    <Link
      href={href}
      className={`
        flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm
        transition-colors duration-200
        ${
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
        }
      `}
    >
      <div className="flex items-center gap-2 min-w-0">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="truncate">{title}</span>
      </div>
      <ProgressBadge progress={progress} />
    </Link>
  );
}
