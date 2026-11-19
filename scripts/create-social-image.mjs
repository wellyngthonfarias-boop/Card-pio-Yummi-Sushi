import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = require(require.resolve("sharp", { paths: [require.resolve("next")] }));
const background = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#111111"/>
<path d="M880 0H1200V275Z" fill="#E60012" opacity=".65"/>
<path d="M0 562L520 630H0Z" fill="#E60012"/>
<rect x="56" y="100" width="420" height="430" rx="28" fill="#FFFFFF"/>
<g font-family="Arial, Helvetica, sans-serif"><text x="530" y="225" fill="#FFFFFF" font-size="56" font-weight="700">Yummi Sushi</text>
<text x="533" y="280" fill="#E9B955" font-size="34" letter-spacing="7">DELIVERY</text>
<rect x="532" y="319" width="76" height="4" rx="2" fill="#E9B955"/>
<text x="532" y="385" fill="#FFFFFF" font-size="34">Cardápio digital</text>
<text x="532" y="432" fill="#BCBCBC" font-size="25">Escolha seus favoritos.</text>
<text x="532" y="505" fill="#E9B955" font-size="23">No restaurante · Na sua casa</text></g></svg>`;
const logo = await sharp("public/brand/yummi-sushi-logo.png").resize(380, 380, { fit: "contain" }).png().toBuffer();
await sharp(Buffer.from(background)).composite([{ input: logo, left: 76, top: 125 }]).png().toFile("public/brand/yummi-sushi-social.png");
console.log("Prévia social gerada: 1200 × 630 px, com a logo oficial preservada.");
