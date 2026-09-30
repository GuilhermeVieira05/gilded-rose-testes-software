# Prompt 4 — Estrutural (CFG + Cobertura de Decisão)

---

```
Você é um engenheiro sênior de QA especializado em análise estrutural de caixa branca
(white-box testing) e testes de regressão de sistemas legados.

Esse repositório contém o código-fonte de um sistema chamado Gilded Rose, escrito em
TypeScript. O método sob teste é `updateQuality()`, em `app/gilded-rose.ts`.

Já realizamos a análise de fluxo de controle desse método e levantamos o seguinte:

## Grafo de Fluxo de Controle (CFG)

O método possui 17 decisões binárias (cada uma produz um resultado Verdadeiro ou Falso):

1. `i < items.length` — condição do laço `for` que percorre os itens.
2. `name != 'Aged Brie' && name != 'Backstage passes to a TAFKAL80ETC concert'` — item é
   "normal" (tratado pela regra padrão de degradação).
3. `quality > 0` — quality atual permite decremento (1ª dedução, itens normais/Sulfuras).
4. `name != 'Sulfuras, Hand of Ragnaros'` — item não é Sulfuras (Sulfuras é imutável).
5. `quality < 50` — quality atual permite incremento (Aged Brie, antes do decremento de
   sellIn).
6. `name == 'Backstage passes to a TAFKAL80ETC concert'` — item é um Backstage pass.
7. `sellIn < 11` — Backstage pass está a 10 dias ou menos do show (faixa +2).
8. `quality < 50` — guarda de teto para o incremento da faixa +2 do Backstage.
9. `sellIn < 6` — Backstage pass está a 5 dias ou menos do show (faixa +3).
10. `quality < 50` — guarda de teto para o incremento da faixa +3 do Backstage.
11. `name != 'Sulfuras, Hand of Ragnaros'` — item não é Sulfuras (guarda do decremento de
    sellIn).
12. `sellIn < 0` — sellIn já cruzou o vencimento após o decremento deste ciclo.
13. `name != 'Aged Brie'` — item não é Aged Brie (ramo de degradação/zeragem pós-vencimento).
14. `name != 'Backstage passes to a TAFKAL80ETC concert'` — item não é Backstage pass
    (ramo de degradação simples de itens normais, pós-vencimento).
15. `quality > 0` — guarda para a 2ª dedução de itens normais vencidos.
16. `name != 'Sulfuras, Hand of Ragnaros'` — guarda redundante de Sulfuras aninhada dentro
    da 2ª dedução de itens normais vencidos (Sulfuras nunca chega até aqui na prática, mas é
    uma decisão estrutural do grafo).
17. `quality < 50` — guarda para a 2ª valorização de Aged Brie vencido.

(A numeração acima segue a ordem de avaliação lógica das condições no código; ela não
precisa bater com a numeração de nós do desenho do CFG, que pula alguns números por causa
de nós de junção/estrutura do grafo.)

## Complexidade Ciclomática

V(G) = 18, calculado por três fórmulas que batem entre si (arestas − nós + 2; decisões + 1;
regiões do grafo). Esse número é o **limite inferior de casos de teste linearmente
independentes** necessários para exercitar toda a estrutura do método — ou seja, uma suíte
com menos de 18 casos matematicamente não consegue cobrir todos os caminhos básicos
independentes do grafo.

## Critério de cobertura exigido

Use **Cobertura de Decisão**: cada uma das 17 decisões listadas acima deve produzir tanto o
resultado Verdadeiro quanto o Falso em pelo menos um teste da suíte (34 resultados V/F no
total). Não é necessário cobrir todas as combinações possíveis de caminhos (isso seria
Cobertura de Caminhos, um critério mais forte) — apenas garantir que nenhum ramo V ou F
fique sem exercício.

## O que fazer

Antes de gerar qualquer teste, raciocine passo a passo:

1. Para cada uma das 17 decisões, identifique um cenário de entrada (name, sellIn, quality)
   que force o resultado Verdadeiro e outro que force o Falso.
2. Verifique se algum cenário já criado para uma decisão também força, de brinde, o V ou F
   de outra decisão ainda não coberta — e reaproveite esse cenário em vez de criar um novo,
   para minimizar o número de casos.
3. Monte a lista final de cenários mínimos necessários para fechar as 34 combinações V/F.

Depois, gere uma suíte de testes unitários usando Jest e TypeScript que implemente
exatamente esses cenários. Regras de saída:

- Use o menor número de casos de teste (`it(...)`) que ainda feche 100% da cobertura de
  decisão. Não adicione testes de regra de negócio que não sejam necessários para fechar
  algum V/F ainda em aberto.
- Cada teste deve ter, em comentário, a lista das decisões (pelo número desta lista) e o
  resultado (V ou F) que ele cobre.
- Ao final da suíte, inclua uma tabela em comentário relacionando as 17 decisões às suas
  ocorrências V e F, no mesmo estilo de uma matriz de cobertura.
```
