import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const products = JSON.parse(readFileSync(new URL("../src/data/menu.json", import.meta.url), "utf8"));
const expectedCounts = { combos: 4, promocionais: 10, barcas: 2, hot: 4, hossomaki: 3, especiais: 4, niguiri: 3, temaki: 4, uramaki: 4, porcoes: 1, complementos: 3, bebidas: 14 };
const comboPrices = [25, 48, 58, 85, 45, 45, 45, 45, 35, 70, 40, 45, 35, 30];
const comboQuantities = [10, 21, 25, 34, 20, 20, 22, 20, 18, null, null, null, 15, 12];
const fixedPrices = { hot: 15.99, hossomaki: 15.99, especiais: 7.99, niguiri: 6.99, temaki: 37, uramaki: 15.99, porcoes: 15.99, complementos: 0 };
const drinkPrices = { skol: 6, agua: 5, "coca-1l": 8, "coca-600": 7, "coca-lata": 5, "delrio-1l": 8, "delrio-2l": 9, "coca-2l": 12, sprite: 5, "coca-zero-300": 5, "coca-zero-1l": 8, "coca-zero-2l": 13, delriozinho: 3, "suco-laranja": 6 };
assert.equal(products.length, 56);
assert.equal(new Set(products.map((p) => p.id)).size, 56, "IDs duplicados");
for (const [category, count] of Object.entries(expectedCounts)) assert.equal(products.filter((p) => p.category === category).length, count, category);
for (const product of products) {
  assert.ok(product.name && typeof product.description === "string");
  assert.ok(product.sourcePage >= 2 && product.sourcePage <= 6);
  if (product.image) assert.ok(existsSync(`public${product.image}`), product.image);
  if (product.imageLayout === "poster") {
    assert.equal(product.imagePrice, product.price, `Preço da arte desatualizado: ${product.id}`);
    assert.ok(product.imageWidth > 0 && product.imageHeight > 0, `Dimensões da arte: ${product.id}`);
  }
  if (Object.hasOwn(fixedPrices, product.category)) assert.equal(product.price, fixedPrices[product.category], product.id);
  if (product.category === "bebidas") assert.equal(product.price, drinkPrices[product.id], product.id);
  if (product.composition) assert.equal(product.composition.reduce((sum, part) => sum + part.quantity, 0), parseInt(product.unitLabel), product.id);
}
comboPrices.forEach((price, index) => {
  const product = products.find((p) => p.id === `combo-${index + 1}`);
  assert.equal(product.price, price, product.id);
  if (comboQuantities[index]) assert.equal(parseInt(product.unitLabel), comboQuantities[index]);
});
assert.equal(products.find((p) => p.id === "barca-1").price, 100);
assert.equal(products.find((p) => p.id === "barca-2").price, 110);
assert.equal(products.filter((p) => p.price === null).length, 0);
console.log("Cardápio verificado: 56 itens, 12 categorias, 14 combos, 2 barcas; preços, quantidades e imagens válidos.");
