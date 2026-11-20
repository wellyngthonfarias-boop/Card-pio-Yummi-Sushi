import products from "../../src/data/menu.json";
import { deliveryZones } from "../../src/data/delivery";
import { restaurantInfo } from "../../src/data/menu";
import { validCatalog } from "../../src/lib/catalog-document";
interface Statement { bind(...values: unknown[]): Statement; first<T>(): Promise<T | null>; run(): Promise<{ meta: { changes: number } }>; }
interface Env { DB?: { prepare(sql: string): Statement }; OWNER_EMAIL?: string; OWNER_PASSWORD_HASH?: string; }
const hex = (bytes: ArrayBuffer | Uint8Array) => Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,"0")).join("");
const digest = async (s: string) => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
const cookieName = "__Host-yummi-owner";
const cookie = (token: string, age: number) => `${cookieName}=${token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${age}`;
export async function onRequest({ request, env }: { request: Request; env: Env }) {
  const json = (body: unknown, status = 200, extra = {}) => Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extra } });
  if (!env.DB || !env.OWNER_PASSWORD_HASH || !env.OWNER_EMAIL) return json({ error: "Painel ainda não configurado na hospedagem." },503);
  const db = env.DB;
  const url = new URL(request.url);
  const route = url.pathname.replace(/\/$/, "");
  const now = Math.floor(Date.now()/1000);
  if (request.method !== "GET" && request.headers.get("Origin") !== url.origin) return json({error:"Origem inválida."},403);
  const token = request.headers.get("Cookie")?.split(";").map(s=>s.trim()).find(s=>s.startsWith(cookieName+"="))?.slice(cookieName.length+1) ?? "";
  const sessionKey = await digest(token);
  const authorized = token.length === 64 && !!await db.prepare("SELECT token FROM owner_sessions WHERE token=? AND expires>?").bind(sessionKey,now).first();
  try {
    if(route.startsWith("/api/images/") && request.method==="GET") {
      const row=await db.prepare("SELECT data FROM menu_images WHERE id=?").bind(route.slice(12)).first<{data:string}>();
      if(!row)return json({error:"Imagem não encontrada."},404);
      const [header,base64]=row.data.split(",");const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
      return new Response(bytes,{headers:{"Content-Type":header.includes("webp")?"image/webp":header.includes("png")?"image/png":"image/jpeg","Cache-Control":"public, max-age=31536000, immutable","X-Content-Type-Options":"nosniff"}});
    }
    if(route==="/api/images" && request.method==="POST") {
      if(!authorized)return json({error:"Faça login novamente."},401);
      const body=await request.text();if(body.length>340000)return json({error:"Foto muito grande."},413);
      const {data}=JSON.parse(body);if(typeof data!=="string"||!/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(data))return json({error:"Foto inválida."},400);
      const id=crypto.randomUUID();await db.prepare("INSERT INTO menu_images(id,data) VALUES(?,?)").bind(id,data).run();return json({url:`/api/images/${id}`});
    }
    if (route === "/api/session" && request.method === "GET") return json({ authenticated: authorized });
    if (route === "/api/logout" && request.method === "POST") { await db.prepare("DELETE FROM owner_sessions WHERE token=?").bind(sessionKey).run(); return json({ok:true},200,{"Set-Cookie":cookie("",0)}); }
    if (route === "/api/login" && request.method === "POST") {
      const ip = await digest(request.headers.get("CF-Connecting-IP") ?? "local");
      await db.prepare("DELETE FROM login_attempts WHERE expires<=?").bind(now).run();
      const previous = await db.prepare("SELECT attempts FROM login_attempts WHERE ip=?").bind(ip).first<{attempts:number}>();
      if ((previous?.attempts ?? 0) >= 5) return json({error:"Muitas tentativas. Aguarde 15 minutos."},429);
      await db.prepare("INSERT INTO login_attempts(ip,attempts,expires) VALUES(?,1,?) ON CONFLICT(ip) DO UPDATE SET attempts=attempts+1").bind(ip,now+900).run();
      const body = await request.text(); if(body.length>2000)return json({error:"Dados inválidos."},400);
      const { email, password } = JSON.parse(body);
      if(typeof password!=="string" || password.length>200)return json({error:"Login ou senha inválidos."},401);
      const [salt, expected] = env.OWNER_PASSWORD_HASH.split(":");
      const key = await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);
      const actual = hex(await crypto.subtle.deriveBits({name:"PBKDF2",salt:new TextEncoder().encode(salt),iterations:100000,hash:"SHA-256"},key,256));
      let difference=actual.length ^ expected.length; for(let i=0;i<actual.length;i++)difference|=actual.charCodeAt(i)^expected.charCodeAt(i);
      if(difference || typeof email!=="string" || email.trim().toLowerCase()!==env.OWNER_EMAIL.toLowerCase())return json({error:"Login ou senha inválidos."},401);
      const secret = hex(crypto.getRandomValues(new Uint8Array(32)));
      await db.prepare("DELETE FROM owner_sessions WHERE expires<=?").bind(now).run();
      await db.prepare("INSERT INTO owner_sessions(token,expires) VALUES(?,?)").bind(await digest(secret),now+14400).run();
      return json({ok:true},200,{"Set-Cookie":cookie(secret,14400)});
    }
    if(route === "/api/catalog" && request.method === "GET") {
      const row=await db.prepare("SELECT body,revision FROM menu_document WHERE id=1").first<{body:string;revision:number}>();
      return json(row ? {...JSON.parse(row.body),revision:row.revision} : {products,zones:deliveryZones,hours:restaurantInfo.hours,revision:0});
    }
    if(route === "/api/catalog" && request.method === "PUT") {
      if(!authorized)return json({error:"Faça login novamente."},401);
      const body=await request.text();if(new TextEncoder().encode(body).length>1800000)return json({error:"Reduza o tamanho das fotos."},413);
      const doc=JSON.parse(body); if(!validCatalog(doc))return json({error:"Revise os campos dos produtos e taxas."},400);
      const result=await db.prepare("INSERT INTO menu_document(id,revision,body) VALUES(1,1,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body,revision=menu_document.revision+1 WHERE menu_document.revision=?").bind(body,doc.revision).run();
      if(!result.meta.changes)return json({error:"O cardápio mudou em outra aba. Recarregue antes de editar."},409);
      return json({ok:true,revision:doc.revision+1});
    }
    return json({error:"Não encontrado."},404);
  } catch { return json({error:"Não foi possível concluir. Tente novamente."},500); }
}
