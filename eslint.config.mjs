import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import ts from "typescript-eslint";
import next from "@next/eslint-plugin-next";
import hooks from "eslint-plugin-react-hooks";

export default defineConfig([
  js.configs.recommended,
  ...ts.configs.recommended,
  { files: ["src/**/*.{ts,tsx}"], plugins: { "@next/next": next, "react-hooks": hooks }, rules: { ...next.configs.recommended.rules, ...next.configs["core-web-vitals"].rules, ...hooks.configs.recommended.rules } },
  { languageOptions: { globals: { console: "readonly", process: "readonly", Buffer: "readonly", setTimeout: "readonly", clearTimeout: "readonly", URL: "readonly" } } },
  globalIgnores([".next/**", ".wrangler/**", "out/**", "outputs/**", "node_modules/**", "next-env.d.ts"]),
]);
