import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { demoProducts } from "../src/data/demo-menu.ts";
import { resolveSelectionLine, serializeSelection, restoreSelection, changeLineQuantity, priceSelection, complementQuote, selectionTotals, toCents, formatCents } from "../src/lib/selection.ts";

const catalog = JSON.parse(readFileSync(new URL("../src/data/menu.json", import.meta.url), "utf8"));
const draft = (overrides = {}) => ({ id: "test-line", productId: "combo-1", quantity: 1, addonIds: [], choices: {}, notes: "", ...overrides });
function resolved(item, products = catalog, demo = false) { const result = resolveSelectionLine(item, products, demo); assert.equal(result.ok, true, result.error); return result.line; }

test("moeda em centavos evita erros de ponto flutuante e formata pt-BR", () => {
  assert.equal(toCents(0.1) + toCents(0.2), 30);
  assert.equal(toCents(15.99), 1599);
  assert.equal(toCents(0.29), 29);
  assert.match(formatCents(4797), /47,97/);
  assert.throws(() => toCents(-1));
  assert.throws(() => toCents(Infinity));
  assert.throws(() => formatCents(1.5));
});

test("adiciona produtos, notas individuais e complementos gratuitos", () => {
  const a = resolved(draft({ quantity: 2, notes: " Sem cebolinha " }));
  const b = resolved(draft({ id: "other-note", notes: "Para compartilhar" }));
  const free = resolved(draft({ id: "free", productId: "wasabi" }));
  assert.equal(a.notes, "Sem cebolinha");
  assert.equal(a.unitPriceCents, 2500);
  assert.equal(a.subtotalCents, 5000);
  assert.equal(b.notes, "Para compartilhar");
  assert.equal(free.subtotalCents, 0);
  assert.deepEqual(selectionTotals([a, b, free]), { quantity: 4, subtotalCents: 7500 });
});

test("adicionais obrigatórios e opcionais somam por unidade e indisponíveis são bloqueados", () => {
  const base = draft({ productId: "demo-available", quantity: 3 });
  assert.equal(resolveSelectionLine(base, demoProducts, true).ok, false);
  const line = resolved({ ...base, addonIds: ["demo-addon", "demo-required"] }, demoProducts, true);
  assert.equal(line.unitPriceCents, 1234 + 123 + 250);
  assert.equal(line.subtotalCents, 4821);
  assert.equal(resolveSelectionLine({ ...base, addonIds: ["demo-required", "demo-disabled"] }, demoProducts, true).ok, false);
  assert.equal(resolveSelectionLine({ ...base, addonIds: ["demo-required", "demo-required"] }, demoProducts, true).ok, false);
  assert.equal(resolveSelectionLine({ ...base, addonIds: ["demo-required", "unknown"] }, demoProducts, true).ok, false);
});

test("sabores e preparo precisam de escolhas válidas, incluindo os dois temakis", () => {
  const combo = draft({ productId: "combo-10" });
  assert.equal(resolveSelectionLine(combo, catalog).ok, false);
  assert.equal(resolveSelectionLine({ ...combo, choices: { "Sabor do temaki": ["Salmão"] } }, catalog).ok, false);
  assert.equal(resolved({ ...combo, choices: { "Sabor do temaki": ["Salmão", "Camarão"] } }).subtotalCents, 7000);
  assert.equal(resolveSelectionLine({ ...combo, choices: { "Sabor do temaki": ["Kani", "Salmão"] } }, catalog).ok, false);
  assert.equal(resolveSelectionLine(draft({ productId: "temaki-salmao" }), catalog).ok, false);
  assert.equal(resolved(draft({ productId: "temaki-salmao", choices: { Preparo: ["Cru"] } })).unitPriceCents, 3700);
  assert.equal(resolveSelectionLine(draft({ productId: "combo-12" }), catalog).ok, false);
  assert.equal(resolved(draft({ productId: "combo-12", choices: { "Sabor dos 20 hots": ["Camarão"] } })).subtotalCents, 4500);
});

test("aumenta, diminui e remove ao chegar em zero, mantendo os cálculos", () => {
  let lines = [resolved(draft({ productId: "hot-salmao" }))];
  lines = changeLineQuantity(lines, "test-line", 3, catalog);
  assert.equal(selectionTotals(lines).subtotalCents, 4797);
  lines = changeLineQuantity(lines, "test-line", 2, catalog);
  assert.equal(selectionTotals(lines).subtotalCents, 3198);
  lines = changeLineQuantity(lines, "test-line", 100, catalog);
  assert.equal(lines[0].quantity, 2);
  lines = changeLineQuantity(lines, "test-line", 0, catalog);
  assert.deepEqual(selectionTotals(lines), { quantity: 0, subtotalCents: 0 });
});

test("persistência guarda apenas escolhas e recupera preços exclusivamente do catálogo atual", () => {
  const line = resolved(draft({ quantity: 2 }));
  const stored = serializeSelection([line]);
  assert.ok(!stored.includes("Price") && !stored.includes("price") && !stored.includes("subtotal"));
  const changedCatalog = catalog.map((p) => p.id === "combo-1" ? { ...p, price: 30 } : p);
  const malicious = JSON.parse(stored); malicious.items[0].unitPriceCents = 1; malicious.items[0].price = 0.01;
  const restored = restoreSelection(JSON.stringify(malicious), changedCatalog);
  assert.equal(restored.lines[0].unitPriceCents, 3000);
  assert.equal(restored.lines[0].subtotalCents, 6000);
  assert.ok(restored.notices.length > 0);
});

test("recuperação remove produtos excluídos, indisponíveis e configurações obsoletas", () => {
  const stored = serializeSelection([resolved(draft())]);
  assert.equal(restoreSelection(stored, []).lines.length, 0);
  const unavailable = catalog.map((p) => p.id === "combo-1" ? { ...p, availability: "unavailable" } : p);
  assert.equal(restoreSelection(stored, unavailable).lines.length, 0);
  const configured = resolved(draft({ productId: "demo-available", addonIds: ["demo-required"] }), demoProducts, true);
  const changed = demoProducts.map((p) => ({ ...p, optionalAddons: [] }));
  assert.equal(restoreSelection(serializeSelection([configured]), changed, true).lines.length, 0);
  const newPrice = demoProducts.map((p) => ({ ...p, optionalAddons: p.optionalAddons.map((a) => ({ ...a, price: 4 })) }));
  assert.equal(restoreSelection(serializeSelection([configured]), newPrice, true).lines[0].unitPriceCents, 1634);
});

test("valida dados corrompidos, versões, quantidades, notas e IDs duplicados", () => {
  assert.equal(restoreSelection("invalid-json", catalog).lines.length, 0);
  assert.equal(restoreSelection('{"version":99,"items":[]}', catalog).lines.length, 0);
  for (const quantity of [-1, 0, 100, 1.5, "2", null, NaN]) assert.equal(resolveSelectionLine(draft({ quantity }), catalog).ok, false);
  assert.equal(resolveSelectionLine(draft({ notes: "x".repeat(501) }), catalog).ok, false);
  const stored = JSON.stringify({ version: 1, items: [draft(), draft(), draft({ id: "bad", quantity: -4 })] });
  assert.equal(restoreSelection(stored, catalog).lines.length, 1);
  assert.equal(restoreSelection(JSON.stringify({ version: 1, items: Array(101).fill(draft()) }), catalog).lines.length, 0);
});

test("demonstração usa catálogo e recuperação isolados da seleção comercial", () => {
  const item = draft({ productId: "demo-available", addonIds: ["demo-required"] });
  assert.equal(resolveSelectionLine(item, demoProducts).ok, false);
  const stored = serializeSelection([resolved(item, demoProducts, true)]);
  assert.equal(restoreSelection(stored, catalog).lines.length, 0);
  assert.equal(restoreSelection(stored, demoProducts, true).lines.length, 1);
  assert.equal(resolveSelectionLine(draft({ productId: "demo-unavailable" }), demoProducts, true).ok, false);
});

test("uma cortesia por pedido soma todos os tipos e unidades de complementos", () => {
  const first = resolved(draft({ productId: "sunomono", quantity: 2 }));
  const second = resolved(draft({ id: "ginger", productId: "gengibre", quantity: 3 }));
  const third = resolved(draft({ id: "wasabi", productId: "wasabi" }));
  assert.equal(selectionTotals([first]).subtotalCents, 200);
  assert.equal(selectionTotals([first, second, third]).subtotalCents, 1000);
  const priced = priceSelection([first, second, third]);
  assert.deepEqual(priced.map((line) => line.subtotalCents), [200, 600, 200]);
  assert.equal(priced.reduce((sum, line) => sum + line.courtesyQuantity, 0), 1);
  assert.equal(selectionTotals(priced).subtotalCents, 1000, "Recalcular não duplica cobranças");
  assert.equal(first.subtotalCents, 0, "O estado original não é alterado");
});

test("alterar quantidade e remover complementos redistribui a única cortesia", () => {
  let lines = [resolved(draft({ productId: "sunomono", quantity: 2 })), resolved(draft({ id: "ginger", productId: "gengibre" }))];
  assert.equal(selectionTotals(lines).subtotalCents, 400);
  lines = changeLineQuantity(lines, "test-line", 1, catalog);
  assert.equal(selectionTotals(lines).subtotalCents, 200);
  lines = changeLineQuantity(lines, "test-line", 0, catalog);
  assert.equal(selectionTotals(lines).subtotalCents, 0);
  assert.equal(priceSelection(lines)[0].courtesyQuantity, 1);
  assert.equal(selectionTotals(changeLineQuantity(lines, "ginger", 99, catalog)).subtotalCents, 19600);
  assert.equal(selectionTotals(changeLineQuantity(lines, "ginger", 0, catalog)).subtotalCents, 0);
});

test("dividir complementos em linhas e observações diferentes não concede mais cortesias", () => {
  const lines = [resolved(draft({ productId: "wasabi", notes: "Separado" })), resolved(draft({ id: "other", productId: "wasabi", notes: "Em outro pote" }))];
  assert.equal(selectionTotals(lines).subtotalCents, 200);
  assert.equal(selectionTotals(restoreSelection(serializeSelection(lines), catalog).lines).subtotalCents, 200);
  assert.equal(complementQuote([], 3).extraCents, 400);
  assert.equal(complementQuote(lines, 2).extraCents, 400);
});
