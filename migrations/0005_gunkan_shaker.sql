-- Atualizar o item existente, sem duplicá-lo nem alterar outros produtos.
WITH target AS (
 SELECT CAST(j.key AS INTEGER) AS idx FROM menu_document m,json_each(m.body,'$.products') j
 WHERE m.id=1 AND json_extract(j.value,'$.id')='gunkan-shake'
)
UPDATE menu_document SET body=json_remove(json_set(body,
 '$.products['||(SELECT idx FROM target)||'].name','Gunkan Shaker',
 '$.products['||(SELECT idx FROM target)||'].description','Salmão, cream cheese, cebolinha e gergelim.',
 '$.products['||(SELECT idx FROM target)||'].ingredients',json('["Salmão","Cream cheese","Cebolinha","Gergelim"]'),
 '$.products['||(SELECT idx FROM target)||'].price',7.99,
 '$.products['||(SELECT idx FROM target)||'].image','/images/products/gunkan-shaker-yummi.webp',
 '$.products['||(SELECT idx FROM target)||'].imageKind','illustration',
 '$.products['||(SELECT idx FROM target)||'].imageWidth',1200,
 '$.products['||(SELECT idx FROM target)||'].imageHeight',900),
 '$.products['||(SELECT idx FROM target)||'].imageLayout',
 '$.products['||(SELECT idx FROM target)||'].imagePrice'),revision=revision+1
WHERE id=1 AND EXISTS(SELECT 1 FROM target);
