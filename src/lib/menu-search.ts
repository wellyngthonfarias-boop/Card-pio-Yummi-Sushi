import type { CategoryFilter, MenuCategory, MenuProduct } from "@/types/menu";

export function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

export function filterMenuProducts(products: readonly MenuProduct[], categories: readonly MenuCategory[], category: CategoryFilter, search: string) {
  const terms = normalizeSearch(search).trim().split(/\s+/).filter(Boolean);
  return products.filter((product) => {
    if (category !== "todos" && category !== product.category) return false;
    const searchable = normalizeSearch([
      product.id.replaceAll("-", " "), product.name, product.description,
      product.unitLabel, ...product.ingredients,
      ...product.options?.flatMap((option) => option.values) ?? [],
      categories.find((entry) => entry.id === product.category)?.label,
      ...product.composition?.map((part) => `${part.name} ${part.ingredients}`) ?? [],
    ].join(" "));
    return terms.every((term) => searchable.includes(term));
  });
}

export function groupMenuProducts(products: readonly MenuProduct[], categories: readonly MenuCategory[]) {
  return categories.map((category) => ({ ...category, products: products.filter((product) => product.category === category.id) })).filter((category) => category.products.length > 0);
}
