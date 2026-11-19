import { Brand } from "./brand";
import { ThemeToggle } from "./theme-toggle";
import { SelectionButton } from "@/components/cart/selection-access";

export function Header() {
  return (
    <header className="border-b border-white/10">
      <div className="site-container flex min-h-24 items-center justify-between gap-4 py-3">
        <a href="#inicio" aria-label="Yummi Sushi Delivery — início"><Brand preload /></a>
        <nav aria-label="Navegação principal" className="flex items-center gap-2 sm:gap-6">
          <a href="#cardapio" className="text-sm font-medium hover:text-gold">Cardápio</a>
          <a href="#sobre" className="hidden text-sm text-muted hover:text-gold sm:block">Sobre o Yummi</a>
          <ThemeToggle />
          <SelectionButton />
        </nav>
      </div>
    </header>
  );
}
