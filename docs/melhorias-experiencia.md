# Melhorias da experiência do cardápio

## Alterações

- Abertura mais curta, com logo oficial proporcional e botão que leva diretamente às categorias.
- Cards compactos, com enquadramentos de apresentação em CSS que destacam o produto. Os arquivos promocionais e o ZIP de divulgação permanecem intactos; o preço passa a ter destaque no conteúdo do card.
- Composição resumida para comparar os combos, com detalhes completos no modal.
- Categorias fixas durante a rolagem, com reposicionamento dos resultados ao trocar o filtro.
- Modal com área de conteúdo independente e rodapé permanente para quantidade, subtotal, validações e botão Adicionar. Escolhas obrigatórias continuam sendo exigidas.
- Mensagens de descrição e ingredientes ausentes removidas. Ingredientes já presentes na composição e avisos de disponibilidade não são repetidos. Informações gerais ficam em seção recolhível; a taxa de alteração continua indicada na personalização dos combos.
- Barra flutuante aparece apenas após o primeiro produto. Acesso pelo cabeçalho continua disponível no estado vazio.
- Prévia social PNG 1200 × 630 com a logo original, Open Graph e Twitter configurados. A apresentação e o cache no aplicativo WhatsApp dependem de validação manual; nenhum pedido foi enviado durante os testes.

## Verificação executada

- Lint, typecheck, validação dos 57 itens, 26 testes e build de produção passaram.
- Páginas e modal testados em 320, 375, 390, 430, 768, 1024 e 1440 px. Sem transbordamento horizontal da página ou do modal; botão Adicionar visível em todas as larguras com altura de referência de 844 px.
- Em 390 × 844: primeiro card passou de aproximadamente 1813 para 1026 px a partir do topo (43% mais próximo); altura do primeiro card passou de 752 para 434 px (42% menor).
- Carrossel, filtro Barcas, pesquisa sem resultados, escolha obrigatória de preparo, observações, quantidade, subtotal, adição, limpeza com confirmação, recarga da seleção vazia e opção Mostrar ao garçom conferidos no navegador.
- Validação nativa rejeitou o temaki sem preparo. Após selecionar Cru, o pedido manteve o preparo e a observação “Sem cebolinha”, com subtotal de R$ 37,00.
- Escape fecha o modal e restaura o foco ao botão que o abriu.
- Metadados renderizados apontam para a imagem social absoluta, com dimensões 1200 × 630 e summary_large_image.
- Sem avisos ou erros no console durante o roteiro executado. Não foram executadas novas medições Lighthouse/Core Web Vitals nem testes em aparelho físico nesta etapa.
