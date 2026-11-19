import { Bike, UtensilsCrossed } from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { SectionLabel } from "@/components/ui/section-label";

export function Experience() {
  return (
    <section id="experiencia" aria-labelledby="experience-title" className="scroll-mt-8 border-t border-white/10 py-16 sm:py-20">
      <SectionLabel>Do seu jeito</SectionLabel>
      <h2 id="experience-title" className="mt-4 font-display text-3xl sm:text-4xl">Uma experiência. Dois lugares.</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {restaurant.serviceModes.map((mode) => {
          const Icon = mode.id === "presencial" ? UtensilsCrossed : Bike;
          return (
            <article key={mode.id} className="rounded-2xl border border-white/10 bg-surface p-7 sm:p-8">
              <Icon aria-hidden="true" size={28} strokeWidth={1.5} className="text-gold" />
              <h3 className="mt-6 text-xl font-medium">{mode.title}</h3>
              <p className="mt-3 max-w-md leading-7 text-muted">{mode.description}</p>
            </article>
          );
        })}
      </div>
      <p className="mt-6 text-sm leading-6 text-muted">Estamos preparando nosso cardápio digital. Os produtos e a seleção de pedidos estarão disponíveis em breve.</p>
    </section>
  );
}
