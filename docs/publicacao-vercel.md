# Publicação na Vercel

O projeto está preparado para importar um repositório GitHub na Vercel. Não requer banco de dados, chave do WhatsApp ou serviço de pagamentos.

## Importação

1. Entre na Vercel e selecione **Add New → Project**.
2. Conecte o GitHub e importe o repositório do Yummi Sushi Delivery.
3. Mantenha o diretório raiz do projeto na raiz do repositório e o framework **Next.js**.
4. Use Node.js **24.x**. Os comandos de instalação e build e a saída **out** já estão definidos em `vercel.json`.
5. Clique em **Deploy**. Depois confira a página inicial, `/demonstracao`, imagens, alternância de tema e seleção de produtos.

O projeto usa pnpm **11.25.0**, preservando `pnpm-lock.yaml`. A instalação executa `--frozen-lockfile` para impedir mudanças silenciosas nas dependências.

## Domínio e metadados

Na Vercel, os metadados usam `VERCEL_PROJECT_PRODUCTION_URL` (ou `VERCEL_URL` quando o primeiro não estiver disponível). Para um domínio próprio, configure `NEXT_PUBLIC_SITE_URL` com a URL completa, por exemplo `https://seu-dominio.com.br`, e faça um novo deploy. Fora da Vercel, sem essa variável, permanece o endereço público atual do cardápio.

Não há variáveis secretas obrigatórias. Não envie arquivos `.env` ou a pasta `.vercel` ao GitHub.

## Verificação local

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm build
pnpm typecheck
pnpm verify:menu
pnpm test
```

O build gera os arquivos estáticos em `out/`. Nenhum servidor de pedidos é criado. O WhatsApp abre uma conversa com mensagem preenchida e exige confirmação de envio pelo cliente.

## Conteúdo incluído

As imagens usadas pelo cardápio e o ZIP de artes já estão em `public/`; não é necessário gerar imagens durante a instalação ou o build. O script de preparação das artes é uma ferramenta editorial opcional, cujas referências locais de origem não fazem parte do repositório.

O endereço hospedado pelo Sites continua separado da publicação na Vercel. A configuração `.openai/hosting.json` preserva essa hospedagem e não é necessária para a Vercel.

## Conferência após publicação

- Abrir no celular e no computador, testar modo claro/escuro e recarregar.
- Pesquisar e filtrar categorias; conferir imagens e preços.
- Adicionar itens, escolher sabores e complementos, ajustar quantidades e conferir subtotais.
- Abrir **Mostrar ao garçom** e a conversa do WhatsApp sem enviar um pedido de teste ao restaurante.
- Validar `canonical` e a imagem de compartilhamento no domínio definitivo.

Referências: [configuração da Vercel](https://vercel.com/docs/project-configuration), [gerenciadores de pacotes](https://vercel.com/docs/package-managers), [Node.js](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) e [variáveis do sistema](https://vercel.com/docs/environment-variables/system-environment-variables).
