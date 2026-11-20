import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { prepareWhatsAppOrder as prepareDeliveryOrder, formatWhatsAppMessage, WHATSAPP_NUMBER } from "../src/lib/whatsapp.ts";
import { deliveryZones } from "../src/data/delivery.ts";
import { formatCents } from "../src/lib/selection.ts";
import { demoProducts } from "../src/data/demo-menu.ts";

const catalog = JSON.parse(readFileSync(new URL("../src/data/menu.json", import.meta.url), "utf8"));
const draft = (extra = {}) => ({ id: "wa-line", productId: "hot-salmao", quantity: 2, addonIds: [], choices: {}, notes: "", ...extra });
const address = { street: "Rua de teste", number: "10", postalCode: "62000-000", zoneId: "centro" };
const prepareWhatsAppOrder = (items, products) => prepareDeliveryOrder(items, products, address);
test("nome opcional do cliente aparece na mensagem e preserva acentos", () => {
  const result = prepareDeliveryOrder([draft()], catalog, { ...address, customerName: "  João   José  " });
  assert.equal(result.ok, true);
  assert.ok(result.message.includes("*Cliente:* João José"));
  assert.equal(new URL(result.url).searchParams.get("text"), result.message);
  assert.ok(!prepareDeliveryOrder([draft()], catalog, address).message.includes("*Cliente:*"));
  assert.equal(prepareDeliveryOrder([draft()], catalog, { ...address, customerName: "x".repeat(81) }).ok, false);
});

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
  assert.ok(result.message.includes("Bairro: Centro"));
  assert.ok(result.message.includes(`Taxa de entrega: ${formatCents(600)}`));
  assert.ok(result.message.includes(`*TOTAL: ${formatCents(11044)}*`));
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

test("entrega exige endereço completo e um bairro cadastrado", () => {
  for (const invalid of [undefined, {}, { ...address, street: " " }, { ...address, number: "" }, { ...address, postalCode: "123" }, { ...address, zoneId: "fora-da-area" }]) {
    assert.equal(prepareDeliveryOrder([draft()], catalog, invalid).ok, false);
  }
  assert.equal(prepareDeliveryOrder([draft()], catalog, address, []).ok, false);
});

test("calcula cada taxa oficial e ignora frete e total adulterados no endereço", () => {
  for (const zone of deliveryZones) {
    const result = prepareDeliveryOrder([draft()], catalog, { ...address, zoneId: zone.id, feeCents: 1, totalCents: 1 });
    assert.equal(result.ok, true, zone.name);
    assert.ok(result.message.includes(`Bairro: ${zone.name}`));
    assert.ok(result.message.includes(`*SUBTOTAL: ${formatCents(3198)}*`));
    assert.ok(result.message.includes(`Taxa de entrega: ${formatCents(zone.feeCents)}`));
    assert.ok(result.message.includes(`*TOTAL: ${formatCents(3198 + zone.feeCents)}*`));
  }
});

test("reconcilia frete com a tabela atual, incluindo frete grátis explícito", () => {
  for (const feeCents of [0, 999]) {
    const result = prepareDeliveryOrder([draft()], catalog, address, [{ id: "centro", name: "Centro", feeCents }]);
    assert.equal(result.ok, true);
    assert.ok(result.message.includes(`Taxa de entrega: ${formatCents(feeCents)}`));
    assert.ok(result.message.includes(`*TOTAL: ${formatCents(3198 + feeCents)}*`));
  }
  for (const feeCents of [-1, 6.5, NaN, Infinity]) {
    assert.equal(prepareDeliveryOrder([draft()], catalog, address, [{ id: "centro", name: "Centro", feeCents }]).ok, false);
  }
});

test("codifica endereço com acentos e caracteres reservados, aceita S/N e normaliza CEP", () => {
  const result = prepareDeliveryOrder([draft()], catalog, { ...address, street: "Rua São João & José + Anexo", number: "S/N", postalCode: "62000000", zoneId: "sinha-saboia" });
  assert.equal(result.ok, true);
  assert.equal(new URL(result.url).searchParams.get("text"), result.message);
  assert.ok(result.message.includes("Rua: Rua São João & José + Anexo\nNúmero: S/N\nCEP: 62000-000\nBairro: Sinhá Sabóia"));
  assert.ok(!result.message.includes("não inclui eventuais taxas"));
});

test("complemento é opcional, preserva acentos e não altera taxa ou total", () => {
  for (const complement of [undefined, "", "   ", "  Apto 12, bloco São José & anexo  "]) {
    const result = prepareDeliveryOrder([draft()], catalog, { ...address, complement });
    assert.equal(result.ok, true);
    assert.equal(result.message.includes("Complemento:"), !!complement?.trim());
    if (complement?.trim()) assert.ok(result.message.includes(`Complemento: ${complement.trim()}`));
    assert.ok(result.message.includes(`*TOTAL: ${formatCents(3798)}*`));
    assert.equal(new URL(result.url).searchParams.get("text"), result.message);
  }
  for (const complement of ["x".repeat(121), 123, null]) assert.equal(prepareDeliveryOrder([draft()], catalog, { ...address, complement }).ok, false);
});

test("WhatsApp inclui uma cortesia e cobra todos os complementos extras no subtotal e total", () => {
  const result = prepareDeliveryOrder([draft({ productId: "combo-1", quantity: 1 }), draft({ id: "sun", productId: "sunomono", quantity: 2 }), draft({ id: "ginger", productId: "gengibre", quantity: 1 })], catalog, address);
  assert.equal(result.ok, true);
  assert.equal(result.message.match(/Cortesia: 1 unidade de complemento/g).length, 1);
  assert.equal(result.message.match(/Complementos extras: 1 ×/g).length, 2);
  assert.ok(result.message.includes(`*SUBTOTAL: ${formatCents(2900)}*`));
  assert.ok(result.message.includes(`Taxa de entrega: ${formatCents(600)}`));
  assert.ok(result.message.includes(`*TOTAL: ${formatCents(3500)}*`));
  const onlyComplements = prepareDeliveryOrder([draft({ productId: "wasabi", quantity: 3, subtotalCents: 0 })], catalog, address);
  assert.ok(onlyComplements.message.includes(`*SUBTOTAL: ${formatCents(400)}*`));
  assert.ok(onlyComplements.message.includes(`*TOTAL: ${formatCents(1000)}*`));
});
