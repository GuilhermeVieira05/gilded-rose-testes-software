# Complexidade Ciclomática e Caminhos Básicos — `updateQuality()`

Grafo de referência: `iteracao-2/cfg/cfg-update-quality.excalidraw` (Pessoa 1).
Os números podem ser reproduzidos com `python verifica_cfg.py` (requer `networkx` e `numpy`).

## 1. Contagem do grafo

| Elemento | Qtd | Observação |
|---|---|---|
| Nós (N) | **28** | Numerados de 1 a 29, mas **não existe o nó 7** |
| Arestas (E) | **44** | Inclui a aresta de retorno 28 → 2 (`i++`) |
| Nós de decisão (P) | **17** | 2, 3, 4, 5, 8, 10, 11, 12, 14, 15, 17, 19, 20, 21, 22, 23, 26 (todos binários) |

> Atenção: quem contar pela numeração vai usar N = 29 e chegar em V(G) = 17. O valor correto é N = 28.

## 2. V(G) pelas três fórmulas

| Fórmula | Cálculo | Resultado |
|---|---|---|
| E − N + 2 | 44 − 28 + 2 | **18** |
| Decisões + 1 | 17 + 1 | **18** |
| Regiões | 17 regiões internas + 1 externa | **18** |

**V(G) = 18.** As três fórmulas batem, então a estrutura do grafo está correta.

Sobre as regiões: o desenho do Excalidraw tem arestas cruzadas (por exemplo, 8 → 17 e o retorno 28 → 2), então não dá para contar as regiões direto no PNG. O grafo é planar (verificado com `networkx.check_planarity`) e, redesenhado sem cruzamentos, tem 18 faces. Nesse redesenho, cada decisão binária fecha uma região interna.

**Observação (condição composta):** o nó 3 é `name != 'Aged Brie' && name != 'Backstage…'`. Se o `&&` for decomposto em duas condições simples (critério de condição / MC/DC), são 18 predicados e **V(G) = 19**. Para Cobertura de Decisão e Caminhos Básicos usamos o grafo como está: **18**.

## 3. Caminhos básicos independentes (18)

Método da linha de base (McCabe): partimos de um caminho comum (C1, item normal) e invertemos uma decisão por vez. Todos os caminhos são **executáveis** (verificados rodando o código real) e **linearmente independentes** (posto da matriz de arestas = 18). Juntos, cobrem **100% das 44 arestas**, ou seja, também garantem 100% de Cobertura de Decisão.

Cada caso é uma lista com **um item** (C2 é a lista vazia). *Vest* = `+5 Dexterity Vest` (item normal).

| # | Item (name, sellIn, quality) | Saída esperada (sellIn, quality) | Caminho | Decisão nova exercitada |
|---|---|---|---|---|
| C1 | Vest, 10, 20 | 9, 19 | 1-2-3-4-5-6-17-18-19-28-2-29 | linha de base |
| C2 | lista vazia `[]` | `[]` | 1-2-29 | 2F (loop não executa) |
| C3 | Vest, 10, 0 | 9, 0 | 1-2-3-4-17-18-19-28-2-29 | 4F (quality = 0) |
| C4 | Sulfuras, 0, 80 | 0, 80 | 1-2-3-4-5-17-19-28-2-29 | 5F, 17F (Sulfuras não muda) |
| C5 | Sulfuras, −1, 80 | −1, 80 | 1-2-3-4-5-17-19-20-21-22-23-28-2-29 | 23F |
| C6 | Vest, 0, 10 | −1, 8 | 1-2-3-4-5-6-17-18-19-20-21-22-23-24-28-2-29 | 19V, 20V, 21V, 22V, 23V (vencido degrada 2x) |
| C7 | Vest, 0, 1 | −1, 0 | 1-2-3-4-5-6-17-18-19-20-21-22-28-2-29 | 22F (quality chega a 0) |
| C8 | Aged Brie, 10, 20 | 9, 21 | 1-2-3-8-9-10-17-18-19-28-2-29 | 3F, 8V, 10F |
| C9 | Aged Brie, 10, 50 | 9, 50 | 1-2-3-8-17-18-19-28-2-29 | 8F (teto 50) |
| C10 | Aged Brie, 0, 10 | −1, 12 | 1-2-3-8-9-10-17-18-19-20-26-27-28-2-29 | 20F, 26V (Brie vencido +2) |
| C11 | Aged Brie, 0, 49 | −1, 50 | 1-2-3-8-9-10-17-18-19-20-26-28-2-29 | 26F |
| C12 | Backstage, 15, 20 | 14, 21 | 1-2-3-8-9-10-11-14-17-18-19-28-2-29 | 10V, 11F, 14F |
| C13 | Backstage, 10, 20 | 9, 22 | 1-2-3-8-9-10-11-12-13-14-17-18-19-28-2-29 | 11V, 12V (+2) |
| C14 | Backstage, 10, 49 | 9, 50 | 1-2-3-8-9-10-11-12-14-17-18-19-28-2-29 | 12F |
| C15 | Backstage, 5, 20 | 4, 23 | 1-2-3-8-9-10-11-12-13-14-15-16-17-18-19-28-2-29 | 14V, 15V (+3) |
| C16 | Backstage, 5, 48 | 4, 50 | 1-2-3-8-9-10-11-12-13-14-15-17-18-19-28-2-29 | 15F |
| C17 | Backstage, 0, 20 | −1, 0 | 1-2-3-8-9-10-11-12-13-14-15-16-17-18-19-20-21-25-28-2-29 | 21F (show passou, quality = 0) |
| C18 | Sulfuras, 0, **0** | 0, 0 | 1-2-3-4-17-19-28-2-29 | combinação 4F + 17F |

Backstage = `Backstage passes to a TAFKAL80ETC concert`; Sulfuras = `Sulfuras, Hand of Ragnaros`.

### Achado para a auditoria (C18)

O 18º caminho independente só aparece com **Sulfuras e quality ≤ 0**. Esse valor fica fora da especificação, que fixa a qualidade da Sulfuras em 80, mas é alcançável pelo código. Testamos exaustivamente todas as combinações de item único: os outros 17 caminhos, com entradas "realistas", só chegam a posto 17. Uma lista com 2 itens iguais também não ajuda, porque é combinação linear de C1 e C2. **Conclusão:** um prompt que siga só a regra de negócio nunca gera o conjunto completo de caminhos básicos. Esse é um bom ponto para comparar IA × grafo.

### Caminhos básicos × Cobertura de Decisão

C18 não cobre nenhuma aresta nova, porque C1–C17 já cobrem as 44 arestas. A Cobertura de Decisão, porém, exige bem menos casos. Uma busca exaustiva mostrou que **8 cenários de item** já exercitam os 34 ramos V/F (o ramo 2F é coberto por qualquer execução, já que o laço sempre termina):

| Item (name, sellIn, quality) |
|---|
| Vest, −3, 0 |
| Vest, −3, 2 |
| Aged Brie, −3, 0 |
| Aged Brie, −3, 50 |
| Backstage, −3, 0 |
| Backstage, −3, 49 |
| Backstage, 11, 0 |
| Sulfuras, −1, 80 |

Esses 8 cenários podem virar 8 testes ou um único teste com uma lista de 8 itens. **Resumo: Cobertura de Decisão (100%) = 8 cenários; Caminhos Básicos = 18 casos.**

## 4. Revisão do grafo da Pessoa 1

Conferi as 44 arestas contra o código-fonte (`app/gilded-rose.ts`). **Todas as ligações estão semanticamente corretas**, e as três fórmulas batem. Sugestões de ajuste visual antes de ir para os slides:

1. **Nó 7 inexistente:** a numeração pula do 6 para o 8. Sugiro renumerar (8→7 … 29→28) ou deixar uma nota explicando, para evitar o erro N = 29.
2. **Aresta 25 → 28** passa na horizontal por cima do nó 27. No PNG, parece que existe uma ligação 27 ↔ 25. Convém desviar a linha por baixo ou pela direita.
3. **Aresta 17 (F) → 19** sai exatamente do ponto onde chegam 4F, 5F e 6 (lado direito do 17), e a direção fica ambígua. Convém separar os pontos de chegada e de saída.
4. As setas do `.excalidraw` não estão "grudadas" nos nós (sem *binding*). Se alguém mover um nó, as setas ficam soltas.
5. Os rótulos V/F de 12F e 13 → 14 ficam sobrepostos perto do nó 14. Convém reposicioná-los para facilitar a leitura.

## 5. Resumo para o quadro comparativo (Pessoa 5)

| Métrica | Valor |
|---|---|
| V(G) | 18 (19 decompondo o `&&` do nó 3) |
| Caminhos básicos independentes | 18 (tabela da seção 3) |
| Casos mínimos para 100% de Cobertura de Decisão | 8 cenários de item (seção 3) |
| Arestas de decisão (ramos V/F) | 34 (17 decisões × 2) |
