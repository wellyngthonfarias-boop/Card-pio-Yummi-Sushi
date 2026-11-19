import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold">{children}</p>;
}
