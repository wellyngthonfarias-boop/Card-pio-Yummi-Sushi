import type { MenuProduct } from "@/types/menu";
import type { SelectionDraft, SelectionLine } from "@/types/selection";
import { getSelectionBlockReason } from "./product-selection.ts";

export const MAX_QUANTITY = 99;
export const MAX_LINES = 100;
export const MAX_NOTES = 500;
export const STORAGE_VERSION = 1;

export function toCents(value: number) {
  const cents = Math.round(value * 100);
  if (!Number.isFinite(value) || value < 0 || !Number.isSafeInteger(cents) || cents > 100_000_000) throw new Error("Preço inválido no catálogo.");
  return cents;
}

export function formatCents(cents: number) {
  if (!Number.isSafeInteger(cents)) throw new Error("Valor monetário inválido.");
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type Resolution = { ok: true; line: SelectionLine } | { ok: false; error: string };

export function resolveSelectionLine(raw: unknown, catalog: readonly MenuProduct[], allowDemo = false): Resolution {
  if (!isRecord(raw) || typeof raw.id !== "string" || !/^[\w-]{1,80}$/.test(raw.id) || typeof raw.productId !== "string") return { ok: false, error: "Item inválido." };
  const product = catalog.find((entry) => entry.id === raw.productId);
  if (!product) return { ok: false, error: "Produto removido do cardápio." };
  const reason = getSelectionBlockReason(product, allowDemo);
  if (reason) return { ok: false, error: `${product.name}: ${reason}.` };
  if (!Number.isInteger(raw.quantity) || (raw.quantity as number) < 1 || (raw.quantity as number) > MAX_QUANTITY) return { ok: false, error: "A quantidade deve ser de 1 a 99." };
  if (typeof raw.notes !== "string" || raw.notes.length > MAX_NOTES) return { ok: false, error: "Observação inválida (máximo de 500 caracteres)." };
  if (!Array.isArray(raw.addonIds) || raw.addonIds.length > 30 || !raw.addonIds.every((id) => typeof id === "string") || new Set(raw.addonIds).size !== raw.addonIds.length) return { ok: false, error: "Adicionais inválidos." };
  const addonIds = raw.addonIds as string[];
  const addons = product.optionalAddons.filter((addon) => addonIds.includes(addon.id));
  if (addons.length !== addonIds.length || addons.some((addon) => addon.availability === "unavailable")) return { ok: false, error: "Um adicional foi removido ou está indisponível. Revise o item." };
  if (product.optionalAddons.some((addon) => addon.required && !addonIds.includes(addon.id))) return { ok: false, error: "Selecione todos os adicionais obrigatórios." };
  if (!isRecord(raw.choices)) return { ok: false, error: "Opções do produto inválidas." };
  const options = product.options ?? [];
  if (Object.keys(raw.choices).some((key) => !options.some((option) => option.name === key))) return { ok: false, error: "Uma opção mudou no catálogo. Escolha novamente." };
  const choices: Record<string, string[]> = {};
  for (const option of options) {
    const selected = raw.choices[option.name] ?? [];
    if (!Array.isArray(selected) || Array.from(selected).some((value) => typeof value !== "string" || !option.values.includes(value)) || ((option.required !== false || selected.length > 0) && selected.length !== (option.selections ?? 1))) return { ok: false, error: `Escolha ${option.name.toLocaleLowerCase("pt-BR")}${(option.selections ?? 1) > 1 ? " para cada unidade" : ""}.` };
    choices[option.name] = [...selected];
  }
  try {
    const unitPriceCents = toCents(product.price!) + addons.reduce((sum, addon) => sum + toCents(addon.price), 0);
    const subtotalCents = unitPriceCents * (raw.quantity as number);
    if (!Number.isSafeInteger(subtotalCents)) throw new Error("Subtotal inválido.");
    return { ok: true, line: { id: raw.id, productId: product.id, quantity: raw.quantity as number, notes: raw.notes.trim(), addonIds: addons.map((addon) => addon.id), choices, product, addons, unitPriceCents, subtotalCents } };
  } catch { return { ok: false, error: "Preço inválido no catálogo. Consulte o restaurante." }; }
}

export function lineDraft(line: SelectionDraft): SelectionDraft {
  return { id: line.id, productId: line.productId, quantity: line.quantity, addonIds: [...line.addonIds], choices: line.choices, notes: line.notes };
}

export function serializeSelection(lines: readonly SelectionDraft[]) {
  // Nunca persistir preços, nomes ou disponibilidade: sempre consultar o catálogo atual.
  return JSON.stringify({ version: STORAGE_VERSION, items: lines.map(lineDraft) });
}

export function restoreSelection(serialized: string | null, catalog: readonly MenuProduct[], allowDemo = false): { lines: SelectionLine[]; notices: string[] } {
  if (!serialized) return { lines: [], notices: [] };
  try {
    if (serialized.length > 200_000) throw new Error();
    const data: unknown = JSON.parse(serialized);
    if (!isRecord(data) || data.version !== STORAGE_VERSION || !Array.isArray(data.items) || data.items.length > MAX_LINES) throw new Error();
    const lines: SelectionLine[] = [];
    let removed = 0;
    for (const item of data.items) {
      const result = resolveSelectionLine(item, catalog, allowDemo);
      if (result.ok && !lines.some((line) => line.id === result.line.id)) lines.push(result.line);
      else removed++;
    }
    return { lines, notices: removed ? ["Sua seleção foi revisada: itens inválidos, removidos ou indisponíveis foram retirados. Os preços seguem o cardápio atual."] : lines.length ? ["Seleção recuperada com os preços do cardápio atual. Revise os valores antes de mostrar ao garçom."] : [] };
  } catch { return { lines: [], notices: ["Não foi possível recuperar a seleção anterior. Comece uma nova seleção."] }; }
}

export function selectionTotals(lines: readonly SelectionLine[]) {
  return { quantity: lines.reduce((sum, line) => sum + line.quantity, 0), subtotalCents: lines.reduce((sum, line) => sum + line.subtotalCents, 0) };
}

export function changeLineQuantity(lines: readonly SelectionLine[], id: string, quantity: number, catalog: readonly MenuProduct[], allowDemo = false) {
  if (quantity === 0) return lines.filter((line) => line.id !== id);
  return lines.map((line) => {
    if (line.id !== id) return line;
    const result = resolveSelectionLine({ ...lineDraft(line), quantity }, catalog, allowDemo);
    return result.ok ? result.line : line;
  });
}
