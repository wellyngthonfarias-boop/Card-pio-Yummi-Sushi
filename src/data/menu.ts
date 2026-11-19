import products from "./menu.json";
import type { MenuCategory, MenuProduct } from "@/types/menu";

// PDF conferido visualmente e atualizado com as correções do restaurante.
export const menuProducts = products as MenuProduct[];
export const categories: MenuCategory[] = [
  { id: "combos", label: "Combos", description: "Combinações de 10 a 34 peças para o seu momento Yummi." },
  { id: "promocionais", label: "Combos promocionais", description: "Os combos 5 a 14 do cardápio, com suas composições e opções." },
  { id: "barcas", label: "Barcas", description: "Uma seleção para compartilhar: 40 ou 45 peças." },
  { id: "hot", label: "Hots", description: "Porções de 5 peças." },
  { id: "hossomaki", label: "Hossomakis", description: "Porções de 5 peças com salmão, camarão ou kani." },
  { id: "especiais", label: "Sushis especiais", description: "Gunkans em porções de 2 unidades." },
  { id: "niguiri", label: "Niguiris", description: "Porções de 2 unidades." },
  { id: "temaki", label: "Temakis", description: "Disponíveis hot ou cru, nos sabores do cardápio." },
  { id: "uramaki", label: "Uramakis", description: "Porções de 5 peças." },
  { id: "porcoes", label: "Porções", description: "Para acompanhar." },
  { id: "complementos", label: "Complementos", description: "Sunomono, gengibre e wasabi sem cobrança." },
  { id: "bebidas", label: "Bebidas", description: "Refrigerantes, água, cerveja e suco de laranja." },
];

export const comboChangeFee = 10;
export const restaurantInfo = {
  hours: "Quinta a segunda-feira, das 18h às 22h20",
  instagram: "yummisushidelivery6",
  instagramUrl: "https://www.instagram.com/yummisushidelivery6/",
};
