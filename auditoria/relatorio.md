# Relatório de Auditoria — Suítes de Teste do Gilded Rose

**Objeto:** `test/jest/suite-1-baseline.spec.ts`, `test/jest/suite-2-persona.spec.ts`, `test/jest/suite-3-cot.spec.ts`
**Referência de verdade:** `app/gilded-rose.ts`
**Metodologia:** ver [auditoria.md](./auditoria.md) para a rubrica de 24 itens de regra/fronteira usada como base de comparação. Este documento reporta os resultados encontrados ao aplicar essa rubrica.

---

## 1. Resumo executivo

| Suíte | Técnica de prompt | Regras cobertas | % Cobertura | Testes com problema |
|---|---|---|---|---|
| Suite 1 | Baseline (sem técnica) | 14 / 24 | **58%** | 0 |
| Suite 2 | Persona (QA Sênior) | 23,5 / 24 | **98%** | 1 (redundante) |
| Suite 3 | Persona + Chain-of-Thought | 24 / 24 | **100%** | 0 |

**Achado principal:** a cobertura de regras de negócio cresce diretamente com a sofisticação da técnica de prompt. Nenhuma das três suítes contém uma assertion que valide um comportamento incorreto — todas as expectativas conferidas batem com o código real, inclusive nos pontos onde o código tem comportamento não-óbvio (dupla degradação no mesmo ciclo em que `sellIn` cruza de 0 para -1).

---

## 2. Regras de negócio auditadas

Extraídas de `app/gilded-rose.ts`, 22 regras agrupadas em 4 tipos de item + comportamento cross-cutting, desdobradas em 24 itens de verificação (a lista completa com o texto de cada regra está em [auditoria.md](./auditoria.md), seção "Regras de negócio extraídas"). Resumo por grupo:

- **Item normal:** degradação simples, degradação dupla (no vencimento e já vencido), floor em 0, decremento de sellIn — 5 itens.
- **Aged Brie:** valorização simples e dupla, cap em 50 (simples e duplo), decremento de sellIn — 5 itens.
- **Sulfuras:** imutabilidade total de quality e sellIn — 2 itens.
- **Backstage passes:** as 3 faixas de incremento (+1/+2/+3), zeragem pós-show e permanência em 0, cap de 50 em cada faixa, decremento de sellIn — 7 itens.
- **Cross-cutting:** múltiplos tipos de item na mesma chamada, comportamento acumulado em múltiplos dias, testes de fronteira em pares adjacentes — 3 itens (com sub-fronteiras, totalizando os 24).

---

## 3. Achados por suíte

### 3.1 Suite 1 — Baseline

**Cobertura: 14/24 (58%)**

O que está bem coberto: decremento simples de quality e sellIn, floor em 0 (caso simples e duplo), Aged Brie na alta simples e dupla, Sulfuras (imutabilidade completa), as 3 faixas do Backstage com valores centrais, zeragem de quality pós-show.

**Lacunas encontradas:**
- Nenhum teste cobre item normal ou Aged Brie com `sellIn` **já negativo antes do primeiro ciclo** (item já vencido há dias) — a suíte só testa a transição exatamente no dia em que `sellIn` cruza de 0 para -1.
- O cap de 50 só é exercitado no incremento simples. Não há teste em que o cap seja atingido durante um incremento duplo/triplo (ex.: Aged Brie com `quality=49, sellIn=0`, que deveria parar em 50 mesmo tendo direito a +2).
- Nas faixas do Backstage, só o limite superior de cada faixa foi testado (`sellIn=10` e `sellIn=5`); os limites inferiores (`sellIn=6` e `sellIn=1`) não aparecem.
- Não há nenhum teste de acumulação em múltiplos dias (loop de várias chamadas a `updateQuality()`).
- O teste de "múltiplos itens" combina apenas 2 dos 4 tipos (normal + Aged Brie); Sulfuras e Backstage nunca são exercitados junto com outros itens na mesma chamada.
- Não há assertion isolada de `sellIn` para Aged Brie ou Backstage fora do teste combinado.

**Testes incorretos ou frágeis:** nenhum encontrado. Todas as expectativas presentes batem com o comportamento real do código.

### 3.2 Suite 2 — Persona (QA Sênior)

**Cobertura: 23,5/24 (98%)**

Cobertura muito superior à baseline: inclui itens já vencidos (`sellIn` negativo de partida) para item normal e Aged Brie, cap de 50 testado nas 3 variações de incremento do Backstage, ambos os limites de cada faixa (10/6 e 5/1), `sellIn` verificado isoladamente para cada tipo de item, e uma seção dedicada de comportamento acumulado ao longo de múltiplos dias (incluindo Backstage caindo a 0 e permanecendo).

**Lacuna remanescente:**
- Mesmo problema da Suite 1: o teste de "múltiplos itens" só combina 2 tipos (normal + Aged Brie), não os 4.

**Teste com problema de qualidade (redundância/rótulo enganoso):**
- Os testes `'aumenta quality em 1 quando sellIn > 10'` e `'aumenta quality em 1 quando sellIn é exatamente 11'` chamam `updateOnce(NAME, 11, 20)` com **o mesmo input nos dois casos**. Os nomes sugerem dois cenários distintos (regra geral acima de 10 vs. fronteira exata em 11), mas na prática é o mesmo teste duplicado — nenhum valor diferente de 11 (ex. 12 ou 15) é exercitado para o caso genérico nesta suíte. Isso passa uma falsa sensação de dupla cobertura quando na verdade só uma entrada foi testada duas vezes.

### 3.3 Suite 3 — Persona + Chain-of-Thought

**Cobertura: 24/24 (100%)**

Cobertura completa de todas as regras e fronteiras da rubrica: itens já vencidos vs. dia exato do vencimento para todos os tipos; cap de 50 testado separadamente em cada uma das 3 faixas de incremento do Backstage, incluindo os casos em que o cap é atingido no 1º, 2º ou 3º incremento da cadeia; pares de fronteira adjacentes testados explicitamente (11 vs. 12, 10 vs. 6, 5 vs. 1, 0 vs. -1); comportamento acumulado em múltiplos dias cobrindo os 4 tipos de item; e o único teste de "múltiplos itens" que de fato combina os **4 tipos simultaneamente**.

Os comentários de raciocínio (Chain-of-Thought) presentes no cabeçalho e em cada teste foram conferidos linha a linha contra a lógica de `gilded-rose.ts` (ordem de decremento de quality antes do sellIn, guards `quality > 0` / `quality < 50`, ordem dos `if`s aninhados do Backstage) e todos batem com o comportamento real.

**Testes incorretos ou frágeis:** nenhum encontrado.

---

## 4. Conclusões

1. **Correção:** nas três suítes, toda assertion conferida corresponde ao comportamento real do código — incluindo os pontos de comportamento não-óbvio do `gilded-rose.ts` original (ex.: a degradação dobra no mesmo ciclo em que `sellIn` cruza de 0 para -1, não apenas em ciclos seguintes).
2. **Cobertura escala com a técnica de prompt:** Baseline (58%) → Persona (98%) → Persona+CoT (100%). O salto mais expressivo (Suite 1 → Suite 2) vem da inclusão de casos "já vencido" e do cap de 50 em incrementos múltiplos — categorias inteiras de caso que a baseline não cogitou.
3. **Lacuna recorrente:** Suites 1 e 2 nunca testam os 4 tipos de item juntos numa mesma chamada de `updateQuality()`, cenário mais próximo do uso real da classe. Só a Suite 3 cobre isso.
4. **Único problema de qualidade de teste identificado:** a duplicação de input nos dois testes de fronteira do Backstage na Suite 2 (ambos usam `sellIn=11`), que mascara a ausência de um teste genérico da faixa ">10".
5. **Suite 3 é a mais adequada como base de regressão**, por cobertura completa e rastreabilidade dos comentários à lógica do código-fonte.
