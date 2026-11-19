"use client";

import { useEffect, useRef } from "react";
import { ProductVisual } from "./product-visual";
import { X } from "lucide-react";
import type { MenuProduct } from "@/types/menu";
import { categories } from "@/data/menu";
import { formatMenuPrice } from "@/lib/format";
import { ProductSelectionForm } from "@/components/cart/product-selection-form";

export function ProductDetails({ product, onClose }: { product: MenuProduct; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  const availability = product.availability === "unavailable" ? "Indisponível no momento" : product.availability === "available" ? "Disponível" : "Disponibilidade a confirmar com o restaurante";
  return (
    <dialog ref={dialog} className="product-dialog product-detail-dialog" aria-labelledby="detail-title" aria-describedby={product.description ? "detail-description" : undefined} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}>
      <div className="dialog-toolbar"><span>Detalhes do produto</span><button ref={closeButton} onClick={onClose} type="button" aria-label="Fechar detalhes"><X size={22} aria-hidden="true" /></button></div>
      <ProductSelectionForm product={product} onAdded={onClose}>
      <ProductVisual product={product} detail />
      <div className="detail-content">
        {product.source === "demo" && <p className="demo-note">DADOS FICTÍCIOS · Produto e preço exclusivos para demonstração.</p>}
        <p className="eyebrow">{categories.find((category) => category.id === product.category)?.label}</p>
        <h2 id="detail-title">{product.name}</h2>
        <div className="detail-labels">{product.unitLabel && <span className="unit-label">{product.unitLabel}</span>}{product.featured && <span className="unit-label">Destaque</span>}<span className={`availability ${product.availability}`}>{availability}</span></div>
        {product.description && <p id="detail-description" className="product-description">{product.description}</p>}
        {product.note && <p className="product-note">{product.note}</p>}
        {!product.composition && product.ingredients.length > 0 && <section className="detail-section"><h3>Ingredientes</h3><p>{product.ingredients.join(", ")}.</p></section>}
        {product.composition && <section className="detail-section"><h3>Composição{product.pieceCount ? ` · ${product.pieceCount} peças` : ""}</h3><ul className="detail-composition">{product.composition.map((part, index) => <li key={`${part.name}-${index}`}><strong>{part.quantity} {part.name}</strong>{part.ingredients && <span>{part.ingredients}</span>}</li>)}</ul></section>}
        {product.allergens?.providedByRestaurant && product.allergens.items.length > 0 && <section className="detail-section"><h3>Alergênicos</h3><p>{product.allergens.items.join(", ")}</p></section>}
        {product.nutrition?.providedByRestaurant && product.nutrition.values.length > 0 && <section className="detail-section"><h3>Informações nutricionais</h3><p>{product.nutrition.serving}</p><dl>{product.nutrition.values.map((entry) => <div key={entry.label} className="addon-row"><dt>{entry.label}</dt><dd>{entry.value}</dd></div>)}</dl></section>}
        <div className="detail-section detail-price"><div><p className="price-label">{product.source === "demo" ? "Preço fictício" : product.price === null ? "Preço não informado" : "Preço unitário"}</p><p className="price">{formatMenuPrice(product.price)}</p></div></div>
      </div>
      </ProductSelectionForm>
    </dialog>
  );
}
