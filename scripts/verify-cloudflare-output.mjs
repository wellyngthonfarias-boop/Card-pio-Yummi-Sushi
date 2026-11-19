import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("out");
const maxFiles = 20_000;
const maxBytes = 25 * 1024 * 1024;
const files = [];

async function walk(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.isFile()) {
      const { size } = await stat(file);
      if (size > maxBytes) throw new Error(`Arquivo excede 25 MiB: ${path.relative(root, file)}`);
      files.push({ file, size });
    }
  }
}

await walk(root);
if (files.length > maxFiles) throw new Error(`Exportação excede ${maxFiles} arquivos.`);
for (const required of ["index.html", "404.html", "brand/yummi-sushi-logo.webp"]) {
  if (!files.some(({ file }) => path.relative(root, file).split(path.sep).join("/") === required)) {
    throw new Error(`Arquivo necessário ausente: ${required}`);
  }
}
const largest = files.reduce((a, b) => a.size > b.size ? a : b);
console.log(`Cloudflare Pages: ${files.length} arquivos válidos; maior arquivo ${(largest.size / 1024 / 1024).toFixed(2)} MiB (limite: 25 MiB).`);
