import type { MenuProduct } from "@/types/menu";

export const COMPLEMENT_EXTRA_CENTS = 200;
export const COMPLEMENT_POLICY_TEXT = "1 complemento de cortesia por pedido. Cada unidade extra custa R$ 2,00.";

export function isCourtesyComplement(product: MenuProduct): boolean {
  return product.category === "complementos" && product.source === "restaurant-menu";
}
