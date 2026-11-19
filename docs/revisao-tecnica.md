# Revisão técnica e visual — Yummi Sushi Delivery

Data: 18/11/2026. Ambiente: Windows, Node.js 24.22.3, Next.js 16.4.6, exportação estática e navegador Chromium do Codex.

## Melhorias e correções

- Áreas de toque dos links do cabeçalho e rodapé ampliadas para pelo menos 44 px; navegação secundária continua recolhida nos celulares.
- Ajustes em 320 px: tipografia do hero, margens internas dos cards/modais e controles do pedido. Bordas de campos com contraste maior e arredondamentos centralizados em variáveis CSS.
- Contadores das categorias com contraste preservado na categoria ativa; foco dourado mantido.
- Logo oficial PNG intacta. Exibição em WebP lossless com mesmos 1254 × 1254 pixels e comparação RGBA idêntica. Original e arquivo fornecido também tiveram SHA-256 idêntico.
- Recuperação da seleção migrada para useSyncExternalStore com snapshot SSR estável, evitando atualizações síncronas de estado em efeitos; eventos entre abas não regravam o armazenamento em ciclo.
- Rótulo de observações separado das instruções e contador por aria-describedby.
- Prévia do WhatsApp mantém seu alvo aria-controls no DOM quando recolhida, sem expor a mensagem oculta a leitores de tela.
- Detalhes e pedido carregados sob demanda; preload da marca limitado ao cabeçalho e uso da API preload atual do Next.js.
- Navegação interna da demonstração usando Link do Next.js.
- ESLint 10 configurado com JavaScript, TypeScript, React Hooks e plugin oficial do Next. Plugins incompatíveis removidos da configuração escolhida. Versões diretas de produção fixadas e avisos de módulos Node eliminados.

## Verificações executadas

| Verificação | Resultado observado |
| --- | --- |
| pnpm lint -- equivalente ao script com --max-warnings=0 | Sem erros ou avisos |
| pnpm typecheck | Aprovado |
| pnpm test | 26 aprovados; 0 falhas; 0 ignorados |
| pnpm verify:menu | 57 itens, 12 categorias, preços e quantidades preservados |
| pnpm build | Aprovado; /, /demonstracao e página de erro exportadas |
| pnpm peers check | Nenhum conflito de peer dependencies |
| pnpm audit --prod --json | 0 vulnerabilidades conhecidas retornadas pelo registro nesta consulta |

Todos os comandos acima foram executados. Audit não constitui garantia de ausência de vulnerabilidades. Lint não é certificação de acessibilidade.

## Matriz de responsividade

A página, os detalhes e o pedido foram medidos nos sete tamanhos. Capturas locais estão em outputs/review-*.jpg. A largura útil é menor que a nominal quando o navegador usa uma barra de rolagem clássica de 15 px.

| Viewport nominal | Colunas de produtos | Página: overflow / corte detectado | Detalhes: overflow | Pedido: overflow | Alvos verificados |
| --- | --- | --- | --- | --- | --- |
| 320 px | 1 | Não / Não | Não | Não | >= 44 px |
| 375 px | 1 | Não / Não | Não | Não | >= 44 px |
| 390 px | 1 | Não / Não | Não | Não | >= 44 px |
| 430 px | 1 | Não / Não | Não | Não | >= 44 px |
| 768 px | 2 | Não / Não | Não | Não | >= 44 px |
| 1024 px | 3 | Não / Não | Não | Não | >= 44 px |
| 1440 px | 3 | Não / Não | Não | Não | >= 44 px |

Rolagem horizontal dentro da navegação de categorias é intencional. A verificação de corte incluiu títulos, rodapé dos cards e barra flutuante. Modais foram verificados com observações longas; rolagem vertical interna é intencional.

## Fluxos conferidos no navegador

- Categoria Temakis + pesquisa SALMAO: dois resultados, incluindo o misto; busca sem resultados e botão de recuperação conferidos.
- Abertura dos detalhes sob demanda, escolhas obrigatórias dos dois temakis, navegação por teclado, foco visível, contenção no modal, Escape e retorno ao botão de origem.
- Adição de dois hots de R$ 15,99: subtotal de R$ 31,98; aumento para três e sincronização de contador em outra aba; diminuição e recuperação após recarregar com observação preservada.
- Remoção individual, cancelamento da limpeza e limpeza confirmada na demonstração.
- Adicional obrigatório ausente bloqueou adição. Na demonstração, 3 × (R$ 12,34 + R$ 1,23 + R$ 2,50) = R$ 48,21. Produto e adicional indisponíveis bloqueados. WhatsApp desabilitado para dados fictícios.
- Mostrar ao garçom exibiu lista de leitura sem controles de WhatsApp. Nenhum pedido foi enviado.
- WhatsApp: mensagem com acentos, emoji e caracteres reservados conferida na prévia; cópia e tentativa de abertura por clique exercitadas. Número, URL e regras são cobertos pelos testes automatizados. A conversa/app externo não ficou disponível para inspeção completa nesta revisão; a entrega final ao aplicativo permanece manual.

## Acessibilidade e contraste

- HTML e nomes dos controles, labels, fieldsets, hierarquia de títulos e relações ARIA revisados.
- Foco dourado efetivamente observado após Shift+Tab; foco contido no dialog, fundo bloqueado e restauração após Escape conferidos.
- Rotina de cores computadas avaliou 953 elementos com texto na página, sem relações abaixo dos limites considerados na amostra. Elementos duplicados por ancestralidade estão incluídos nessa contagem; não é uma auditoria WCAG completa.
- Branco sobre vermelho #E60012: 4,80:1; cinza #BCBCBC sobre #111111: 9,94:1; dourado #E9B955 sobre #111111: 10,37:1; borda #777777 sobre superfície #242424: 3,47:1.
- Regra prefers-reduced-motion confirmada no CSS gerado: rolagem suave desativada (scroll-behavior: auto), assim como animações e transições sob a preferência. A preferência não foi alterada no sistema operacional de teste; ativação real e leitor de tela continuam pendentes.

## Desempenho e integridade

- Logo: 1.365.046 → 810.650 bytes, redução de 40,6%, sem alteração de pixels, dimensões, cores ou tipografia.
- JavaScript externo referenciado pelo HTML inicial: 645,752 → 631,858 bytes; gzip estimado por arquivo: 196,093 → 192,112 bytes. Esta soma inclui polyfills e não representa uma medição de transferência real ou Core Web Vitals.
- Os chunks que contêm o formulário de produto e a prévia do WhatsApp não são referenciados pelo HTML inicial; carregamento sob demanda verificado no artefato gerado.
- Dependências de produção existentes são usadas: Next.js, React, React DOM (runtime do Next) e Lucide. Nenhuma dependência de produção foi adicionada na revisão. As adições são ferramentas de lint em desenvolvimento.
- Catálogo e preços não foram modificados. A lista da demonstração continua isolada do catálogo comercial.

## Pendências e recomendações antes do uso público

1. Testar em Android e iPhone reais a passagem ao WhatsApp, com e sem aplicativo instalado, números/acentos/emoji e envio explícito. Na etapa anterior houve alteração do emoji na tela intermediária deste navegador; a mensagem gerada e sua cópia permanecem corretas.
2. Validar com leitor de tela e com a preferência de movimento reduzido realmente ativada; a revisão atual não certifica conformidade WCAG integral.
3. Medir Lighthouse e Core Web Vitals em hospedagem/rede/dispositivos representativos. Esses testes não foram executados; não foram atribuídas notas de performance.
4. Substituir ilustrações provisórias por fotos oficiais otimizadas e reconfirmar disponibilidade, ingredientes, regras comerciais e informações que o estabelecimento desejar publicar.
5. Manter o lockfile, usar Node.js 24 para desenvolvimento/build e revisar domínio e público de acesso. Após a revisão, o Site foi tornado público por solicitação explícita do responsável.
6. Manter exportação estática em HTTPS e testar o link/QR usado pelos clientes após definir o endereço comercial. Não há pagamento ou backend de pedidos nesta aplicação.

## Atualização: carrosséis por categoria

- Cada categoria passou a usar uma faixa horizontal independente, mantendo a ordem do catálogo, filtros, pesquisa e ações dos produtos. Não há reprodução automática.
- Rolagem nativa com encaixe dos cards, controles Anterior/Próximo quando há conteúdo fora da faixa, navegação pelas setas do teclado e preferência de movimento reduzido no comando de rolagem.
- Apresentação inicial, botão principal, modos de atendimento, títulos das seções, busca e controles dos carrosséis centralizados.
- Verificação em navegador nas larguras 320, 375, 390, 430, 768, 1024 e 1440 px: 12 categorias, produtos em uma linha por faixa, sem transbordamento horizontal da página. Avanço/retorno e teclado verificados; filtro Barcas, busca sem resultado e por ingredientes, detalhes e adição de hot com subtotal de R$ 31,98 para duas unidades também verificados. Sem avisos ou erros no console durante esse roteiro.
- Lint, typecheck, 26 testes automatizados e validação dos 57 produtos executados com sucesso. Deslize por toque em Android/iPhone físicos continua dependendo de conferência manual.
