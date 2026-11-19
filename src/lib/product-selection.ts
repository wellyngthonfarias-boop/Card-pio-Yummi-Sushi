import type { MenuProduct } from "@/types/menu";

// Seleção é uma lista para revisão, sem confirmação de estoque ou envio de pedido.
export function getSelectionBlockReason(product: MenuProduct, allowDemo = false): string | null {
  if (product.source === "demo" && !allowDemo) return "Produto fictício — apenas demonstração";
  if (product.availability === "unavailable") return "Produto indisponível";
  if (product.price === null) return "Consulte o valor com o restaurante";
  return null;
}

export function canSelectProduct(product: MenuProduct, allowDemo = false) {
  return getSelectionBlockReason(product, allowDemo) === null;
}
