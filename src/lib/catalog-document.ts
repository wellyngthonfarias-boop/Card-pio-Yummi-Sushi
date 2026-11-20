import type { MenuProduct } from "@/types/menu";
import type { DeliveryZone } from "@/types/delivery";
export type CatalogDocument = { products: MenuProduct[]; zones: DeliveryZone[]; hours: string; revision: number };
export function validCatalog(value: unknown): value is CatalogDocument {
  try { return checkCatalog(value); } catch { return false; }
}
function checkCatalog(value: unknown): value is CatalogDocument {
  if (!value || typeof value !== "object") return false;
  const d = value as CatalogDocument;
  const categories = ["combos", "promocionais", "barcas", "hot", "hossomaki", "especiais", "niguiri", "temaki", "uramaki", "porcoes", "complementos", "bebidas"];
  const text = (s: unknown, max: number) => typeof s === "string" && s.length <= max;
  return Number.isSafeInteger(d.revision) && d.revision >= 0 && text(d.hours, 200) && Array.isArray(d.products) && d.products.length <= 500 && new Set(d.products.map(p => p.id)).size === d.products.length && d.products.every(p =>
    /^[a-z0-9-]{1,80}$/.test(p.id) && text(p.name, 120) && p.name.trim().length > 0 && text(p.description, 1000) && text(p.unitLabel, 100) && categories.includes(p.category) && p.source === "restaurant-menu" && ["available", "unavailable", "unconfirmed"].includes(p.availability) && typeof p.featured === "boolean" && typeof p.price === "number" && Number.isFinite(p.price) && p.price >= 0 && p.price <= 100000 && (p.category !== "complementos" || p.price === 0) && Array.isArray(p.ingredients) && p.ingredients.every(s => text(s, 200)) && Array.isArray(p.optionalAddons) && p.optionalAddons.length <= 30 && p.optionalAddons.every(a => text(a.id,80) && text(a.name,120) && Number.isFinite(a.price) && a.price >= 0 && ["available","unavailable","unconfirmed"].includes(a.availability)) && (!p.options || p.options.every(o => text(o.name,100) && Array.isArray(o.values) && o.values.every(v=>text(v,120)))) && (!p.composition || p.composition.every(c=>Number.isInteger(c.quantity) && c.quantity > 0 && text(c.name,120) && text(c.ingredients,500))) && text(p.image,350000) && ( /^\/api\/images\/[a-f0-9-]{36}$/.test(p.image) ||p.image === "" || /^\/images\/[\w/.-]+$/.test(p.image) || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p.image))
  ) && Array.isArray(d.zones) && d.zones.length <= 200 && new Set(d.zones.map(z=>z.id)).size === d.zones.length && d.zones.every(z => /^[a-z0-9-]{1,80}$/.test(z.id) && text(z.name,100) && z.name.trim() && Number.isSafeInteger(z.feeCents) && z.feeCents >= 0 && z.feeCents <= 100000);
}
