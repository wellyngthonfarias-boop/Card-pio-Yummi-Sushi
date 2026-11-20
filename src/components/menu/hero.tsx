import { AnimatedBrand } from "./animated-brand";
import { Bike, Clock3, UtensilsCrossed } from "lucide-react";
import { OpeningHours } from "@/components/layout/opening-hours";
import { SectionLabel } from "@/components/ui/section-label";

export function Hero() {
  return <section aria-labelledby="hero-title" className="hero site-container"><div><SectionLabel>Yummi Sushi Delivery</SectionLabel><h1 id="hero-title">O Japão inspira.<br />O sabor <em>fica.</em></h1><p className="hero-description">Escolha seus favoritos e monte seu pedido.</p><p className="hero-hours"><Clock3 size={17} aria-hidden="true" /><span><OpeningHours /></span></p><a href="#categorias" className="primary-button">Explorar cardápio</a><div className="service-modes"><span><UtensilsCrossed size={17} aria-hidden="true" />No restaurante</span><span><Bike size={19} aria-hidden="true" />Na sua casa</span></div></div><AnimatedBrand /></section>;
}
