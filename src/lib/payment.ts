import { formatCents } from "./selection.ts";
export const paymentMethods = { cash: "Dinheiro", pix: "Pix", credit: "Cartão de crédito", debit: "Cartão de débito" } as const;
export function resolvePayment(raw: unknown, totalCents: number): { ok: true; message: string } | { ok: false; error: string } {
  const value = raw as { paymentMethod?: string; changeMode?: string; changeFor?: string } | null;
  const method = value?.paymentMethod;
  if (!method || !Object.hasOwn(paymentMethods, method)) return { ok: false, error: "Selecione a forma de pagamento." };
  if (method !== "cash") return { ok: true, message: `*Pagamento:* ${paymentMethods[method as keyof typeof paymentMethods]}` };
  if (value?.changeMode === "exact") return { ok: true, message: "*Pagamento:* Dinheiro\nNão precisa de troco." };
  if (value?.changeMode !== "change" || typeof value.changeFor !== "string" || !/^\d{1,7}([,.]\d{1,2})?$/.test(value.changeFor.trim())) return { ok: false, error: "Informe para quanto precisa de troco (ex.: 100,00)." };
  const [whole, fraction = ""] = value.changeFor.trim().replace(",", ".").split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(totalCents) || cents < totalCents) return { ok: false, error: "O valor para troco deve ser igual ou maior que o total com entrega." };
  return { ok: true, message: `*Pagamento:* Dinheiro\nTroco para: ${formatCents(cents)}\nTroco a devolver: ${formatCents(cents - totalCents)}` };
}
