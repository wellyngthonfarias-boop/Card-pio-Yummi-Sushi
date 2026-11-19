import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { prepareWhatsAppOrder, formatWhatsAppMessage, WHATSAPP_NUMBER } from "../src/lib/whatsapp.ts";
import { formatCents } from "../src/lib/selection.ts";
import { demoProducts } from "../src/data/demo-menu.ts";

const catalog = JSON.parse(readFileSync(new URL("../src/data/menu.json", import.meta.url), "utf8"));
const draft = (extra = {}) => ({ id: "wa-line", productId: "hot-salmao", quantity: 2, addonIds: [], choices: {}, notes: "", ...extra });

test("link aponta exclusivamente para o número oficial e codifica acentos, emoji e caracteres reservados", () => {
  const notes = "Sem cebolinha & limão + gengibre? 50% 🍣\nObservação: atenção à porção!";
  const result = prepareWhatsAppOrder([draft({ notes })], catalog);
  assert.equal(result.ok, true);
  assert.equal(WHATSAPP_NUMBER, "5588992978164");
  assert.ok(result.url.startsWith("https://wa.me/5588992978164?text="));
  assert.equal(result.url, `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(result.message)}`);
  assert.equal(new URL(result.url).searchParams.get("text"), result.message);
  assert.ok(result.message.includes("🍣 *PEDIDO — YUMMI SUSHI DELIVERY*"));
  assert.ok(result.message.includes("Sem cebolinha & limão + gengibre? 50% 🍣\n  Observação: atenção à porção!"));
});

test("formata quantidades, adicionais, sabores e subtotal sem taxas inventadas", () => {
  const withAddons = catalog.map((p) => p.id === "hot-salmao" ? { ...p, optionalAddons: [{ id: "test-extra", name: "Adicional de teste", price: 1.23, availability: "available" }] } : p);
  const result = prepareWhatsAppOrder([
    draft({ addonIds: ["test-extra"], notes: "Sem cebolinha" }),
    draft({ id: "wa-combo", productId: "combo-10", quantity: 1, choices: { "Sabor do temaki": ["Salmão", "Camarão"] } }),
  ], withAddons);
  assert.equal(result.ok, true);
  assert.ok(result.message.includes("2x Hot de salmão"));
  assert.ok(result.message.includes("Apresentação: 5 peças"));
  assert.ok(result.message.includes(`Adicionais: Adicional de teste (+ ${formatCents(123)} por unidade)`));
  assert.ok(result.message.includes("Observações: Sem cebolinha"));
  assert.ok(result.message.includes(`Subtotal do item: ${formatCents(3444)}`));
  assert.ok(result.message.includes("1x 10º Combo"));
  assert.ok(result.message.includes("Sabor do temaki: 1º: Salmão · 2º: Camarão"));
  assert.ok(result.message.includes(`*SUBTOTAL: ${formatCents(10444)}*`));
  assert.ok(result.message.includes("Olá! Gostaria de confirmar meu pedido."));
  assert.ok(result.message.endsWith("Observação:\nO subtotal não inclui eventuais taxas de entrega."));
});

test("bloqueia pedido vazio, produtos indisponíveis, removidos e configurações incompletas", () => {
  assert.equal(prepareWhatsAppOrder([], catalog).ok, false);
  assert.throws(() => formatWhatsAppMessage([]));
  const unavailable = catalog.map((p) => p.id === "hot-salmao" ? { ...p, availability: "unavailable" } : p);
  assert.equal(prepareWhatsAppOrder([draft()], unavailable).ok, false);
  assert.equal(prepareWhatsAppOrder([draft()], []).ok, false);
  assert.equal(prepareWhatsAppOrder([draft({ productId: "combo-10" })], catalog).ok, false);
  assert.equal(prepareWhatsAppOrder([draft(), draft()], catalog).ok, false);
  assert.equal(prepareWhatsAppOrder([draft({ productId: "demo-available", addonIds: ["demo-required"] })], demoProducts).ok, false);
});

test("revalida catálogo no momento de preparar e ignora subtotais adulterados", () => {
  const changed = catalog.map((p) => p.id === "hot-salmao" ? { ...p, price: 20 } : p);
  const items = [draft({ unitPriceCents: 1, subtotalCents: 2, product: { name: "Nome falso", price: 0.01 } })];
  const before = JSON.stringify(items);
  const result = prepareWhatsAppOrder(items, changed);
  assert.equal(result.ok, true);
  assert.ok(result.message.includes(`Subtotal do item: ${formatCents(4000)}`));
  assert.ok(!result.message.includes("Nome falso"));
  assert.equal(JSON.stringify(items), before, "Não limpa nem altera a seleção");
});

test("qualquer item inválido bloqueia todo o pedido e adicionais indisponíveis são rejeitados", () => {
  const items = [draft(), draft({ id: "other", productId: "removed" })];
  assert.equal(prepareWhatsAppOrder(items, catalog).ok, false);
  const addons = catalog.map((p) => p.id === "hot-salmao" ? { ...p, optionalAddons: [{ id: "extra", name: "Extra", price: 2, availability: "unavailable" }] } : p);
  assert.equal(prepareWhatsAppOrder([draft({ addonIds: ["extra"] })], addons).ok, false);
});

test("preserva apresentação das bebidas e complementos gratuitos", () => {
  const result = prepareWhatsAppOrder([draft({ productId: "coca-1l", quantity: 1 }), draft({ id: "free", productId: "wasabi", quantity: 1 })], catalog);
  assert.equal(result.ok, true);
  assert.ok(result.message.includes("Apresentação: 1 litro"));
  assert.ok(result.message.includes(`Subtotal do item: ${formatCents(0)}`));
  assert.ok(result.message.includes(`*SUBTOTAL: ${formatCents(800)}*`));
  assert.ok(!result.message.includes("Adicionais:"));
  assert.ok(!result.message.includes("Observações:"));
});
