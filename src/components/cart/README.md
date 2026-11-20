# Seleção de produtos

- `selection-root.tsx`: escolhe o catálogo comercial ou a demonstração e monta os controles globais.
- `selection-context.tsx`: integração do estado externo com React usando `useSyncExternalStore`. Persistência e sincronização ficam em `src/lib/selection-store.ts`, com snapshot SSR estável e sem ciclos de regravação entre abas. Chaves separadas: `yummi.selection.v1` e `yummi.selection.demo.v1`.
- `product-selection-form.tsx`: quantidade, sabores/preparo, adicionais obrigatórios/opcionais e observações.
- `selection-drawer.tsx`: lista editável, limpeza com confirmação e apresentação ao garçom.
- `selection-access.tsx`: contador do header, barra flutuante e confirmação das ações.
- `quantity-control.tsx`: controles de toque, limite de 99 por linha e remoção ao chegar a zero na lista.

Regras e cálculos estão em `src/lib/selection.ts`. Preços são lidos exclusivamente do catálogo e convertidos para centavos inteiros. O armazenamento persiste IDs, quantidades, opções e observações, sem cópias de preços. Recuperação rejeita linhas inválidas, indisponíveis ou com configuração obsoleta e avisa o usuário.

Complementos comerciais têm uma única unidade de cortesia por pedido, somando todos os sabores e linhas. O catálogo mantém o valor-base da cortesia (zero); `src/lib/complement-policy.ts` define o acréscimo de 200 centavos por unidade extra. `priceSelection` distribui a cortesia na ordem da seleção e deriva os subtotais atuais sem alterar o estado persistido. `selectionTotals`, a lista para o garçom e a mensagem do WhatsApp usam esses valores. Alterar quantidades, remover itens ou recuperar a seleção recalcula a regra; separar complementos em linhas diferentes não concede novas cortesias.

Disponibilidade `unconfirmed` permite montar a lista, com aviso de confirmação pelo restaurante; `unavailable` bloqueia. Não há confirmação de estoque, envio automático de pedido, pagamento ou backend. A demonstração é isolada e identificada como fictícia.

`whatsapp-order-action.tsx` apresenta o endereço de entrega antes de abrir a conversa oficial. Rua, número (ou S/N), CEP e bairro são obrigatórios. Os bairros e taxas oficiais ficam em `src/data/delivery.ts`, em centavos; `src/lib/delivery.ts` valida o endereço e resolve o frete pela tabela atual. Bairro ausente ou desconhecido bloqueia a finalização. O CEP tem validação de formato, sem consulta externa ou verificação de correspondência com a rua.

`src/lib/whatsapp.ts` revalida produtos, adicionais e frete no clique e monta a mensagem com endereço, subtotal, taxa e total separados. Seleção vazia, fictícia ou inválida fica bloqueada. Nenhum pedido é enviado automaticamente e a seleção nunca é limpa ao abrir o WhatsApp. O endereço fica somente na memória da página, sem persistência no localStorage; “Mostrar ao garçom” permanece independente e não exige endereço.
