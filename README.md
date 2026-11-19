# Yummi Sushi Delivery

Para publicar a partir do GitHub, veja [o guia da Vercel](docs/publicacao-vercel.md). A configuração de instalação, build, Node.js e saída estática já está incluída no projeto.

Base local de um cardápio digital mobile-first, com Next.js (App Router), TypeScript, Tailwind CSS e Lucide React. Requer Node.js 22.13+ da linha 22 ou Node.js 24+ (recomendado), e pnpm 11. A revisão foi executada com Node.js 24.22.3.

## Executar

```sh
pnpm install
pnpm dev
```

Acesse http://localhost:3000.

## Verificar e executar em produção

```sh
pnpm lint
pnpm build
pnpm typecheck
pnpm test
pnpm verify:menu
```

O build deve preceder o typecheck na primeira execução para gerar os tipos do Next.js.

Os comandos usam Webpack para evitar uma falha de subprocessos do Turbopack observada neste ambiente Windows.

## Marca e conteúdo

A logo oficial está em `public/brand/yummi-sushi-logo.png`, copiada integralmente do arquivo fornecido. A imagem é apresentada sem filtros, recortes ou alterações de cores, com seu fundo branco original. A exibição usa uma cópia WebP lossless com pixels idênticos; o PNG original é preservado. Veja `public/brand/README.md`. Se substituir o original, atualize a cópia e refaça o build. Quando ausente, o nome do restaurante aparece em texto simples.

Dados locais tipados ficam em `src/data/restaurant.ts`. Cores globais ficam em `src/app/globals.css`. Os componentes estão organizados por responsabilidade em `src/components`.

## Escopo desta etapa

Cardápio transcrito e conferido visualmente no PDF fornecido: 57 itens em 12 categorias, incluindo 14 combos e duas barcas. Busca por nomes/ingredientes, filtros, porções, composição expansível e janela de detalhes acessível. Preços e Instagram vêm do PDF; o horário vigente foi corrigido pelo usuário para quinta a segunda-feira, das 18h às 22h20. Sunomono, gengibre e wasabi são complementos sem cobrança, conforme confirmação do restaurante. Seleção funcional com quantidades, sabores, adicionais, observações, persistência local e lista para mostrar ao garçom. Conversa do WhatsApp com mensagem preenchida por clique, sem envio automático, login, banco de dados ou pagamentos.

## Estrutura funcional

- `src/types/menu.ts`: produtos, disponibilidade, ingredientes, porção, adicionais, destaque e informações opcionais fornecidas pelo estabelecimento.
- `src/lib/menu-search.ts`: busca por termos sem acentos e agrupamento/filtro por categoria.
- `src/lib/product-selection.ts`: guarda reutilizável que bloqueia itens indisponíveis, sem preço ou fictícios fora da demonstração; disponibilidade a confirmar permite montar uma lista, sem promessa de estoque.
- `src/components/menu/product-details.tsx`: diálogo nativo com fechamento por Escape, foco contido, retorno de foco ao botão e bloqueio da rolagem de fundo.
- `src/data/demo-menu.ts`: exemplos fictícios isolados. Visíveis somente em `/demonstracao`, com preços marcados como fictícios e `noindex`. Não integram os 57 produtos comerciais e usam uma seleção de teste separada.
- `tests/menu.test.mjs`: busca, filtros combinados, agrupamento, integridade dos dados reais e bloqueios da seleção futura. Requer Node com suporte a `--experimental-strip-types` (Node 22.6+; recomendado 24).

O PDF não informa disponibilidade atual, destaques, adicionais cobrados, alergênicos ou valores nutricionais. Os complementos gratuitos e as opções dos combos 9, 10 e 11 foram confirmados posteriormente pelo restaurante. A disponibilidade fica `unconfirmed`, destaque `false` e os adicionais vazios. Alergênicos e nutrição são omitidos da interface enquanto não fornecidos; ausência de dados não representa ausência de alergênicos. Ilustrações de categoria e placeholders são locais, identificados como provisórios.

Dados ficam em `src/data/menu.json`, com página de origem por item; categorias e informações institucionais em `src/data/menu.ts`. Rode `pnpm verify:menu` para conferir cobertura, preços e somas das peças. A conferência editorial está em `docs/cardapio-conferencia.md`. Os SVG são ilustrações locais de categoria, geradas por `node scripts/create-placeholders.mjs`, e não representam a composição exata dos pratos. Não há fotos de terceiros. Substitua-os pelas fotos oficiais quando disponíveis.

O projeto está configurado para exportação estática: `pnpm build` gera a pasta `out/`, pronta para hospedagem. A publicação de demonstração usa Sites e sua identidade fica em `.openai/hosting.json`. Para atualizar, gere o build e publique uma nova versão no mesmo Site. O endereço canônico da demonstração está nos metadados do layout.

## Seleção e persistência

A seleção usa React Context, `useSyncExternalStore` e `localStorage`, sem dependências adicionais de produção. O snapshot do servidor é estável; eventos entre abas são recebidos sem regravação em ciclo. A barra inferior e o contador do header abrem a lista. Os produtos são configurados na janela de detalhes antes de adicionar. O combo 10 exige dois sabores; combo 11 exige um; combo 12 exige o sabor dos hots; temakis avulsos exigem preparo Hot ou Cru.

`src/lib/selection.ts` calcula em centavos inteiros e valida quantidades (1–99 por linha), notas (até 500 caracteres), IDs, sabores e adicionais obrigatórios. Aumentar/diminuir recalcula os valores, chegar a zero remove a linha, e limpar exige confirmação. Linhas distintas preservam observações individuais.

O navegador salva somente identificadores e escolhas, nunca preços. Na recuperação, o catálogo atual fornece nomes, disponibilidade e preços; itens removidos, indisponíveis ou com opções obsoletas são descartados com aviso. Falhas de armazenamento são informadas sem impedir o uso na sessão atual. A demonstração usa uma chave separada.

A opção “Mostrar ao garçom” apenas apresenta a lista de leitura. Não confirma nem transmite pedidos. Não há taxas de entrega. Observações que solicitem alterações de combos não geram cobranças automáticas: a aplicação da taxa informada depende de confirmação do restaurante.

`pnpm test` inclui testes de centavos, adicionais, configurações obrigatórias, quantidades, remoção e recuperação com preços adulterados ou alterados no catálogo.

## WhatsApp

`src/lib/whatsapp.ts` contém o número oficial `5588992978164`, a formatação independente da mensagem e a construção `https://wa.me/5588992978164?text=${encodeURIComponent(message)}`. A preparação revalida todas as linhas contra o catálogo atual, rejeita produtos removidos/indisponíveis, preços desconhecidos, adicionais inválidos, escolhas incompletas, IDs duplicados e dados fictícios. Nunca abre um pedido parcial.

Em “Meu pedido”, o botão “Fazer pedido pelo WhatsApp” abre o HTTPS somente no clique, em nova aba com `noopener,noreferrer`. A mensagem inclui quantidades, apresentação/volume, sabores, adicionais com preços por unidade, observações e subtotais em centavos. Abrir o WhatsApp não apaga a seleção nem confirma o pedido. O cliente ainda precisa confirmar o envio dentro do WhatsApp. O atendimento presencial permanece independente.

A prévia permite conferir e copiar a mensagem. Se o aplicativo ou a abertura da conversa não estiver disponível no aparelho, o cliente mantém a lista e pode copiar o texto para a conversa oficial. Não existe detecção confiável de aplicativo instalado nesta implementação; a transição para app, web ou instalação é controlada pelo WhatsApp e pelo navegador.

Testes automatizados: número, codificação com acentos/emoji/caracteres reservados, quantidades, adicionais, sabores, totais, rejeição de itens inválidos, reprecificação e preservação dos dados de entrada. Validar manualmente em Android/iOS e desktop, com e sem aplicativo, a conversa correta, o texto preenchido e o envio explícito pelo cliente. Não enviar pedidos de teste ao restaurante sem coordenação.

## Qualidade e desempenho

`pnpm lint` usa ESLint 10 com regras de JavaScript, TypeScript, React Hooks e o plugin oficial do Next.js. As versões diretas de produção estão fixadas e o lockfile deve ser preservado. As ferramentas de lint são somente dependências de desenvolvimento.

Detalhes e janela de pedido são carregados sob demanda com `next/dynamic`. A logo WebP é lossless, sem alterar dimensões ou pixels, e o rodapé não solicita preload da marca. O comportamento de foco, Escape e rolagem dos modais permanece preservado.

A revisão visual considera 320, 375, 390, 430, 768, 1024 e 1440 px. Capturas e métricas locais ficam em `outputs/` (não publicadas). Recomenda-se validar o aplicativo WhatsApp em Android/iOS e leitores de tela antes do uso comercial. A exportação estática não requer Node.js no servidor de hospedagem.

Relatório da revisão executada: `docs/revisao-tecnica.md`, com matriz de larguras, evidências, resultados e validações manuais pendentes.
