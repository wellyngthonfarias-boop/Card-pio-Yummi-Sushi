import type { MenuProduct, ProductAddon } from "./menu";

export type SelectionDraft = {
  id: string;
  productId: string;
  quantity: number;
  addonIds: string[];
  choices: Record<string, string[]>;
  notes: string;
};
export type SelectionLine = SelectionDraft & {
  product: MenuProduct;
  addons: ProductAddon[];
  unitPriceCents: number;
  subtotalCents: number;
};
