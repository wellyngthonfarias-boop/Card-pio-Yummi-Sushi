-- Renomeia somente nomes no formato ordinal, preservando preços, produtos e demais edições.
UPDATE menu_document SET body=json_set(body,'$.products',json((
  SELECT json_group_array(json(CASE
    WHEN json_extract(value,'$.name') = CAST(CAST(json_extract(value,'$.name') AS INTEGER) AS TEXT) || 'º Combo'
    THEN json_set(value,'$.name','Combo ' || CAST(json_extract(value,'$.name') AS INTEGER))
    ELSE value END)) FROM json_each(body,'$.products')
))), revision=revision+1
WHERE EXISTS (SELECT 1 FROM json_each(body,'$.products')
  WHERE json_extract(value,'$.name') = CAST(CAST(json_extract(value,'$.name') AS INTEGER) AS TEXT) || 'º Combo');
