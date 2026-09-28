# Abordagem manual

## 1. Critério e escopo

**Critério escolhido: cobertura de decisão do método `updateQuality()`.**

Cada decisão deve produzir os resultados verdadeiro (V) e falso (F) pelo menos uma vez no conjunto de casos. O laço `for` também é uma decisão: continuar a iteração corresponde a V; encerrar o laço corresponde a F.

Referências:

- [Código analisado](../../app/gilded-rose.ts), na revisão `7e614c8`.
- [CFG](../cfg/cfg-update-quality.png) e [arquivo editável](../cfg/cfg-update-quality.excalidraw).
- [Análise](../complexidade/complexidade-ciclomatica.md), especialmente os oito cenários propostos para cobertura de decisão.

Mantemos a numeração do CFG, inclusive o salto do nó 6 para o 8. O grafo contém **17 decisões binárias**, portanto há **34 resultados V/F a mapear**. A condição composta do nó 3 (`name != Aged Brie && name != Backstage`) é considerada uma única decisão, conforme esse CFG. A avaliação separada das condições e o critério MC/DC ficam fora deste mapeamento.

**Cobertura mapeada = resultados V/F contemplados ÷ 34 × 100.**

O percentual deste documento descreve a proposta manual. A medição das suítes das iterações e a comparação com os relatórios da ferramenta fazem parte da etapa de auditoria.

## 2. Preparação dos casos

Cada caso M1–M8 usa uma nova instância de `GildedRose`, com uma lista contendo apenas o item indicado, e executa **uma chamada** a `updateQuality()`. Os casos são independentes. O resultado esperado informa os valores finais de `sellIn` e `quality`; o nome permanece igual e a lista retornada contém esse item atualizado.

Nomes exatos usados na tabela:

| Abreviação | `name` |
|---|---|
| Vest | `+5 Dexterity Vest` |
| Brie | `Aged Brie` |
| Backstage | `Backstage passes to a TAFKAL80ETC concert` |
| Sulfuras | `Sulfuras, Hand of Ragnaros` |

As entradas preservam os oito cenários propostos na análise de complexidade ciclomática. Valores negativos de `sellIn` representam itens vencidos; Sulfuras mantém qualidade 80.

## 3. Tabela de casos ideais

Na última coluna, `4F`, por exemplo, significa que a decisão do nó 4 teve resultado falso. Os resultados aparecem na ordem de avaliação, incluindo a entrada e a saída do laço.

| Caso | Item | `sellIn` inicial | `quality` inicial | Resultado esperado (`sellIn`, `quality`) | Decisões cobertas |
|---|---|---:|---:|---|---|
| M1 | Vest | -3 | 0 | (-4, 0) | 2V, 3V, 4F, 17V, 19V, 20V, 21V, 22F, 2F |
| M2 | Vest | -3 | 2 | (-4, 0) | 2V, 3V, 4V, 5V, 17V, 19V, 20V, 21V, 22V, 23V, 2F |
| M3 | Brie | -3 | 0 | (-4, 2) | 2V, 3F, 8V, 10F, 17V, 19V, 20F, 26V, 2F |
| M4 | Brie | -3 | 50 | (-4, 50) | 2V, 3F, 8F, 17V, 19V, 20F, 26F, 2F |
| M5 | Backstage | -3 | 0 | (-4, 0) | 2V, 3F, 8V, 10V, 11V, 12V, 14V, 15V, 17V, 19V, 20V, 21F, 2F |
| M6 | Backstage | -3 | 49 | (-4, 0) | 2V, 3F, 8V, 10V, 11V, 12F, 14V, 15F, 17V, 19V, 20V, 21F, 2F |
| M7 | Backstage | 11 | 0 | (10, 1) | 2V, 3F, 8V, 10V, 11F, 14F, 17V, 19F, 2F |
| M8 | Sulfuras | -1 | 80 | (-1, 80) | 2V, 3V, 4V, 5F, 17F, 19V, 20V, 21V, 22V, 23F, 2F |

### Como obter os resultados esperados

- **M1:** qualidade zero impede as duas reduções; `sellIn` diminui de -3 para -4.
- **M2:** a primeira redução leva a qualidade de 2 para 1; após diminuir `sellIn`, a segunda redução leva a qualidade a zero.
- **M3:** Brie recebe um incremento antes de diminuir `sellIn` e outro por estar vencido: 0 → 1 → 2.
- **M4:** qualidade 50 bloqueia ambos os incrementos de Brie.
- **M5:** Backstage passa por 0 → 1 → 2 → 3. Depois, como o `sellIn` atualizado é negativo, a qualidade é zerada.
- **M6:** o primeiro incremento leva a qualidade de 49 para 50. Os nós 12 e 15 bloqueiam novos incrementos; após a atualização de `sellIn`, a qualidade é zerada.
- **M7:** `sellIn = 11` torna falsas as condições `< 11` e `< 6`. Há apenas um incremento de qualidade; `sellIn` termina em 10 e a qualidade permanece em 1.
- **M8:** Sulfuras não sofre redução de qualidade nem de `sellIn`. Como já tem `sellIn` negativo, também alcança o nó 23 e exercita seu ramo F.

## 4. Matriz de cobertura das decisões

As condições abaixo usam as abreviações da seção 2. `quality` e `sellIn` são avaliados com os valores existentes naquele ponto da execução, incluindo alterações anteriores.

| Nó | Condição | Casos com V | Casos com F |
|---:|---|---|---|
| 2 | `i < items.length` | M1–M8 | M1–M8 |
| 3 | `name != Brie && name != Backstage` | M1, M2, M8 | M3, M4, M5, M6, M7 |
| 4 | `quality > 0` | M2, M8 | M1 |
| 5 | `name != Sulfuras` | M2 | M8 |
| 8 | `quality < 50` | M3, M5, M6, M7 | M4 |
| 10 | `name == Backstage` | M5, M6, M7 | M3 |
| 11 | `sellIn < 11` | M5, M6 | M7 |
| 12 | `quality < 50` | M5 | M6 |
| 14 | `sellIn < 6` | M5, M6 | M7 |
| 15 | `quality < 50` | M5 | M6 |
| 17 | `name != Sulfuras` | M1, M2, M3, M4, M5, M6, M7 | M8 |
| 19 | `sellIn < 0` | M1, M2, M3, M4, M5, M6, M8 | M7 |
| 20 | `name != Brie` | M1, M2, M5, M6, M8 | M3, M4 |
| 21 | `name != Backstage` | M1, M2, M8 | M5, M6 |
| 22 | `quality > 0` | M2, M8 | M1 |
| 23 | `name != Sulfuras` | M2 | M8 |
| 26 | `quality < 50` | M3 | M4 |

**Resultado: 34 de 34 resultados V/F mapeados, correspondendo a 100% de cobertura de decisão do CFG.**

Todos os casos percorrem 2V ao processar o item e 2F ao encerrar o laço. Uma lista vazia pode complementar os testes funcionais, mas não acrescenta um resultado de decisão a este conjunto.

## 5. Quantidade necessária e justificativa

**São necessários e suficientes oito cenários de item para este critério**, contando uma atualização de um item por cenário. A tabela os organiza em oito casos independentes.

O limite mínimo decorre de resultados que não podem ocorrer juntos na mesma atualização de um item:

1. **Três cenários no ramo de itens diferentes de Brie e Backstage:** 4F, 5V e 5F são mutuamente exclusivos. Se 4F ocorre, o nó 5 não é avaliado; quando o nó 5 é avaliado, produz apenas V ou F. M1, M2 e M8 cobrem essas três possibilidades.
2. **Dois cenários de Brie:** o nó 26 só é alcançado por Brie vencido e precisa produzir V e F. M3 e M4 atendem a essa exigência.
3. **Três cenários de Backstage:** 11F, 12V e 12F são mutuamente exclusivos. Quando 11F ocorre, o nó 12 não é avaliado; quando ele é avaliado, produz apenas V ou F. M5, M6 e M7 atendem a essa exigência.

Esses três grupos de tipos de item são disjuntos. Logo, o limite inferior é **3 + 2 + 3 = 8 cenários**. Como a matriz demonstra que oito cenários cobrem todos os resultados, esse limite é atingido.

Os mesmos oito itens poderiam ser reunidos em uma única chamada a `updateQuality()`. Nesse formato haveria um teste automatizado com oito cenários de item. Para a comparação nos slides, a unidade adotada aqui é **oito casos com um item e uma chamada cada**.

Os 18 caminhos básicos descritos na análise de complexidade ciclomática correspondem a outro critério. Cobrir todos os resultados de decisão não implica percorrer todas as combinações de decisões nem todos os caminhos possíveis.

## 6. Conferência e resumo dos resultados

Os oito resultados esperados foram conferidos executando em memória o corpo original de `updateQuality()`. Uma cópia em memória com registro das decisões confirmou as sequências da tabela e a união dos 34 resultados V/F. Essa conferência não altera o código da aplicação nem mede as suítes das iterações.

Valores para a coluna **Abordagem Manual (Teórica)** do quadro comparativo:

| Campo | Valor para os slides |
|---|---|
| Critério | Cobertura de decisão do CFG |
| Cobertura de decisão mapeada | **100% — 34/34 resultados V/F** |
| Quantidade necessária | **8 casos**, cada um com um item e uma chamada |
| Alucinações | **N/A**, conforme o quadro do enunciado |
| Evidências | Tabela de casos (seção 3), matriz (seção 4) e justificativa do mínimo (seção 5) |

A abordagem manual mapeou oito casos que exercitam os dois resultados das 17 decisões do CFG de `updateQuality()`, atingindo 100% dos 34 ramos V/F. As entradas, os resultados esperados e as decisões cobertas estão documentados por caso.
