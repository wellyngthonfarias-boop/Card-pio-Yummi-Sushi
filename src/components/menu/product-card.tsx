import { ProductVisual } from "./product-visual";
import { Fish, GlassWater, UtensilsCrossed } from "lucide-react";
import type { MenuProduct } from "@/types/menu";
import { formatMenuPrice } from "@/lib/format";
import { getSelectionBlockReason } from "@/lib/product-selection";
import { useSelection } from "@/components/cart/selection-context";

export function ProductCard({ product, onOpenDetails }: { product: MenuProduct; onOpenDetails: (product: MenuProduct) => void }) {
  const Icon = product.category === "bebidas" ? GlassWater : product.category === "complementos" || product.category === "porcoes" ? UtensilsCrossed : Fish;
  const selection = useSelection();
  const selectionReason = getSelectionBlockReason(product, selection.demo);
  return (
    <article className={`product-card ${product.availability === "unavailable" ? "product-unavailable" : ""}`} aria-labelledby={`title-${product.id}`}>
      {product.imageKind !== "placeholder" ? <ProductVisual product={product} /> : <div className="product-symbol" aria-hidden="true"><Icon size={30} strokeWidth={1.3} /></div>}
      <div className="product-content">
        <h4 id={`title-${product.id}`}>{product.name}</h4>
        {product.source === "demo" && <p className="product-note">DADOS FICTÍCIOS · Apenas demonstração</p>}
        {product.featured && <p className="featured-label">Destaque</p>}
        {product.availability === "unavailable" && <p className="availability unavailable">Indisponível no momento</p>}
        {product.unitLabel && <p className="unit-label">{product.unitLabel}</p>}
        {product.description && <p className="product-description">{product.description}</p>}
        {product.composition && <p className="card-composition">{product.composition.map((part) => `${part.quantity} ${part.name}`).join(" · ")}</p>}
        <button type="button" className="product-details-button" onClick={() => onOpenDetails(product)} aria-label={`Ver detalhes: ${product.name}${product.unitLabel ? ` · ${product.unitLabel}` : ""}`} aria-haspopup="dialog">Ver detalhes</button>
        <div className="product-bottom"><div>{(product.price === null || product.source === "demo") && <p className="price-label">{product.source === "demo" ? "Preço fictício" : "Preço não informado"}</p>}<p className="price">{formatMenuPrice(product.price)}</p></div><button type="button" disabled={!!selectionReason || !selection.ready} title={selectionReason ?? "Personalizar e adicionar"} aria-label={`Adicionar ${product.name}${product.unitLabel ? ` · ${product.unitLabel}` : ""}`} className="card-add-button" onClick={() => onOpenDetails(product)}>{selectionReason ? "Indisponível" : "Adicionar"}</button></div>
      </div>
    </article>
  );
}
