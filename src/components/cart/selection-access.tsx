"use client";

import { ShoppingBag } from "lucide-react";
import { formatCents, selectionTotals } from "@/lib/selection";
import { useSelection } from "./selection-context";

export function SelectionButton() {
  const selection = useSelection();
  const { quantity } = selectionTotals(selection.lines);
  return <button type="button" onClick={selection.open} disabled={!selection.ready} aria-label={`Abrir meu pedido, ${quantity} produtos`} className="selection-button cart-header-button"><ShoppingBag size={20} aria-hidden="true" />{quantity > 0 && <span className="selection-badge" aria-hidden="true">{quantity}</span>}</button>;
}

export function SelectionAccess() {
  const selection = useSelection();
  const { quantity, subtotalCents } = selectionTotals(selection.lines);
  return <><div className="selection-feedback" role="status" aria-live="polite">{selection.message}</div>{selection.storageWarning && <p className="storage-warning">{selection.storageWarning}</p>}{selection.ready && quantity > 0 && <div className="floating-selection"><button type="button" onClick={selection.open} disabled={!selection.ready} aria-label={`Abrir meu pedido, ${quantity} produtos, subtotal ${formatCents(subtotalCents)}`}><span className="floating-selection-count">{quantity}</span><span>{selection.demo ? "Seleção de demonstração" : "Meu pedido"}</span><strong>{formatCents(subtotalCents)}</strong></button></div>}</>;
}
