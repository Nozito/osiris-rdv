// OSIRIS UX — breadcrumb navigation

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-xs text-faint mb-4 flex-wrap"
    >
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && (
            <ChevronRight size={11} className="text-faint/50 shrink-0" />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="
                hover:text-textc transition-colors duration-150
                underline-offset-2 hover:underline
              "
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-muted">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
