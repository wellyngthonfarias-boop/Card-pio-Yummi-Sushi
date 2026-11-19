"use client";

import { Moon, Sun } from "lucide-react";
import { toggleTheme } from "@/lib/theme";

export function ThemeToggle() {
  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme}>
      <span className="theme-action-light"><Sun size={20} aria-hidden="true" /><span className="sr-only">Ativar modo claro</span></span>
      <span className="theme-action-dark"><Moon size={20} aria-hidden="true" /><span className="sr-only">Ativar modo escuro</span></span>
    </button>
  );
}
