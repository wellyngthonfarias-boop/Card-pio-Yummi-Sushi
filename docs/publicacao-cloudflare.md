# Publicação no Cloudflare Pages

O cardápio usa exportação estática do Next.js. A seleção, pesquisa, temas e WhatsApp funcionam no navegador. Não requer Functions, banco de dados, API de pagamentos nem adaptador de Next.js para Workers.

## Importar o repositório

1. No painel Cloudflare, abra **Workers & Pages → Create application → Pages → Import an existing Git repository**. Escolha o fluxo **Pages**.
2. Conecte sua conta GitHub e selecione **wellyngthonfarias-boop/Card-pio-Yummi-Sushi**.
3. Use o nome de projeto `yummi-sushi-delivery`, igual ao `wrangler.toml`. Se escolher outro nome, atualize também esse arquivo antes do deploy.
4. Configure os campos abaixo e clique em **Save and Deploy**.

| Campo | Valor |
| --- | --- |
| Branch de produção | `main` |
| Framework preset | `Next.js (Static HTML Export)` |
| Build command | `pnpm run build:cloudflare` |
| Build output directory | `out` |
| Root directory | Raiz do repositório (deixar vazio) |
| Variável `NODE_VERSION` | `24` |
| Variável `PNPM_VERSION` | `11.25.0` |

Defina as duas variáveis de build para **Production** e **Preview**. O arquivo `.nvmrc` também fixa a linha Node.js 24. A Cloudflare instala as dependências a partir do lockfile; o comando acima substitui o comando sugerido pelo preset para manter o Webpack e executar a conferência de arquivos.

Não preencha um comando de deploy de Workers como `wrangler deploy`. O Pages publica automaticamente a pasta `out/` ao concluir o build. Não é necessário instalar Wrangler como dependência do aplicativo.

## Endereço e compartilhamento

O endereço só é definido após criar o projeto no painel; não há domínio Cloudflare provisionado por este repositório. Durante o build, `CF_PAGES_URL` fornece o endereço da publicação para os metadados e a imagem de compartilhamento.

Para um domínio próprio ou para apontar os links de prévias ao domínio definitivo de produção, configure `NEXT_PUBLIC_SITE_URL` com a URL completa, incluindo `https://`, e refaça o deploy. Essa variável tem prioridade sobre os endereços automáticos das plataformas.

Sem variáveis de hospedagem, o build local mantém o endereço do site atual. Nenhuma variável secreta é obrigatória. Credenciais e arquivos `.dev.vars` devem permanecer fora do Git.

## Verificação

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm run build:cloudflare
pnpm typecheck
pnpm test
pnpm verify:menu
```

O comando `build:cloudflare` compila a aplicação e valida a presença de arquivos essenciais, o limite de 20.000 arquivos e o limite de 25 MiB por arquivo. Imagens e ZIP de artes são enviados prontos em `public/`; não há geração de imagens durante o build.

Após a primeira publicação, confira a página inicial, `/demonstracao`, os dois temas, filtros, pesquisa, itens selecionados, lista para o garçom e abertura do WhatsApp. O cliente confirma o envio no próprio WhatsApp; abrir a conversa não confirma um pedido.

As configurações de Vercel e Sites permanecem separadas e não impedem a publicação no Pages. Novos commits em `main` poderão disparar builds automáticos após conectar o GitHub no painel Cloudflare.

Referências oficiais: [Next.js estático no Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/), [versões de Node.js e pnpm](https://developers.cloudflare.com/pages/configuration/build-image/), [limites](https://developers.cloudflare.com/pages/platform/limits/) e [configuração Wrangler](https://developers.cloudflare.com/pages/functions/wrangler-configuration/).
