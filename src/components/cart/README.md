# Seleção de produtos

- `selection-root.tsx`: escolhe o catálogo comercial ou a demonstração e monta os controles globais.
- `selection-context.tsx`: integração do estado externo com React usando `useSyncExternalStore`. Persistência e sincronização ficam em `src/lib/selection-store.ts`, com snapshot SSR estável e sem ciclos de regravação entre abas. Chaves separadas: `yummi.selection.v1` e `yummi.selection.demo.v1`.
- `product-selection-form.tsx`: quantidade, sabores/preparo, adicionais obrigatórios/opcionais e observações.
- `selection-drawer.tsx`: lista editável, limpeza com confirmação e apresentação ao garçom.
- `selection-access.tsx`: contador do header, barra flutuante e confirmação das ações.
- `quantity-control.tsx`: controles de toque, limite de 99 por linha e remoção ao chegar a zero na lista.

Regras e cálculos estão em `src/lib/selection.ts`. Preços são lidos exclusivamente do catálogo e convertidos para centavos inteiros. O armazenamento persiste IDs, quantidades, opções e observações, sem cópias de preços. Recuperação rejeita linhas inválidas, indisponíveis ou com configuração obsoleta e avisa o usuário.

Disponibilidade `unconfirmed` permite montar a lista, com aviso de confirmação pelo restaurante; `unavailable` bloqueia. Não há confirmação de estoque, envio automático de pedido, pagamento ou backend. A demonstração é isolada e identificada como fictícia.

`whatsapp-order-action.tsx` abre a conversa oficial com mensagem preenchida, somente no clique e após revalidação pelo catálogo. Seleção vazia ou fictícia fica bloqueada. A prévia e a cópia manual são alternativas quando a abertura não funcionar. A seleção nunca é limpa ao abrir o WhatsApp; “Mostrar ao garçom” permanece um modo de leitura independente.
