import test from "node:test";
import assert from "node:assert/strict";
import { deliveryZones } from "../src/data/delivery.ts";
import { formatPostalCode, resolveDelivery } from "../src/lib/delivery.ts";

test("a tabela contém exatamente os bairros e preços confirmados", () => {
  const grouped = new Map([
    [800, ["Sinhá Sabóia", "Santo Antônio", "Alto da Rolinha", "Boa Vizinhança"]],
    [600, ["Pedrinhas", "Derby", "Centro", "Beira Rio", "Alto Novo", "Dom José I", "Dom José II", "Domingos Olímpio", "Sumaré", "Santa Casa"]],
    [700, ["Vila União", "Terrenos Novos", "Renato Parente", "Cohab III"]],
    [500, ["Campo dos Velhos", "Alto do Cristo"]],
  ]);
  assert.equal(deliveryZones.length, 20);
  assert.equal(new Set(deliveryZones.map((zone) => zone.id)).size, 20);
  for (const [fee, names] of grouped) {
    assert.deepEqual(deliveryZones.filter((zone) => zone.feeCents === fee).map((zone) => zone.name).sort(), names.sort());
  }
});

test("CEP é formatado sem consultas externas e textos do endereço são validados", () => {
  assert.equal(formatPostalCode("62000000"), "62000-000");
  assert.equal(formatPostalCode("62000-000"), "62000-000");
  const address = { street: "  Rua   Teste  ", number: " S/N ", postalCode: "62000000", zoneId: "centro" };
  const result = resolveDelivery(address, deliveryZones);
  assert.equal(result.ok, true);
  assert.equal(result.delivery.address.street, "Rua Teste");
  assert.equal(result.delivery.address.number, "S/N");
  for (const street of [null, "a".repeat(121), "\u0000Rua"]) assert.equal(resolveDelivery({ ...address, street }, deliveryZones).ok, false);
});
