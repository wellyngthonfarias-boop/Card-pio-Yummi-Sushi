export function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatMenuPrice(value: number | null) {
  return value === null ? "Consultar valor" : value === 0 ? "Sem cobrança" : formatPrice(value);
}
import type { MenuProduct } from "@/types/menu";
import type { SelectionLine } from "@/types/selection";
import { isCourtesyComplement } from "./complement-policy.ts";
import { complementQuote, formatCents } from "./selection.ts";


export function formatProductPrice(product: MenuProduct, lines: readonly SelectionLine[]) {
  if (!isCourtesyComplement(product)) return formatMenuPrice(product.price);
  const quote = complementQuote(lines, 1);
  return quote.courtesyQuantity ? "Cortesia disponível" : formatCents(quote.extraCents);
}
