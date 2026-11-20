# Painel do proprietário

Endereço: `/admin`. Existe somente um proprietário, sem cadastro público. E-mail e hash PBKDF2 da senha são segredos da Cloudflare (`OWNER_EMAIL`, `OWNER_PASSWORD_HASH`), nunca variáveis `NEXT_PUBLIC_*`. O hash usa sal aleatório e 100 mil iterações SHA-256. A senha em texto puro não é armazenada pelo aplicativo.

O proprietário edita produtos, preços, descrições, composição existente, disponibilidade, fotos, horários e bairros/taxas. As edições ficam na aba até usar **Salvar e publicar**. Fotos são convertidas em WebP pelo navegador e gravadas separadamente no D1. A logo oficial não é editada pelo painel. A política de cortesia continua fixa na aplicação.

O catálogo público é servido por `/api/catalog`. O cliente bloqueia a seleção até receber dados válidos, inclusive após falhas de atualização. Os preços do carrinho continuam reconciliados com o catálogo atual. Uma atualização de revisão reinicializa a seleção a partir dos IDs salvos, descartando itens removidos ou indisponíveis.

Pages Functions usam o binding `DB` para `yummi-owner-menu`. Execute migrations com `pnpm exec wrangler d1 migrations apply yummi-owner-menu --remote`. Publique com o build habitual da Cloudflare; a pasta `functions/` também deve estar no repositório. `pnpm-workspace.yaml` autoriza os scripts oficiais de esbuild e workerd.

Sessões duram quatro horas e usam tokens aleatórios cujo hash fica no banco. Cookies são Secure, HttpOnly e SameSite=Strict. Logout revoga a sessão no banco. Escritas exigem mesma origem. Login tem limite de cinco tentativas por IP em quinze minutos. Publicação usa revisão para impedir sobrescrita silenciosa entre abas.

Não há recuperação automática de senha por e-mail nesta versão. A redefinição exige atualizar o segredo `OWNER_PASSWORD_HASH` na Cloudflare e republicar. Não há pagamento, cadastro de clientes ou armazenamento de pedidos no painel.

Os dados do cardápio e imagens devem receber backups periódicos do D1. Não remover o banco ao republicar o site.
