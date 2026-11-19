import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require(require.resolve("sharp", { paths: [require.resolve("next")] }));
const root = process.cwd();
const manifest = JSON.parse(await readFile(path.join(root, "outputs/marketing-input.json"), "utf8"));
const catalogPath = path.join(root, "src/data/menu.json");
const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const folder = path.join(root, "outputs/artes-yummi");
await mkdir(folder, { recursive: true });
await mkdir(path.join(root, "public/images/promocionais"), { recursive: true });
const report = [];
for (const entry of manifest) {
  const product = catalog.find((item) => item.id === entry.id);
  if (!product) throw new Error(`Produto não encontrado: ${entry.id}`);
  if (product.price !== entry.price) throw new Error(`Preço divergente: ${entry.id}`);
  const pipeline = sharp(entry.source).rotate();
  const web = await pipeline.clone().resize({ width: 900, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toFile(path.join(root, `public/images/promocionais/${entry.id}.webp`));
  const social = await pipeline.clone().resize({ width: 1080, height: 1440, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 94, mozjpeg: true }).toFile(path.join(folder, `${entry.id}.jpg`));
  product.image = `/images/promocionais/${entry.id}.webp`;
  product.imageKind = entry.origin === "generated" ? "illustration" : "photo";
  product.imageLayout = "poster";
  product.imageWidth = web.width;
  product.imageHeight = web.height;
  product.imagePrice = product.price;
  report.push({ id: product.id, name: product.name, unitLabel: product.unitLabel, price: product.price, origin: entry.origin, webBytes: web.size, socialBytes: social.size, source: path.basename(entry.source), prompt: entry.prompt ?? null });
}
await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
await writeFile(path.join(root, "docs/artes-promocionais.json"), `${JSON.stringify(report, null, 2)}\n`);
const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const format = (price) => price === 0 ? "Sem cobrança" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
const cards = report.map((entry) => `<article><a href="${entry.id}.jpg" download><img loading="lazy" src="${entry.id}.jpg" alt="${escape(entry.name)}"></a><h2>${escape(entry.name)}</h2><p>${escape(entry.unitLabel)} · ${format(entry.price)}</p><p>${entry.origin === "generated" ? "Arte ilustrativa criada com IA" : "Arte fornecida pelo responsável"}</p><a href="${entry.id}.jpg" download>Baixar imagem</a></article>`).join("\n");
await writeFile(path.join(folder, "index.html"), `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Artes Yummi Sushi</title><style>body{margin:0;padding:24px;background:#111;color:#fff;font:16px Arial;line-height:1.6}main{max-width:1280px;margin:auto}h1{color:#e9b955}section{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:24px}article{background:#242424;border-radius:16px;padding:16px}img{width:100%;height:330px;object-fit:contain}h2{font-size:20px}a{color:#e9b955}p{color:#ccc}</style><main><h1>Yummi Sushi Delivery</h1><p>Artes de divulgação · ${report.length} arquivos. Clique para baixar. Valores conforme o catálogo; confirmar antes de campanhas futuras. As artes geradas são ilustrativas.</p><section>${cards}</section></main></html>`);
await copyFile(path.join(root, "docs/artes-promocionais.json"), path.join(folder, "manifesto.json"));
console.log(JSON.stringify({ total: report.length, generated: report.filter((entry) => entry.origin === "generated").length, webBytes: report.reduce((sum, entry) => sum + entry.webBytes, 0), socialBytes: report.reduce((sum, entry) => sum + entry.socialBytes, 0) }));
