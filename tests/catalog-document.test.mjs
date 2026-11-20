import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validCatalog} from "../src/lib/catalog-document.ts";
const products=JSON.parse(readFileSync(new URL("../src/data/menu.json",import.meta.url),"utf8"));
const doc={products,zones:[{id:"centro",name:"Centro",feeCents:600}],hours:"Quinta a segunda, 18h às 22h20",revision:0};
test("catálogo editável preserva dados válidos e rejeita preços e fontes de imagens inválidos",()=>{
  assert.equal(validCatalog(doc),true);
  for(const patch of [{price:-1},{price:Infinity},{image:"javascript:alert(1)"},{image:"https://externo.test/foto.jpg"},{category:"outra"},{source:"demo"}])assert.equal(validCatalog({...doc,products:[{...products[0],...patch}]}),false);
  assert.equal(validCatalog({...doc,products:[{...products[0],image:"/api/images/12345678-1234-1234-1234-123456789abc"}]}),true);
  assert.equal(validCatalog({...doc,products:[products[0],products[0]]}),false);
  for(const invalid of [null,{}, {...doc,products:[null]}, {...doc,zones:[null]}])assert.equal(validCatalog(invalid),false);
});
