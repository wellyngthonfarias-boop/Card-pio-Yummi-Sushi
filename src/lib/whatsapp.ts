import type { MenuProduct } from "@/types/menu";
import type { SelectionLine } from "@/types/selection";
import { formatCents, MAX_LINES, resolveSelectionLine, selectionTotals, toCents } from "./selection.ts";

export const WHATSAPP_NUMBER = "5588992978164";
export const WHATSAPP_DISPLAY_NUMBER = "+55 88 99297-8164";

export function formatWhatsAppMessage(lines: readonly SelectionLine[]): string {
  if (lines.length === 0) throw new Error("Adicione pelo menos um produto ao pedido.");
  const items = lines.map((line) => [
    `${line.quantity}x ${line.product.name}`,
    ...(line.product.unitLabel ? [`Apresentação: ${line.product.unitLabel}`] : []),
    ...Object.entries(line.choices).filter(([, values]) => values.length > 0).map(([name, values]) => `${name}: ${values.map((value, index) => values.length > 1 ? `${index + 1}º: ${value}` : value).join(" · ")}`),
    ...(line.addons.length ? [`Adicionais: ${line.addons.map((addon) => `${addon.name} (+ ${formatCents(toCents(addon.price))} por unidade)`).join(", ")}`] : []),
    ...(line.notes ? [`Observações: ${line.notes.replace(/\r?\n/g, "\n  ")}`] : []),
    `Subtotal do item: ${formatCents(line.subtotalCents)}`,
  ].join("\n"));
  return [
    "🍣 *PEDIDO — YUMMI SUSHI DELIVERY*", "*Itens selecionados:*",
    ...items, `*SUBTOTAL: ${formatCents(selectionTotals(lines).subtotalCents)}*`,
    "Olá! Gostaria de confirmar meu pedido.",
    "Observação:\nO subtotal não inclui eventuais taxas de entrega.",
  ].join("\n\n");
}

type WhatsAppOrder = { ok: true; message: string; url: string } | { ok: false; error: string };

export function prepareWhatsAppOrder(items: readonly unknown[], catalog: readonly MenuProduct[]): WhatsAppOrder {
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
  try {
    const message = formatWhatsAppMessage(lines);
    return { ok: true, message, url: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}` };
  } catch { return { ok: false, error: "Não foi possível preparar a mensagem. Revise as observações do pedido." }; }
}
