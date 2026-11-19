"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { MenuProduct } from "@/types/menu";
import { ProductCard } from "./product-card";

export function ProductCarousel({ products, label, onOpenDetails }: {
  products: readonly MenuProduct[];
  label: string;
  onOpenDetails: (product: MenuProduct) => void;
}) {
  const id = useId();
  const track = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ previous: false, next: false });

  function updatePosition() {
    const element = track.current;
    if (!element) return;
    const previous = element.scrollLeft > 2;
    const next = element.scrollLeft + element.clientWidth < element.scrollWidth - 2;
    setPosition((current) => current.previous === previous && current.next === next ? current : { previous, next });
  }

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const observer = new ResizeObserver(updatePosition);
    observer.observe(element);
    const frame = requestAnimationFrame(updatePosition);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [products]);

  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    const card = element.firstElementChild;
    const step = card ? card.getBoundingClientRect().width + 20 : element.clientWidth;
    element.scrollBy({ left: direction * step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return <div className="product-carousel" role="region" aria-roledescription="carrossel" aria-label={label}>
    <div className="carousel-controls">
      <span className="carousel-hint">{products.length} {products.length === 1 ? "opção" : "opções"}{(position.previous || position.next) && " · Deslize para explorar"}</span>
      {(position.previous || position.next) && <div className="carousel-buttons">
        <button type="button" aria-label={`Anterior em ${label}`} aria-controls={id} disabled={!position.previous} onClick={() => move(-1)}>Anterior</button>
        <button type="button" aria-label={`Próximo em ${label}`} aria-controls={id} disabled={!position.next} onClick={() => move(1)}>Próximo</button>
      </div>}
    </div>
    <div id={id} ref={track} className="product-track" tabIndex={0} aria-label={`Produtos de ${label}`} onScroll={updatePosition} onKeyDown={(event) => {
      if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    }}>
      {products.map((product) => <ProductCard key={product.id} product={product} onOpenDetails={onOpenDetails} />)}
    </div>
  </div>;
}
