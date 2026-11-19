import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSelectionStore } from "../src/lib/selection-store.ts";

const catalog = JSON.parse(readFileSync(new URL("../src/data/menu.json", import.meta.url), "utf8"));
const draft = { id: "store-test", productId: "hot-salmao", quantity: 2, addonIds: [], choices: {}, notes: "Teste" };
function memoryStorage() { const data = new Map(); let writes = 0; return { data, get writes() { return writes; }, getItem: (key) => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value); writes++; } }; }

test("snapshot de servidor é estável e vazio; inicialização recupera escolhas sem alterar o snapshot SSR", () => {
  const storage = memoryStorage();
  storage.data.set("yummi.selection.v1", JSON.stringify({ version: 1, items: [draft] }));
  const store = createSelectionStore(catalog, false, () => storage);
  const server = store.getServerSnapshot();
  assert.equal(store.getSnapshot(), server);
  const unsubscribe = store.subscribe(() => {});
  assert.equal(store.getSnapshot().ready, true);
  assert.equal(store.getSnapshot().lines[0].subtotalCents, 3198);
  assert.equal(store.getServerSnapshot(), server);
  assert.equal(server.ready, false);
  assert.equal(server.lines.length, 0);
  unsubscribe();
});

test("ações persistem imediatamente, notificam assinantes e mantêm o subtotal", () => {
  const storage = memoryStorage(); const store = createSelectionStore(catalog, false, () => storage);
  let notifications = 0; const unsubscribe = store.subscribe(() => notifications++);
  assert.equal(store.add(draft), null);
  assert.equal(JSON.parse(storage.getItem(store.storageKey)).items[0].quantity, 2);
  store.setQuantity(draft.id, 3);
  assert.equal(store.getSnapshot().lines[0].subtotalCents, 4797);
  assert.equal(store.add(draft), "Este item já foi adicionado.");
  store.remove(draft.id); assert.equal(store.getSnapshot().lines.length, 0);
  store.add(draft); store.clear(); assert.equal(JSON.parse(storage.getItem(store.storageKey)).items.length, 0);
  assert.ok(notifications >= 5); unsubscribe();
});

test("eventos entre abas reconciliam sem regravar ou produzir ciclos de escrita", () => {
  const storage = memoryStorage(); const store = createSelectionStore(catalog, false, () => storage);
  const unsubscribe = store.subscribe(() => {}); const before = storage.writes;
  store.receive(JSON.stringify({ version: 1, items: [draft] }));
  assert.equal(store.getSnapshot().lines.length, 1);
  assert.equal(storage.writes, before);
  store.receive(null); assert.equal(store.getSnapshot().lines.length, 0);
  assert.equal(storage.writes, before); unsubscribe();
});

test("falha de armazenamento não impede uso na sessão e produz aviso", () => {
  const store = createSelectionStore(catalog, false, () => { throw new Error("Storage blocked"); });
  const unsubscribe = store.subscribe(() => {});
  assert.equal(store.getSnapshot().ready, true);
  assert.ok(store.getSnapshot().storageWarning.length > 0);
  assert.equal(store.add(draft), null);
  assert.equal(store.getSnapshot().lines.length, 1);
  store.setQuantity(draft.id, 1); assert.equal(store.getSnapshot().lines[0].subtotalCents, 1599);
  unsubscribe();
});
