import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { filterMenuProducts, groupMenuProducts } from "../src/lib/menu-search.ts";
import { canSelectProduct, getSelectionBlockReason } from "../src/lib/product-selection.ts";
import { demoCategories, demoProducts } from "../src/data/demo-menu.ts";
import { formatMenuPrice, formatProductPrice } from "../src/lib/format.ts";
import { resolveSelectionLine } from "../src/lib/selection.ts";

const products = JSON.parse(readFileSync(new URL("../src/data/menu.json", import.meta.url), "utf8"));
const categories = [...new Set(products.map((p) => p.category))].map((id) => ({ id, label: id, description: "" }));

test("catálogo real preserva 60 IDs únicos e não inclui dados fictícios ou estoque presumido", () => {
  assert.equal(products.length, 60);
  assert.equal(new Set(products.map((p) => p.id)).size, 60);
  for (const product of products) {
    assert.equal(product.source, "restaurant-menu");
    assert.equal(product.availability, "unconfirmed");
    assert.ok(Array.isArray(product.ingredients));
    assert.ok(Array.isArray(product.optionalAddons));
    assert.equal(product.optionalAddons.length, 0);
    assert.equal(product.featured, false);
    assert.ok(product.image.startsWith("/images/") || (product.id === "agua" && product.image === ""));
    assert.ok(product.pieceCount === null || Number.isInteger(product.pieceCount));
    assert.equal(product.allergens, undefined);
    assert.equal(product.nutrition, undefined);
  }
});

test("filtros mantêm as categorias e a ordem dos itens, inclusive com pesquisa vazia", () => {
  assert.equal(filterMenuProducts(products, categories, "todos", "   ").length, 60);
  for (const category of categories) {
    assert.deepEqual(filterMenuProducts(products, categories, category.id, ""), products.filter((p) => p.category === category.id));
  }
  assert.equal(filterMenuProducts(products, categories, "bebidas", "").length, 14);
});

test("busca ignora acentos, caixa e espaços e procura ingredientes da composição", () => {
  const accented = filterMenuProducts(products, categories, "todos", "CAMARÃO");
  assert.ok(accented.length > 0);
  assert.deepEqual(accented, filterMenuProducts(products, categories, "todos", " camarao "));
  assert.ok(filterMenuProducts(products, categories, "todos", "queijo").some((p) => p.id === "combo-1"));
  assert.deepEqual(filterMenuProducts(products, categories, "promocionais", "combo 10").map((p) => p.id), ["combo-10"]);
  assert.equal(filterMenuProducts(products, categories, "bebidas", "camarao").length, 0);
  assert.equal(filterMenuProducts(products, categories, "todos", "zzzzzz").length, 0);
});

test("grupos não duplicam itens nem exibem categorias vazias", () => {
  const groups = groupMenuProducts(products.filter((p) => p.category === "barcas"), categories);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].id, "barcas");
  assert.equal(groups[0].products.length, 2);
});

test("seleção de revisão bloqueia indisponíveis e preços desconhecidos, sem presumir estoque", () => {
  const base = { ...products[0], availability: "available" };
  assert.equal(canSelectProduct(base), true);
  assert.equal(canSelectProduct({ ...base, availability: "unavailable" }), false);
  assert.equal(getSelectionBlockReason({ ...base, availability: "unavailable" }), "Produto indisponível");
  assert.equal(canSelectProduct({ ...base, availability: "unconfirmed" }), true);
  assert.equal(canSelectProduct({ ...base, price: null }), false);
});

test("exemplos fictícios são identificados e nunca elegíveis para seleção comercial", () => {
  assert.equal(demoCategories.length, 1);
  assert.deepEqual(demoProducts.map((p) => p.availability), ["available", "unavailable", "unconfirmed"]);
  assert.ok(demoProducts.every((p) => p.source === "demo" && !canSelectProduct(p)));
  assert.equal(demoProducts[0].optionalAddons.length, 3);
  assert.ok(demoProducts.every((p) => !products.some((real) => real.id === p.id)));
});

test("correções do restaurante preservam sabores, preços e a cortesia limitada dos complementos", () => {
  assert.ok(!products.some((p) => ["sashimi", "shoyu", "tare"].includes(p.id)));
  assert.ok(!categories.some((c) => c.id === "sashimi"));
  const complements = products.filter((p) => p.category === "complementos");
  assert.deepEqual(complements.map((p) => p.id), ["sunomono", "gengibre", "wasabi"]);
  assert.ok(complements.every((p) => p.price === 0 && !p.note));
  assert.ok(complements.every((p) => p.description.includes("1 complemento de cortesia por pedido")));
  assert.equal(formatProductPrice(complements[0], []), "Cortesia disponível");
  const selected = resolveSelectionLine({ id: "free", productId: "wasabi", quantity: 1, addonIds: [], choices: {}, notes: "" }, products).line;
  assert.match(formatProductPrice(complements[0], [selected]), /2,00/);
  assert.equal(formatMenuPrice(0), "Sem cobrança");
  assert.equal(formatMenuPrice(null), "Consultar valor");
  const combo9 = products.find((p) => p.id === "combo-9");
  assert.equal(combo9.composition.at(-1).quantity, 3);
  assert.match(combo9.composition.at(-1).name, /salmão, kani e skin roll/);
  assert.equal(combo9.note, undefined);
  for (const id of ["combo-10", "combo-11"]) {
    const combo = products.find((p) => p.id === id);
    assert.deepEqual(combo.options[0].values, ["Salmão", "Misto", "Camarão"]);
    assert.equal(combo.note, undefined);
    assert.equal(combo.price, id === "combo-10" ? 70 : 40);
  }
});
