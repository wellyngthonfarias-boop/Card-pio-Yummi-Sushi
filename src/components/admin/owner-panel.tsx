"use client";
import { useEffect, useState, type FormEvent } from "react";
import { categories } from "@/data/menu";
import type { CatalogDocument } from "@/lib/catalog-document";
import type { MenuProduct } from "@/types/menu";
async function api(path: string, method = "GET", body?: unknown) {
  const response=await fetch(`/api/${path}`,{method,cache:"no-store",headers:body?{"Content-Type":"application/json"}:{},body:body?JSON.stringify(body):undefined});
  const data=await response.json(); if(!response.ok)throw new Error(data.error??"Não foi possível concluir."); return data;
}
async function photo(file: File): Promise<string> {
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>10000000)throw new Error("Escolha uma foto JPG, PNG ou WebP de até 10 MB.");
  const bitmap=await createImageBitmap(file);
  const scale=Math.min(1,900/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement("canvas"); canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
  const context=canvas.getContext("2d");if(!context)throw new Error("Não foi possível ler a foto.");
  context.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  const data=canvas.toDataURL("image/webp",.8);if(data.length>330000)throw new Error("A foto ainda está grande. Escolha uma imagem menor.");return (await api("images","POST",{data})).url;
}
export function OwnerPanel() {
  const [authenticated,setAuthenticated]=useState(false),[busy,setBusy]=useState(true),[message,setMessage]=useState("");
  const [email,setEmail]=useState(""),[password,setPassword]=useState("");
  const [document,setDocument]=useState<CatalogDocument|null>(null),[editing,setEditing]=useState<MenuProduct|null>(null),[search,setSearch]=useState(""),[dirty,setDirty]=useState(false);
  useEffect(()=>{void api("session").then(async s=>{if(s.authenticated){setDocument(await api("catalog"));setAuthenticated(true);}}).catch(e=>setMessage(e.message)).finally(()=>setBusy(false));},[]);
  useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();}};window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn);},[dirty]);
  async function login(event:FormEvent) {event.preventDefault();setBusy(true);setMessage("");try{await api("login","POST",{email,password});setPassword("");setDocument(await api("catalog"));setAuthenticated(true);}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
  async function publish(){if(!document)return;setBusy(true);setMessage("");try{const result=await api("catalog","PUT",document);setDocument({...document,revision:result.revision});setDirty(false);setMessage("Alterações publicadas no cardápio.");}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
  function updateDocument(next:CatalogDocument){setDocument(next);setDirty(true);setMessage("");}
  function saveProduct(event:FormEvent){event.preventDefault();if(!document||!editing)return;const next={...editing};if(next.category==="complementos")next.price=0;updateDocument({...document,products:document.products.some(p=>p.id===next.id)?document.products.map(p=>p.id===next.id?next:p):[...document.products,next]});setEditing(null);}
  return <section className="owner-panel"><header><h1>Área do proprietário</h1><a href="/" target="_blank" rel="noreferrer">Ver cardápio</a></header>
    {message&&<p role="status" className="clear-confirm">{message}</p>}
    {!authenticated ? <form onSubmit={login} className="delivery-form owner-login"><label htmlFor="owner-email">E-mail<input id="owner-email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label htmlFor="owner-password">Senha<input id="owner-password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={busy} className="primary-button">{busy?"Aguarde…":"Entrar"}</button></form> : document && <>
      <div className="owner-actions"><button className="primary-button" disabled={busy||!dirty||!!editing} onClick={publish}>{busy?"Publicando…":"Salvar e publicar"}</button><button className="secondary-button" onClick={async()=>{if(dirty&&!confirm("Sair sem publicar as alterações?"))return;try{await api("logout","POST");setAuthenticated(false);setDocument(null);setDirty(false);}catch(e){setMessage((e as Error).message);}}}>Sair</button>{dirty&&<span>Alterações ainda não publicadas</span>}</div>
      <p className="field-hint">Primeiro salve a edição do produto. Depois use “Salvar e publicar” para atualizar o cardápio dos clientes.</p>
      {editing ? <form className="delivery-form owner-editor" onSubmit={saveProduct}><h2>{document.products.some(p=>p.id===editing.id)?"Editar produto":"Novo produto"}</h2>
        <label>Nome<input required maxLength={120} value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})}/></label>
        <label>Categoria<select value={editing.category} onChange={e=>setEditing({...editing,category:e.target.value as MenuProduct["category"]})}>{categories.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
        <label>Preço (R$)<input type="number" min="0" max="100000" step="0.01" required disabled={editing.category==="complementos"} value={editing.category==="complementos"?0:editing.price??""} onChange={e=>setEditing({...editing,price:e.target.value===""?null:Number(e.target.value)})}/></label>{editing.category==="complementos"&&<p>1 unidade de cortesia por pedido; extras de R$ 2,00.</p>}
        <label>Apresentação (ex.: 20 peças, 2 litros)<input maxLength={100} value={editing.unitLabel} onChange={e=>setEditing({...editing,unitLabel:e.target.value})}/></label>
        <label>Descrição<textarea maxLength={1000} rows={3} value={editing.description} onChange={e=>setEditing({...editing,description:e.target.value})}/></label>
        <label>Ingredientes (separados por vírgula)<input value={editing.ingredients.join(", ")} onChange={e=>setEditing({...editing,ingredients:e.target.value.split(",").map(s=>s.trim())})}/></label>
        <label>Disponibilidade<select value={editing.availability} onChange={e=>setEditing({...editing,availability:e.target.value as MenuProduct["availability"]})}><option value="available">Disponível</option><option value="unavailable">Indisponível</option><option value="unconfirmed">A confirmar</option></select></label>
        <label><input type="checkbox" checked={editing.featured} onChange={e=>setEditing({...editing,featured:e.target.checked})}/> Produto em destaque</label>
        <label>Foto do produto<input type="file" accept="image/jpeg,image/png,image/webp" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setBusy(true);try{const image=await photo(file);setEditing({...editing,image,imageKind:"photo",imageLayout:undefined,imagePrice:undefined,imageWidth:undefined,imageHeight:undefined});}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}}/></label>{editing.image&&<p>Foto cadastrada. Envie outra para substituir.</p>}
        {editing.composition&&<fieldset><legend>Composição</legend>{editing.composition.map((part,index)=><div className="owner-composition" key={index}><label>Quantidade<input type="number" min="1" required value={part.quantity} onChange={e=>setEditing({...editing,composition:editing.composition!.map((p,i)=>i===index?{...p,quantity:Number(e.target.value)}:p)})}/></label><label>Peça<input value={part.name} required onChange={e=>setEditing({...editing,composition:editing.composition!.map((p,i)=>i===index?{...p,name:e.target.value}:p)})}/></label><label>Ingredientes<input value={part.ingredients} onChange={e=>setEditing({...editing,composition:editing.composition!.map((p,i)=>i===index?{...p,ingredients:e.target.value}:p)})}/></label></div>)}</fieldset>}
        <div className="owner-actions"><button className="primary-button" disabled={busy}>Salvar edição</button><button type="button" className="secondary-button" onClick={()=>setEditing(null)}>Cancelar edição</button></div>
      </form> : <><div className="owner-actions"><button className="secondary-button" onClick={()=>setEditing({id:`produto-${crypto.randomUUID()}`,category:"hot",name:"",price:0,unitLabel:"",description:"",source:"restaurant-menu",ingredients:[],pieceCount:null,availability:"available",featured:false,optionalAddons:[],image:"",imageKind:"placeholder"})}>Adicionar produto</button><label>Pesquisar produto<input type="search" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
        <ul className="owner-products">{document.products.filter(p=>p.name.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))).map(p=><li key={p.id}><div><strong>{p.name}</strong><p>{p.unitLabel} · {p.availability==="unavailable"?"Indisponível":p.price?.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</p></div><button className="secondary-button" onClick={()=>setEditing(structuredClone(p))}>Editar {p.name}</button><button className="secondary-button" onClick={()=>{if(confirm(`Retirar ${p.name} do cardápio? A alteração só será aplicada ao publicar.`))updateDocument({...document,products:document.products.filter(item=>item.id!==p.id)});}}>Retirar</button></li>)}</ul>
        <section className="delivery-form owner-editor"><h2>Funcionamento</h2><label>Horário exibido no cardápio<input value={document.hours} maxLength={200} onChange={e=>updateDocument({...document,hours:e.target.value})}/></label><h2>Bairros e entrega</h2>{document.zones.map((zone,index)=><div key={zone.id} className="delivery-field-row"><label>Bairro<input value={zone.name} maxLength={100} onChange={e=>updateDocument({...document,zones:document.zones.map((z,i)=>i===index?{...z,name:e.target.value}:z)})}/></label><label>Taxa (R$)<input type="number" min="0" step="0.01" value={zone.feeCents/100} onChange={e=>updateDocument({...document,zones:document.zones.map((z,i)=>i===index?{...z,feeCents:Math.round(Number(e.target.value)*100)}:z)})}/></label></div>)}<button className="secondary-button" onClick={()=>updateDocument({...document,zones:[...document.zones,{id:`bairro-${crypto.randomUUID()}`,name:"Novo bairro",feeCents:0}]})}>Adicionar bairro</button></section>
      </>}
    </>}
  </section>;
}
