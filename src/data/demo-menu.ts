import type { MenuCategory, MenuProduct } from "@/types/menu";

// DADOS FICTÍCIOS. Fixtures de desenvolvimento/testes, nunca importadas no catálogo comercial.
export const demoCategories = [
  { id: "combos", label: "Categoria fictícia · Combos", description: "Exclusiva para testes; sem oferta comercial." },
] satisfies MenuCategory[];

const example: MenuProduct = {
  id: "demo-available", name: "Produto fictício disponível", category: "combos",
  description: "Demonstração técnica; não pertence ao cardápio do restaurante.",
  source: "demo", price: 12.34, unitLabel: "4 peças fictícias", pieceCount: 4,
  ingredients: ["Ingrediente fictício A", "Ingrediente fictício B"],
  availability: "available", featured: true, image: "/images/placeholder-combinado.svg", imageKind: "illustration",
  optionalAddons: [
    { id: "demo-addon", name: "Adicional fictício", price: 1.23, availability: "available" },
    { id: "demo-required", name: "Adicional obrigatório fictício", price: 2.50, availability: "available", required: true },
    { id: "demo-disabled", name: "Adicional indisponível fictício", price: 0.75, availability: "unavailable" },
  ],
};

export const demoProducts: MenuProduct[] = [
  example,
  { ...example, id: "demo-unavailable", name: "Produto fictício indisponível", availability: "unavailable", featured: false, optionalAddons: [] },
  { ...example, id: "demo-unconfirmed", name: "Produto fictício a confirmar", availability: "unconfirmed", featured: false, optionalAddons: [] },
];
