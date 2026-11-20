import { restaurant } from "@/data/restaurant";
import { AtSign } from "lucide-react";
import { Brand } from "./brand";
import { restaurantInfo } from "@/data/menu";
import { OpeningHours } from "./opening-hours";

export function Footer() {
  return (
    <footer id="sobre" className="border-t border-white/10 py-10">
      <div className="site-container">
        <div className="footer-grid">
          <div className="flex items-start gap-4"><Brand /><div><p className="font-semibold">{restaurant.name}</p><p className="mt-2 max-w-xs text-sm leading-6 text-muted">Culinária japonesa para saborear no restaurante ou no conforto de casa.</p></div></div>
          <div><h2 className="text-sm font-semibold">Funcionamento</h2><p className="mt-4 text-sm leading-6 text-muted"><OpeningHours /></p><a href="#cardapio" className="mt-3 inline-block text-sm text-muted hover:text-gold">Explorar cardápio</a></div>
          <div><h2 className="text-sm font-semibold">Acompanhe o Yummi</h2><a href={restaurantInfo.instagramUrl} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center gap-2 break-all text-sm text-muted hover:text-gold"><AtSign size={18} className="shrink-0" aria-hidden="true" />{restaurantInfo.instagram}</a><p className="mt-3 text-sm text-muted">Também no iFood.</p></div>
        </div>
        <p className="mt-9 border-t border-white/10 pt-6 text-xs text-muted">Yummi Sushi Delivery · Valores conforme o cardápio fornecido · Sua seleção não envia pedidos automaticamente</p>
      </div>
    </footer>
  );
}
