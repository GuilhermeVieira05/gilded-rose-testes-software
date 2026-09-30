# Auditoria de Cobertura de Decisão — Iteração 1 vs. Iteração 2 (Pessoa 4)

Complementa [`relatorio.md`](./relatorio.md) (auditoria por rubrica de regras de negócio,
feita antes do CFG existir). Este documento usa o **critério que o grupo adotou**
(Cobertura de Decisão do CFG de `updateQuality()`, ver
[`iteracao-2/abordagem-manual/abordagem-manual.md`](../iteracao-2/abordagem-manual/abordagem-manual.md))
e a numeração de decisões D1–D17 de
[`prompts/prompt-4-estrutural-cfg.md`](../prompts/prompt-4-estrutural-cfg.md), e cobre as
duas suítes: a da Iteração 1 (3 prompts ingênuos) e a da Iteração 2 (`suite-4-estrutural`,
prompt estruturado).

## 1. Metodologia — por que não usar só o `% Branch` do Jest

Medi primeiro com `jest --coverage --coverageProvider=babel`. Resultado: as três suítes da
Iteração 1, sozinhas ou juntas, davam ~95–96% de "Branch", com um único item nunca coberto
(o parâmetro default do construtor, `items = []`, fora do escopo do método auditado). Isso
sugeriria 100% de cobertura de decisão dentro de `updateQuality()` — **mas é enganoso**:
istanbul só cria 2 desfechos instrumentados (V e F) para `if/else` explícitos; um `if` sem
`else` (a maioria das guard clauses deste arquivo: `quality > 0`, `quality < 50`,
`sellIn < 11`, etc.) só registra **quantas vezes o bloco rodou**, não se o caminho em que
ele é **pulado** também foi exercitado. Ou seja, o relatório padrão de cobertura pode
mostrar "100%" mesmo faltando o lado F de várias decisões.

Por isso instrumentei manualmente cada uma das 17 decisões do CFG (script reprodutível em
[`evidencias/trace-decisoes.js`](./evidencias/trace-decisoes.js)): troco temporariamente
`app/gilded-rose.ts` por uma cópia idêntica em comportamento, mas que grava `D<n>:V` ou
`D<n>:F` a cada decisão avaliada, rodo a suíte pedida, meço a cobertura real e restauro o
arquivo original (`git checkout --`) ao final. É o mesmo código, só com logging — todas as
109 asserções das 4 suítes continuam passando com a versão instrumentada.

Reprodução: `node auditoria/evidencias/trace-decisoes.js <arquivo(s)-de-teste>` (requer
`app/gilded-rose.ts` sem alterações pendentes).

## 2. Cobertura de decisão medida

D1 (condição do `for`) não entra na contagem por ser trivial: qualquer suíte com pelo menos
um item cobre V, e o laço sempre termina, cobrindo F. Restam **32 resultados V/F possíveis
(D2–D17)**.

| Suíte | Prompt | Testes | Cobertura de decisão (D2–D17) | Resultados faltando |
|---|---|---:|---:|---|
| `suite-1-baseline` | 1 — Baseline | 16 | **93,8%** (30/32) | D16:F, D17:F |
| `suite-2-persona` | 2 — Persona | 34 | **100%** (32/32) | nenhum |
| `suite-3-cot` | 3 — Persona+CoT | 48 | **100%** (32/32) | nenhum |
| **Iteração 1 (as 3 juntas)** | — | **98** | **100%** (32/32) | nenhum |
| **`suite-4-estrutural` (Iteração 2)** | 4 — Estrutural/CFG | **11** | **100%** (32/32) | nenhum |

**D16:F** = `name != 'Sulfuras'` avaliando falso na 2ª dedução (item pós-vencimento) — só
acontece com Sulfuras cujo `sellIn` **já** é negativo na entrada (Sulfuras nunca é
decrementado, então só chega aí se já nasceu vencido). **D17:F** = guarda `quality < 50` da
2ª valorização de Aged Brie vencido avaliando falso — precisa de Brie já vencido **e** já
no teto 50 ao mesmo tempo. A suíte 1 nunca testa Sulfuras com `sellIn` inicial negativo nem
Brie vencido com `quality` no teto — as suítes 2 e 3 cobrem ambos.

Isso confirma, de forma independente e por instrumentação (não só por comparação com a
rubrica de regras de negócio do `relatorio.md`), a mesma conclusão qualitativa de lá:
cobertura cresce com a técnica de prompt — mas aqui o salto real (decisão) é pequeno
(93,8% → 100%), bem menor que o salto reportado na rubrica de regras de negócio
(58% → 98% → 100%). **Achado de auditoria:** cobertura de decisão e cobertura de regras de
negócio/fronteira medem coisas diferentes — a suíte baseline já exercita quase todas as
decisões do código pelo menos uma vez, mas isso não significa que ela valida os cenários de
negócio relevantes (ver `relatorio.md`, seção 3.1, para os gaps de regra que a cobertura de
decisão sozinha não denuncia).

## 3. Cruzamento com os caminhos 

[`complexidade-ciclomatica.md`](../iteracao-2/complexidade/complexidade-ciclomatica.md)
lista 18 caminhos básicos independentes (C1–C18) e destaca que **C18 — Sulfuras com
`quality` fora da especificação (≤ 0)** só existe fora das regras de negócio documentadas
e "nenhum prompt que siga só a regra de negócio gera esse caminho".

Conferido: nenhuma das 4 suítes (1, 2, 3 ou 4) testa Sulfuras com `quality` diferente de 80.
Isso confirma empiricamente a previsão da Pessoa 2 — inclusive o **prompt estruturado
(Iteração 2)**, que partiu direto do CFG e da lista de decisões, não gerou esse caso, porque
ele não é necessário para 100% de Cobertura de Decisão (é um requisito de **Cobertura de
Caminhos**, critério mais forte, que nenhuma das 4 suítes teve como alvo).

## 4. Alucinações

### Iteração 1

Nenhuma suíte tem `expect` incorreto (as 98 asserções batem com o comportamento real do
código, inclusive nos pontos não-óbvios). As alucinações encontradas são de
**cobertura reivindicada vs. gerada**, não de valores errados:

1. **`suite-3-cot.spec.ts`, comentário do topo (linhas 32-33):** afirma ter mapeado
   `quality ∈ {0, 1, 2}` como valores de fronteira para item normal, mas nenhum teste
   gerado usa `quality = 2` (só `{10, 1, 0}` aparecem nos testes `R1-Q1`–`R1-Q8`). A IA
   "prometeu" no raciocínio CoT uma fronteira que não materializou em código.
2. **`suite-2-persona.spec.ts`, linhas 120-128:** dois testes (`'sellIn > 10'` e
   `'sellIn é exatamente 11'`) chamam `updateOnce(NAME, 11, 20)` com **o mesmo input**,
   como se fossem dois cenários de fronteira distintos. Não afeta o valor esperado (ambos
   corretos), mas mascara a ausência de um teste genérico para a faixa ">10" com outro
   valor (ex. 15).

### Iteração 2 (`suite-4-estrutural.spec.ts`)

A suíte inclui, ao final, uma tabela em comentário reivindicando qual teste cobre o V e o F
de cada uma das 17 decisões. **Verifiquei essa tabela teste a teste, traçando cada um dos
11 cenários (T1–T11) pela versão instrumentada do código** — todas as 11 linhas conferem
exatamente com o que o código realmente executa; nenhuma decisão reivindicada no comentário
diverge da execução real. **Não encontrei alucinação de valores nem de cobertura nesta
suíte.**

**Achado relevante (não é alucinação, é ineficiência):** o prompt 4 pediu explicitamente
"use o menor número de casos de teste que ainda feche 100% da cobertura de decisão". A IA
gerou **11 cenários**. Tanto a Pessoa 2 (`complexidade-ciclomatica.md`, seção 3, "8
cenários de item") quanto a Pessoa 3 (`abordagem-manual.md`, seção 5, prova de que 8 é o
mínimo teórico por 3 grupos disjuntos de item) chegaram, de forma independente, a um mínimo
comprovado de **8 casos** para o mesmo critério. Ou seja: mesmo recebendo o CFG, o V(G) e a
instrução explícita de minimizar, a suíte gerada pela IA usou **3 casos a mais (37,5%
acima) do mínimo demonstrado**. É um bom contraste para o quadro "Evolução de Prompt":
o prompt estruturado eliminou os problemas de cobertura de decisão da Iteração 1, mas não
atingiu a otimalidade que a análise manual (Pessoa 2/3) prova ser alcançável.

## 5. Valores para o quadro comparativo final 

| Critério | Iteração 1 (Prompt Ingênuo) | Abordagem Manual (Teórica) | Iteração 2 (Prompt Estruturado) |
|---|---|---|---|
| Cobertura de Decisão | **100%** (32/32, suítes 1+2+3 combinadas — suite-1 isolada: 93,8%) | 100% mapeada (34/34, 8 casos — [`abordagem-manual.md`](../iteracao-2/abordagem-manual/abordagem-manual.md)) | **100%** (32/32) |
| Casos de Teste | 98 gerados (16+34+48) | 8 necessários (mínimo comprovado) | 11 gerados |
| Alucinações | Sim — 2 casos de cobertura reivindicada e não gerada (suite-2 e suite-3), sem valores incorretos | N/A | Não — tabela de cobertura autodeclarada conferida e correta; único ponto fraco é não ter atingido o mínimo de 8 casos |

## 6. Pendências

Nenhuma pendência bloqueante para esta parte — CFG (Pessoa 1), V(G)/caminhos (Pessoa 2),
abordagem manual (Pessoa 3) e a suíte da Iteração 2 (Pessoa 5) já estavam no repositório.
Falta só a Pessoa 5 consolidar isso nos slides finais, incluindo a comparação com
[`relatorio.md`](./relatorio.md) (rubrica de regras de negócio) para reforçar o achado da
seção 2 acima: os dois critérios contam histórias diferentes sobre a suíte baseline.
