import type { MenuProduct } from "@/types/menu";
import type { SelectionLine } from "@/types/selection";
import type { DeliveryZone, ResolvedDelivery } from "@/types/delivery";
import { deliveryZones } from "../data/delivery.ts";
import { resolveDelivery } from "./delivery.ts";
import { resolvePayment } from "./payment.ts";
import { formatCents, MAX_LINES, priceSelection, resolveSelectionLine, selectionTotals, toCents } from "./selection.ts";
import { isCourtesyComplement } from "./complement-policy.ts";

export const WHATSAPP_NUMBER = "5588992978164";
export const WHATSAPP_DISPLAY_NUMBER = "+55 88 99297-8164";

export function formatWhatsAppMessage(lines: readonly SelectionLine[], delivery: ResolvedDelivery): string {
  if (lines.length === 0) throw new Error("Adicione pelo menos um produto ao pedido.");
  const items = priceSelection(lines).map((line) => [
    ...(isCourtesyComplement(line.product) ? [
      ...(line.courtesyQuantity ? [`${line.product.name}: Complemento (cortesia)`] : []),
      ...(line.quantity > line.courtesyQuantity ? [`${line.quantity - line.courtesyQuantity > 1 ? `${line.quantity - line.courtesyQuantity}x ` : ""}${line.product.name}: Complemento (${formatCents(line.subtotalCents)})`] : []),
    ] : [`${line.quantity}x ${line.product.name}`]),
    ...Object.entries(line.choices).filter(([, values]) => values.length > 0).map(([name, values]) => `${name}: ${values.map((value, index) => values.length > 1 ? `${index + 1}º: ${value}` : value).join(" · ")}`),
    ...(line.addons.length ? [`Adicionais: ${line.addons.map((addon) => `${addon.name} (+ ${formatCents(toCents(addon.price))} por unidade)`).join(", ")}`] : []),
    ...(line.notes ? [`Observações: ${line.notes.replace(/\r?\n/g, "\n  ")}`] : []),
  ].join("\n"));
  const subtotalCents = selectionTotals(lines).subtotalCents;
  const totalCents = subtotalCents + delivery.feeCents;
  const payment = resolvePayment(delivery.address, totalCents);
  if (!payment.ok) throw new Error(payment.error);
  if (!Number.isSafeInteger(totalCents) || !Number.isSafeInteger(delivery.feeCents) || delivery.feeCents < 0) throw new Error("Total inválido.");
  return [
    "🍣 *PEDIDO — YUMMI SUSHI DELIVERY*", ...(delivery.address.customerName ? [`*Cliente:* ${delivery.address.customerName}`] : []), "*Itens selecionados:*",
    items.join("\n"),
    ["*Endereço de entrega:*", `Rua: ${delivery.address.street}`, `Número: ${delivery.address.number}`, ...(delivery.address.complement ? [`Complemento: ${delivery.address.complement}`] : []), `CEP: ${delivery.address.postalCode}`, `Bairro: ${delivery.neighborhood}`].join("\n"),
    [`*SUBTOTAL: ${formatCents(subtotalCents)}*`, `Taxa de entrega: ${formatCents(delivery.feeCents)}`, `*TOTAL: ${formatCents(totalCents)}*`].join("\n"),
    payment.message,
    "Olá! Gostaria de confirmar meu pedido.",
  ].join("\n\n");
}

type WhatsAppOrder = { ok: true; message: string; url: string } | { ok: false; error: string };

export function prepareWhatsAppOrder(items: readonly unknown[], catalog: readonly MenuProduct[], address: unknown, zones: readonly DeliveryZone[] = deliveryZones): WhatsAppOrder {
  if (!Array.isArray(items) || items.length === 0) return { ok: false, error: "Adicione pelo menos um produto ao pedido." };
  if (items.length > MAX_LINES) return { ok: false, error: "O pedido ultrapassa o limite de itens. Revise sua seleção." };
  const lines: SelectionLine[] = [];
  for (const item of items) {
    // Revalidar tudo no clique; nunca enviar uma seleção parcial ou usar preços armazenados.
    const result = resolveSelectionLine(item, catalog, false);
    if (!result.ok) return { ok: false, error: `Não é possível abrir o pedido. ${result.error}` };
    if (lines.some((line) => line.id === result.line.id)) return { ok: false, error: "Há itens duplicados com o mesmo identificador. Revise sua seleção." };
    lines.push(result.line);
  }
  const resolved = resolveDelivery(address, zones);
  if (!resolved.ok) return resolved;
  const payment = resolvePayment(address, selectionTotals(lines).subtotalCents + resolved.delivery.feeCents);
  if (!payment.ok) return payment;
  Object.assign(resolved.delivery.address, { paymentMethod: (address as Record<string, string>).paymentMethod, changeMode: (address as Record<string, string>).changeMode, changeFor: (address as Record<string, string>).changeFor });
  try {
    const message = formatWhatsAppMessage(lines, resolved.delivery);
    return { ok: true, message, url: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}` };
  } catch { return { ok: false, error: "Não foi possível preparar a mensagem. Revise as observações do pedido." }; }
}
