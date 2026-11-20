import { Brand } from "./brand";
import { ThemeToggle } from "./theme-toggle";
import { SelectionButton } from "@/components/cart/selection-access";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-white/10">
      <div className="site-container flex min-h-24 items-center justify-between gap-4 py-3">
        <a href="#inicio" aria-label="Yummi Sushi Delivery — início"><Brand preload /></a>
        <nav aria-label="Navegação principal" className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:flex-none sm:gap-6">
          <Link href="/admin" className="flex min-h-11 basis-full items-center justify-center rounded-full border border-white/10 px-3 py-2 text-center text-xs font-medium hover:text-gold sm:basis-auto sm:text-sm">Painel administrativo</Link>
          <a href="#cardapio" className="text-sm font-medium hover:text-gold">Cardápio</a>
          <a href="#sobre" className="hidden text-sm text-muted hover:text-gold sm:block">Sobre o Yummi</a>
          <ThemeToggle />
          <SelectionButton />
        </nav>
      </div>
    </header>
  );
}
