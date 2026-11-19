import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { THEME_STORAGE_KEY, themeInitializationScript, toggleTheme } from "../src/lib/theme.ts";

function environment(saved, blocked = false) {
  const values = new Map([[THEME_STORAGE_KEY, saved]]);
  return {
    document: { documentElement: { dataset: {} } },
    localStorage: {
      getItem(key) { if (blocked) throw Error("Storage blocked"); return values.get(key); },
      setItem(key, value) { if (blocked) throw Error("Storage blocked"); values.set(key, value); },
    },
  };
}

test("tema mantém modo escuro padrão e rejeita preferências inválidas", () => {
  for (const value of [null, "", "unknown", "dark"]) {
    const context = environment(value);
    vm.runInNewContext(themeInitializationScript, context);
    assert.equal(context.document.documentElement.dataset.theme, "dark");
  }
});

test("tema alterna, persiste e restaura modo claro ao recarregar", () => {
  const context = environment(null);
  vm.runInNewContext(themeInitializationScript, context);
  vm.runInNewContext(`(${toggleTheme.toString()})()`, { ...context, THEME_STORAGE_KEY });
  assert.equal(context.document.documentElement.dataset.theme, "light");
  assert.equal(context.localStorage.getItem(THEME_STORAGE_KEY), "light");
  vm.runInNewContext(themeInitializationScript, context);
  assert.equal(context.document.documentElement.dataset.theme, "light");
  vm.runInNewContext(`(${toggleTheme.toString()})()`, { ...context, THEME_STORAGE_KEY });
  assert.equal(context.document.documentElement.dataset.theme, "dark");
  assert.equal(context.localStorage.getItem(THEME_STORAGE_KEY), "dark");
});

test("tema funciona mesmo quando o armazenamento do navegador está bloqueado", () => {
  const context = environment(null, true);
  vm.runInNewContext(themeInitializationScript, context);
  vm.runInNewContext(`(${toggleTheme.toString()})()`, { ...context, THEME_STORAGE_KEY });
  assert.equal(context.document.documentElement.dataset.theme, "light");
});
