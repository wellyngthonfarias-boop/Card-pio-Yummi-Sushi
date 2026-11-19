# Artes do cardápio e divulgação

## Escopo

Quatro artes fornecidas pelo responsável substituem as imagens dos combos 1, 2, 5 e 8. O preço do Combo 8 foi confirmado pelo responsável em R$ 45,00 e corrigido na imagem. O Combo 9 mantém a fotografia já fornecida anteriormente.

Os outros 52 produtos receberam propostas de artes ilustrativas com a ferramenta integrada ImageGen, usando a arte fornecida como referência de fundo, cores e tratamento gráfico. Não foram utilizadas imagens encontradas na internet. O logotipo oficial não foi redesenhado nem aplicado por geração.

As artes geradas não são fotografias reais do estabelecimento. Embalagens de bebidas e apresentações culinárias são representações ilustrativas; o responsável deve conferir a correspondência com os produtos servidos antes de utilizá-las em campanhas. Ingredientes, preços, porções e opções do catálogo não foram alterados a partir das imagens.

## Arquivos

- `public/images/promocionais/`: imagens WebP para o cardápio, com até 900 × 1200 px, mantendo a proporção e sem recorte.
- `outputs/artes-yummi/`: JPEG para divulgação, com até 1080 × 1440 px, galeria local `index.html` e manifesto.
- `docs/artes-promocionais.json`: produto, preço usado, procedência, tamanho dos arquivos e prompt integral de cada geração/edição.
- `scripts/prepare-marketing-assets.mjs`: conversão e associação dos arquivos ao catálogo a partir de `outputs/marketing-input.json`.

## Preços

As artes contêm preços fixos. Sempre que o valor comercial mudar, a respectiva arte deve ser atualizada. O catálogo guarda o preço usado na imagem (`imagePrice`), e `pnpm verify:menu` rejeita divergências entre esse registro e o preço atual do produto. Essa validação verifica os registros; não é uma leitura automática do texto dentro da imagem.

Os complementos gratuitos usam “Sem cobrança”. Não foram acrescentadas promoções, descontos, horários, endereços ou taxas de entrega.

## Referências de bebidas confirmadas

O responsável confirmou que Delrio de 1 L, de 2 L e Delriozinho são de guaraná, enviando as três fotos reais. As versões iniciais com aparência de cola foram descartadas e não fazem parte dos arquivos finais. As artes finais dessas bebidas foram refeitas com as referências reais de garrafa, tampa azul e rótulo verde. O Delriozinho foi identificado como 250 ml pela foto e pela informação explícita do responsável. Preços mantidos em R$ 8,00, R$ 9,00 e R$ 3,00, respectivamente.

A água com gás foi corrigida usando a referência real da Crystal de 500 ml enviada pelo responsável, com tampa preta e rótulo preto. Mantido o preço de R$ 5,00. O suco de laranja foi representado em copo sem marca e sem volume impresso na arte; a porção de 300 ml que já constava no catálogo foi mantida. A versão inicial com marca “Yummi” inventada no copo foi descartada. Os quatro gunkans de camarão do Combo 4 foram ajustados para envoltório de salmão, conforme os ingredientes do catálogo.

## Verificações executadas

- 56 artes revisadas visualmente, com revisão direcionada de preço do Combo 8, envoltório dos gunkans do Combo 4, três embalagens Delrio, água com gás e copo de suco.
- Catálogo: 57 itens; nenhum preço, quantidade, composição, ingrediente ou opção foi alterado. Acrescentadas apenas as informações confirmadas de guaraná nos três Delrio, Delriozinho de 250 ml e água de 500 ml, além dos campos das imagens.
- Lint, typecheck, validação do catálogo, 26 testes e build de produção executados com sucesso.
- Navegador: 320, 375, 390, 430, 768, 1024 e 1440 px, sem transbordamento horizontal da página; 56 artes em modo de imagem inteira e 57 produtos preservados.
- Logo PNG original conferida por SHA-256, sem alteração.
- Pacote ZIP com as 56 imagens JPEG, galeria e manifesto. Cópia publicada comparada por SHA-256 com o arquivo de origem.
