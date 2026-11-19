import type { Restaurant } from "@/types/restaurant";

export const restaurant = {
  name: "Yummi Sushi Delivery",
  description: "Conheça o Yummi Sushi Delivery. Culinária japonesa para aproveitar no restaurante ou receber em casa.",
  serviceModes: [
    {
      id: "presencial",
      title: "À mesa, no seu tempo",
      description: "A proposta é simples: explorar o cardápio pelo celular e mostrar sua seleção ao garçom.",
    },
    {
      id: "delivery",
      title: "Seu Yummi em casa",
      description: "Em breve, escolha seus favoritos e envie seu pedido pelo WhatsApp do restaurante.",
    },
  ],
} as const satisfies Restaurant;
