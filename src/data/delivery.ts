import type { DeliveryZone } from "@/types/delivery";

// Taxas confirmadas pelo estabelecimento. Valores em centavos inteiros.
export const deliveryZones: readonly DeliveryZone[] = [
  { id: "alto-da-rolinha", name: "Alto da Rolinha", feeCents: 800 },
  { id: "alto-do-cristo", name: "Alto do Cristo", feeCents: 500 },
  { id: "alto-novo", name: "Alto Novo", feeCents: 600 },
  { id: "beira-rio", name: "Beira Rio", feeCents: 600 },
  { id: "boa-vizinhanca", name: "Boa Vizinhança", feeCents: 800 },
  { id: "campo-dos-velhos", name: "Campo dos Velhos", feeCents: 500 },
  { id: "centro", name: "Centro", feeCents: 600 },
  { id: "cohab-iii", name: "Cohab III", feeCents: 700 },
  { id: "derby", name: "Derby", feeCents: 600 },
  { id: "dom-jose-i", name: "Dom José I", feeCents: 600 },
  { id: "dom-jose-ii", name: "Dom José II", feeCents: 600 },
  { id: "domingos-olimpio", name: "Domingos Olímpio", feeCents: 600 },
  { id: "pedrinhas", name: "Pedrinhas", feeCents: 600 },
  { id: "renato-parente", name: "Renato Parente", feeCents: 700 },
  { id: "santa-casa", name: "Santa Casa", feeCents: 600 },
  { id: "santo-antonio", name: "Santo Antônio", feeCents: 800 },
  { id: "sinha-saboia", name: "Sinhá Sabóia", feeCents: 800 },
  { id: "sumare", name: "Sumaré", feeCents: 600 },
  { id: "terrenos-novos", name: "Terrenos Novos", feeCents: 700 },
  { id: "vila-uniao", name: "Vila União", feeCents: 700 },
];
