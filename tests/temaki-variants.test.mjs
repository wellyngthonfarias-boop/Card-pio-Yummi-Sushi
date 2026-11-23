import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { separateTemakis } from "../src/lib/temaki-variants.ts";
import { resolveSelectionLine } from "../src/lib/selection.ts";
const catalog=JSON.parse(readFileSync(new URL("../src/data/menu.json",import.meta.url),"utf8"));
test("oito temakis separados não exigem preparo e mantêm R$37",()=>{
 const temakis=catalog.filter(p=>p.category==="temaki");assert.equal(temakis.length,8);
 for(const p of temakis){assert.equal(p.price,37);assert.ok(!p.options?.some(o=>o.name==="Preparo"));assert.equal(resolveSelectionLine({id:"test",productId:p.id,quantity:1,addonIds:[],choices:{},notes:""},catalog).ok,true);}
 assert.equal(temakis.filter(p=>p.name.endsWith("Hot")).length,4);
});
test("separação preserva temaki Hot cadastrado pelo proprietário sem duplicar",()=>{
 const base=catalog.filter(p=>!p.name.endsWith("Hot"));const hot={...base.find(p=>p.id==="temaki-salmao"),id:"owner-hot",name:"Temaki Salmão Hot",availability:"available"};
 const output=separateTemakis([...base,hot]);assert.equal(output.filter(p=>p.category==="temaki").length,8);assert.equal(output.find(p=>p.id==="owner-hot").name,"Temaki de salmão Hot");assert.equal(output.find(p=>p.id==="owner-hot").availability,"available");assert.deepEqual(separateTemakis(output),output);
});
