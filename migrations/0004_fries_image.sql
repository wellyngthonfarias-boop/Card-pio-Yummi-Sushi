-- Alterar somente a imagem da batata, preservando edições do proprietário.
WITH target AS (
  SELECT CAST(j.key AS INTEGER) AS idx FROM menu_document m, json_each(m.body,'$.products') j
  WHERE m.id=1 AND json_extract(j.value,'$.id')='batata'
)
UPDATE menu_document SET body=json_remove(json_set(body,
  '$.products['||(SELECT idx FROM target)||'].image','/images/products/batata-frita-yummi.webp',
  '$.products['||(SELECT idx FROM target)||'].imageKind','illustration',
  '$.products['||(SELECT idx FROM target)||'].imageWidth',1200,
  '$.products['||(SELECT idx FROM target)||'].imageHeight',900),
  '$.products['||(SELECT idx FROM target)||'].imageLayout',
  '$.products['||(SELECT idx FROM target)||'].imagePrice'),revision=revision+1
WHERE id=1 AND EXISTS(SELECT 1 FROM target);
